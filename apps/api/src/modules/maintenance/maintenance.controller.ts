import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common'
import { MaintenanceService } from './maintenance.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '@urbangar/types'
import { User, MaintenanceCategory, MaintenanceStatus } from '@urbangar/database'

@Controller('maintenance')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(Role.SEEKER, Role.ADMIN)
  createRequest(
    @CurrentUser() user: User,
    @Body() body: { propertyId: string; category: MaintenanceCategory; description: string; photos?: string[] },
  ) {
    return this.maintenanceService.createRequest(user.id, body)
  }

  @Get('mine')
  @Roles(Role.SEEKER, Role.ADMIN)
  getTenantRequests(@CurrentUser() user: User) {
    return this.maintenanceService.getTenantRequests(user.id)
  }

  @Get('owner')
  @Roles(Role.OWNER, Role.ADMIN)
  getOwnerRequests(@CurrentUser() user: User) {
    return this.maintenanceService.getOwnerRequests(user.id)
  }

  @Patch(':id/status')
  @Roles(Role.OWNER, Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('status') status: MaintenanceStatus,
  ) {
    return this.maintenanceService.updateStatus(id, user.id, status)
  }

  @Patch(':id/complete')
  @Roles(Role.OWNER, Role.ADMIN)
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.maintenanceService.updateStatus(id, user.id, MaintenanceStatus.RESOLVED)
  }
}
