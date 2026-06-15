import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { SupplierTransactionsService } from './supplier-transactions.service';
import { SupplierTransactionsController } from './supplier-transactions.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveLinkModule],
  providers: [SupplierTransactionsService],
  controllers: [SupplierTransactionsController],
  exports: [SupplierTransactionsService],
})
export class SupplierTransactionsModule {}
