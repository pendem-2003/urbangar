import { Module } from '@nestjs/common'
import { PropertiesService } from './properties.service'
import { PropertiesController } from './properties.controller'
import { SearchService } from '../../common/services/search.service'
import { UploadService } from '../../common/services/upload.service'
import { PlatformConfigService } from '../../common/services/platform-config.service'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [PropertiesService, SearchService, UploadService, PlatformConfigService],
  controllers: [PropertiesController],
  exports: [PropertiesService, SearchService, UploadService, PlatformConfigService],
})
export class PropertiesModule {}
