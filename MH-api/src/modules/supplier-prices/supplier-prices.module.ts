import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveTargetModule } from 'src/common/guards/active-target.module';
import { SupplierPricesService } from './supplier-prices.service';
import { SupplierPricesController } from './supplier-prices.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveTargetModule],
  providers: [SupplierPricesService],
  controllers: [SupplierPricesController],
  exports: [SupplierPricesService],
})
export class SupplierPricesModule {}
