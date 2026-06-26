import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveTargetModule } from 'src/common/guards/active-target.module';
import { SupplierQualityReportsController } from './supplier-quality-reports.controller';
import { SupplierQualityReportsService } from './supplier-quality-reports.service';

@Module({
  imports: [MhvnIntegrationModule, ActiveTargetModule],
  providers: [SupplierQualityReportsService],
  controllers: [SupplierQualityReportsController],
  exports: [SupplierQualityReportsService],
})
export class SupplierQualityReportsModule {}
