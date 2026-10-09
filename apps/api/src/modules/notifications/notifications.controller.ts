import { Controller, Get, Patch, Param, Query } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { User } from '@urbangar/database'

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getNotifications(user.id, Number(page ?? 1), limit ? Number(limit) : undefined)
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id)
  }

  @Patch('mark-all-read')
  markAllRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllRead(user.id)
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markRead(id, user.id)
  }
}
