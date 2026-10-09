import { Module } from '@nestjs/common'
import { LeasesService } from './leases.service'
import { LeasesController } from './leases.controller'
import { SearchService } from '../../common/services/search.service'

@Module({
  providers: [LeasesService, SearchService],
  controllers: [LeasesController],
  exports: [LeasesService],
})
export class LeasesModule {}
