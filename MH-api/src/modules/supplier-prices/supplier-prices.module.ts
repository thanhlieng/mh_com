import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { SupplierPricesService } from './supplier-prices.service';
import { SupplierPricesController } from './supplier-prices.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveLinkModule],
  providers: [SupplierPricesService],
  controllers: [SupplierPricesController],
  exports: [SupplierPricesService],
})
export class SupplierPricesModule {}
