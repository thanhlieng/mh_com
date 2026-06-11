import { Module } from '@nestjs/common';
import { SystemAIntegrationModule } from '../system-a-integration/system-a-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { SupplierTransactionsService } from './supplier-transactions.service';
import { SupplierTransactionsController } from './supplier-transactions.controller';

@Module({
  imports: [SystemAIntegrationModule, ActiveLinkModule],
  providers: [SupplierTransactionsService],
  controllers: [SupplierTransactionsController],
  exports: [SupplierTransactionsService],
})
export class SupplierTransactionsModule {}
