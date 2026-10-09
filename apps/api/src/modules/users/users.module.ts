import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController, SeekerController, OwnerController } from './users.controller'

@Module({
  providers: [UsersService],
  controllers: [UsersController, SeekerController, OwnerController],
  exports: [UsersService],
})
export class UsersModule {}
