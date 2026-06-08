import { Module } from '@nestjs/common';
import { SystemAIntegrationModule } from '../system-a-integration/system-a-integration.module';
import { SupplierChiHoFilesService } from './supplier-chiho-files.service';
import { SupplierChiHoFilesController } from './supplier-chiho-files.controller';

@Module({
  imports: [SystemAIntegrationModule],
  providers: [SupplierChiHoFilesService],
  controllers: [SupplierChiHoFilesController],
  exports: [SupplierChiHoFilesService],
})
export class SupplierChiHoFilesModule {}
