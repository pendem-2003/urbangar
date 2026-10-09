import { IsString, IsPhoneNumber, IsEnum, IsOptional, Length, Matches } from 'class-validator'
import { Role } from '@urbangar/types'

export class SendOtpDto {
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' })
  phone: string
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' })
  phone: string

  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string

  @IsEnum(Role)
  @IsOptional()
  role?: Role
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string
}
