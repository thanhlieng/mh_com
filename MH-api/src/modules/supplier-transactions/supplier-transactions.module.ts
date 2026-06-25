import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveTargetModule } from 'src/common/guards/active-target.module';
import { SupplierTransactionsService } from './supplier-transactions.service';
import { SupplierTransactionsController } from './supplier-transactions.controller';
import { SupplierCostStatementExportController } from './supplier-cost-statement-export.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveTargetModule],
  providers: [SupplierTransactionsService],
  controllers: [
    SupplierTransactionsController,
    SupplierCostStatementExportController,
  ],
  exports: [SupplierTransactionsService],
})
export class SupplierTransactionsModule {}
