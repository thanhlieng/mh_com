import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveTargetModule } from 'src/common/guards/active-target.module';
import { SupplierChiHoFilesService } from './supplier-chiho-files.service';
import { SupplierChiHoFilesController } from './supplier-chiho-files.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveTargetModule],
  providers: [SupplierChiHoFilesService],
  controllers: [SupplierChiHoFilesController],
  exports: [SupplierChiHoFilesService],
})
export class SupplierChiHoFilesModule {}
