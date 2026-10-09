import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
import { PlatformConfigService } from '../../common/services/platform-config.service'

@Module({
  providers: [AdminService, PlatformConfigService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
