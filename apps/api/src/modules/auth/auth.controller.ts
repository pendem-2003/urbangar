import { Controller, Post, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Role } from '@urbangar/types'
import { User } from '@urbangar/database'
import { IsEnum } from 'class-validator'

class SetupRoleDto {
  @IsEnum(Role) role: Role
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto)
  }

  @Post('verify-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto)
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken)
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken)
  }

  // Called once after OTP verify — new user picks their role, get fresh tokens with correct role claim
  @Patch('setup-role')
  @HttpCode(HttpStatus.OK)
  setupRole(@Body() dto: SetupRoleDto, @CurrentUser() user: User): Promise<any> {
    return this.authService.setupRole(user.id, dto.role as Role)
  }
}
