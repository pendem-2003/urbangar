import { Controller, Get, Patch, Body } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { UsersService } from './users.service'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '@urbangar/types'
import { User } from '@urbangar/database'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.getMe(user.id)
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() body: { name?: string; email?: string }) {
    return this.usersService.updateMe(user.id, body)
  }

  @Get('me/saved')
  getSaved(@CurrentUser() user: User) {
    return this.usersService.getSavedProperties(user.id)
  }
}

@Controller('seeker')
@Roles(Role.SEEKER, Role.ADMIN)
export class SeekerController {
  constructor(private usersService: UsersService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: User) {
    return this.usersService.getSeekerSummary(user.id)
  }
}

@Controller('owner')
@Roles(Role.OWNER, Role.ADMIN)
export class OwnerController {
  constructor(private usersService: UsersService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: User) {
    return this.usersService.getOwnerSummary(user.id)
  }
}
