import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveTargetModule } from 'src/common/guards/active-target.module';
import { SupplierOrderSearchService } from './supplier-order-search.service';
import { SupplierOrderSearchController } from './supplier-order-search.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveTargetModule],
  providers: [SupplierOrderSearchService],
  controllers: [SupplierOrderSearchController],
  exports: [SupplierOrderSearchService],
})
export class SupplierOrderSearchModule {}
