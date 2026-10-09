import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common'
import { LeasesService } from './leases.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '@urbangar/types'
import { User } from '@urbangar/database'
import { IsDateString, IsInt, IsOptional, IsString, IsEnum, Min } from 'class-validator'
import { Type } from 'class-transformer'

class CreateLeaseDto {
  @IsString() propertyId: string
  @IsString() tenantId: string
  @IsDateString() startDate: string
  @IsDateString() endDate: string
  @IsInt() @Min(0) @Type(() => Number) monthlyRent: number
  @IsInt() @Min(0) @Type(() => Number) depositAmount: number
}

class TerminateLeaseDto {
  @IsString() reason: string
  @IsEnum(['RELEASED', 'PARTIALLY_RELEASED', 'FORFEITED']) depositStatus: 'RELEASED' | 'PARTIALLY_RELEASED' | 'FORFEITED'
  @IsInt() @Min(0) @IsOptional() @Type(() => Number) depositReturnedAmount?: number
}

@Controller('leases')
export class LeasesController {
  constructor(private leasesService: LeasesService) {}

  @Get('mine')
  @Roles(Role.SEEKER, Role.ADMIN)
  getTenantLease(@CurrentUser() user: User): Promise<any> {
    return this.leasesService.getTenantLease(user.id)
  }

  @Get('owner')
  @Roles(Role.OWNER, Role.ADMIN)
  getOwnerLeases(@CurrentUser() user: User): Promise<any> {
    return this.leasesService.getOwnerLeases(user.id)
  }

  @Get('broker')
  @Roles(Role.BROKER, Role.ADMIN)
  getBrokerLeases(@CurrentUser() user: User): Promise<any> {
    return this.leasesService.getBrokerLeases(user.id)
  }

  @Get('property/:propertyId')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  getPropertyActiveLease(@Param('propertyId') propertyId: string, @CurrentUser() user: User): Promise<any> {
    return this.leasesService.getPropertyActiveLease(propertyId, user.id, user.role)
  }

  @Get('payments/mine')
  @Roles(Role.SEEKER, Role.ADMIN)
  getTenantPayments(@CurrentUser() user: User): Promise<any> {
    return this.leasesService.getTenantPayments(user.id)
  }

  @Get('payments/owner')
  @Roles(Role.OWNER, Role.ADMIN)
  getOwnerPayments(@CurrentUser() user: User): Promise<any> {
    return this.leasesService.getOwnerPayments(user.id)
  }

  @Post()
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  createLease(@Body() dto: CreateLeaseDto, @CurrentUser() user: User): Promise<any> {
    return this.leasesService.createLease(dto, user.id, user.role)
  }

  @Patch(':id/terminate')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  terminateLease(@Param('id') id: string, @Body() dto: TerminateLeaseDto, @CurrentUser() user: User): Promise<any> {
    return this.leasesService.terminateLease(id, dto, user.id, user.role)
  }
}
