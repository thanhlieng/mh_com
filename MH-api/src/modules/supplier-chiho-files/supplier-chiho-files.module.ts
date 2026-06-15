import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { SupplierChiHoFilesService } from './supplier-chiho-files.service';
import { SupplierChiHoFilesController } from './supplier-chiho-files.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveLinkModule],
  providers: [SupplierChiHoFilesService],
  controllers: [SupplierChiHoFilesController],
  exports: [SupplierChiHoFilesService],
})
export class SupplierChiHoFilesModule {}
