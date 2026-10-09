import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { AdminService } from './admin.service'
import { User } from '@urbangar/database'
import { Role } from '@urbangar/types'

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats(): Promise<any> {
    return this.adminService.getDashboardStats()
  }

  @Get('approvals')
  getPendingApprovals(@Query('page') page?: string, @Query('limit') limit?: string): Promise<any> {
    return this.adminService.getPendingApprovals(Number(page ?? 1), Number(limit ?? 20))
  }

  @Patch('approvals/:id/approve')
  approveProperty(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.adminService.approveProperty(id, user.id)
  }

  @Patch('approvals/:id/reject')
  rejectProperty(@Param('id') id: string, @CurrentUser() user: User, @Body('reason') reason: string): Promise<any> {
    return this.adminService.rejectProperty(id, user.id, reason)
  }

  @Get('pending-edits')
  getPendingEdits(@Query('page') page?: string, @Query('limit') limit?: string): Promise<any> {
    return this.adminService.getPendingEdits(Number(page ?? 1), Number(limit ?? 20))
  }

  @Patch('pending-edits/:id/approve')
  approvePendingEdit(@Param('id') id: string, @CurrentUser() user: User): Promise<any> {
    return this.adminService.approvePendingEdit(id, user.id)
  }

  @Patch('pending-edits/:id/reject')
  rejectPendingEdit(@Param('id') id: string, @CurrentUser() user: User, @Body('reason') reason: string): Promise<any> {
    return this.adminService.rejectPendingEdit(id, user.id, reason)
  }

  @Get('config')
  getPlatformConfig(): Promise<any> {
    return this.adminService.getPlatformConfig()
  }

  @Patch('config')
  updatePlatformConfig(@Body('key') key: string, @Body('value') value: string, @CurrentUser() user: User): Promise<any> {
    return this.adminService.updatePlatformConfig(key, value, user.id)
  }

  @Get('users')
  getUsers(@Query('page') page?: string, @Query('q') q?: string): Promise<any> {
    return this.adminService.getUsers(Number(page ?? 1), 50, q)
  }

  @Patch('users/:id/toggle')
  toggleUserActive(@Param('id') id: string): Promise<any> {
    return this.adminService.toggleUserActive(id)
  }
}
