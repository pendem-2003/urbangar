import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { SendOtpDto, VerifyOtpDto } from './dto/auth.dto'
import { Role } from '@urbangar/types'
import { JWT_EXPIRY, OTP_EXPIRY_SECONDS } from '@urbangar/config'
import axios from 'axios'
import * as bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<{ message: string; isExisting: boolean }> {
    const phone = dto.phone

    const user = await this.prisma.user.findUnique({ where: { phone } })
    if (user && user.otpAttempts >= 5 && user.otpExpiresAt && user.otpExpiresAt > new Date()) {
      throw new HttpException('Too many OTP requests. Try again in 5 minutes.', HttpStatus.TOO_MANY_REQUESTS)
    }

    // isExisting = user has already completed onboarding (has a name)
    const isExisting = !!(user?.name)

    const otp = String(randomInt(100000, 999999))
    const otpHash = await bcrypt.hash(otp, 10)
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000)

    await this.prisma.user.upsert({
      where: { phone },
      create: { phone, otpHash, otpExpiresAt, otpAttempts: 1 },
      update: { otpHash, otpExpiresAt, otpAttempts: { increment: 1 } },
    })

    await this.dispatchOtp(phone, otp)
    return { message: 'OTP sent successfully', isExisting }
  }

  async setupRole(
    userId: string,
    role: Role,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (role === Role.ADMIN) {
      throw new BadRequestException('Cannot assign ADMIN role via signup')
    }

    await this.prisma.user.update({ where: { id: userId }, data: { role } })

    // Create empty sub-profile so downstream queries always find one
    if (role === Role.BROKER) {
      await this.prisma.brokerProfile.upsert({
        where: { userId },
        create: { userId },
        update: {},
      })
    }
    if (role === Role.PROVIDER) {
      // ProviderProfile requires a category — defer creation to onboarding
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    return this.generateTokens(userId, user.phone, role)
  }

  async verifyOtp(
    dto: VerifyOtpDto
  ): Promise<{ accessToken: string; refreshToken: string; isNewUser: boolean; role: string }> {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } })
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found. Please request a new one.')
    }
    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.')
    }

    const isValid = await bcrypt.compare(dto.otp, user.otpHash)
    if (!isValid) throw new UnauthorizedException('Invalid OTP')

    const isNewUser = !user.name

    // On first verify, set role if provided
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        ...(isNewUser && dto.role ? { role: dto.role } : {}),
      },
    })

    const tokens = await this.generateTokens(updatedUser.id, updatedUser.phone, updatedUser.role)
    return { ...tokens, isNewUser, role: updatedUser.role }
  }

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } })
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } })
    if (!user || !user.isActive) throw new UnauthorizedException('Account disabled')

    // Rotate: delete old, issue new
    await this.prisma.refreshToken.delete({ where: { token } })
    return this.generateTokens(user.id, user.phone, user.role)
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  private async generateTokens(userId: string, phone: string, role: string) {
    const payload = { sub: userId, phone, role }

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: JWT_EXPIRY.ACCESS,
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: JWT_EXPIRY.REFRESH,
    })

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return { accessToken, refreshToken }
  }

  private async dispatchOtp(phone: string, otp: string): Promise<void> {
    const authKey = this.config.get('MSG91_AUTH_KEY')
    const templateId = this.config.get('MSG91_TEMPLATE_ID')

    if (!authKey || !templateId) {
      // Dev mode: log OTP to console
      console.log(`[DEV OTP] Phone: ${phone} | OTP: ${otp}`)
      return
    }

    try {
      await axios.post(
        'https://api.msg91.com/api/v5/otp',
        {
          template_id: templateId,
          mobile: `91${phone}`,
          authkey: authKey,
          otp,
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
    } catch {
      // Log but don't crash — OTP still stored in DB for dev
      console.error(`[MSG91] Failed to send OTP to ${phone}`)
    }
  }
}
