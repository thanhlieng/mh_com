import { Module } from '@nestjs/common';
import { SystemAIntegrationModule } from '../system-a-integration/system-a-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { SupplierChiHoFilesService } from './supplier-chiho-files.service';
import { SupplierChiHoFilesController } from './supplier-chiho-files.controller';

@Module({
  imports: [SystemAIntegrationModule, ActiveLinkModule],
  providers: [SupplierChiHoFilesService],
  controllers: [SupplierChiHoFilesController],
  exports: [SupplierChiHoFilesService],
})
export class SupplierChiHoFilesModule {}
