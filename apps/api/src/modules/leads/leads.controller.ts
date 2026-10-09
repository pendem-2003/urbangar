import { Controller, Get, Post, Patch, Body, Query } from '@nestjs/common'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { LeadsService } from './leads.service'
import { User } from '@urbangar/database'
import { Role } from '@urbangar/types'

@Controller('broker')
@Roles(Role.BROKER, Role.ADMIN)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.leadsService.getBrokerStats(user.id)
  }

  @Get('nudges')
  getNudges(@CurrentUser() user: User, @Query('limit') limit?: string) {
    return this.leadsService.getBrokerNudges(user.id, limit ? Number(limit) : undefined)
  }

  @Post('nudges/send')
  sendNudge(
    @Body('propertyId') propertyId: string,
    @Body('seekerId') seekerId: string,
    @CurrentUser() user: User,
  ) {
    return this.leadsService.sendNudge(propertyId, seekerId, user.id)
  }

  @Get('listings')
  getListings(@CurrentUser() user: User): Promise<any> {
    return this.leadsService.getBrokerListings(user.id)
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return this.leadsService.getBrokerProfileDetails(user.id)
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: User,
    @Body() body: { reraNumber?: string; agencyName?: string; bio?: string },
  ) {
    return this.leadsService.updateBrokerProfile(user.id, body)
  }

  @Get('leads')
  getLeads(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.leadsService.getBrokerLeads(user.id, status, q)
  }
}
