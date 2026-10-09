import { Controller, Get, Post, Patch, Body, Query } from '@nestjs/common'
import { MarketplaceService } from './marketplace.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '@urbangar/types'
import { User } from '@urbangar/database'

@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get('providers')
  listProviders(@Query('category') category?: string, @Query('locality') locality?: string) {
    return this.marketplaceService.listProviders(category, locality)
  }

  @Post('book')
  @Roles(Role.SEEKER, Role.OWNER, Role.ADMIN)
  bookService(
    @CurrentUser() user: User,
    @Body() body: { providerProfileId: string; scheduledAt: string; notes?: string },
  ) {
    return this.marketplaceService.bookService(user.id, {
      ...body,
      scheduledAt: new Date(body.scheduledAt),
    })
  }

  @Get('bookings/mine')
  @Roles(Role.SEEKER, Role.OWNER, Role.ADMIN)
  getSeekerBookings(@CurrentUser() user: User) {
    return this.marketplaceService.getSeekerBookings(user.id)
  }

  @Patch('profile')
  @Roles(Role.PROVIDER, Role.ADMIN)
  upsertProviderProfile(
    @CurrentUser() user: User,
    @Body() body: { category: string; bio?: string; areasServed?: string[]; hourlyRate?: number; experienceYears?: number },
  ) {
    return this.marketplaceService.upsertProviderProfile(user.id, body as any)
  }

  @Get('bookings/provider')
  @Roles(Role.PROVIDER, Role.ADMIN)
  getProviderBookings(@CurrentUser() user: User) {
    return this.marketplaceService.getProviderBookings(user.id)
  }
}
