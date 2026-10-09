import { Controller, Post, Patch, Get, Param, Body } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { User } from '@urbangar/database'

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post('contact/:propertyId')
  contactBroker(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: User,
    @Body('message') message?: string,
  ) {
    return this.bookingsService.contactBroker(propertyId, user.id, message)
  }

  @Post('visit/:propertyId')
  scheduleVisit(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: User,
    @Body('scheduledAt') scheduledAt: string,
    @Body('notes') notes?: string,
  ) {
    return this.bookingsService.scheduleVisit(propertyId, user.id, new Date(scheduledAt), notes)
  }

  @Patch(':id/confirm')
  confirmVisit(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.confirmVisit(id, user.id)
  }

  @Get('me')
  getMyBookings(@CurrentUser() user: User) {
    return this.bookingsService.getSeekerBookings(user.id)
  }
}
