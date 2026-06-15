import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { SupplierOrderSearchService } from './supplier-order-search.service';
import { SupplierOrderSearchController } from './supplier-order-search.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveLinkModule],
  providers: [SupplierOrderSearchService],
  controllers: [SupplierOrderSearchController],
  exports: [SupplierOrderSearchService],
})
export class SupplierOrderSearchModule {}
