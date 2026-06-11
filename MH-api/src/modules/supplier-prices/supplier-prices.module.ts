import { Module } from '@nestjs/common';
import { SystemAIntegrationModule } from '../system-a-integration/system-a-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { SupplierPricesService } from './supplier-prices.service';
import { SupplierPricesController } from './supplier-prices.controller';

@Module({
  imports: [SystemAIntegrationModule, ActiveLinkModule],
  providers: [SupplierPricesService],
  controllers: [SupplierPricesController],
  exports: [SupplierPricesService],
})
export class SupplierPricesModule {}
