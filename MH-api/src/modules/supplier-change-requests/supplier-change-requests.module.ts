import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { SupplierChangeRequestsService } from './supplier-change-requests.service';
import { SupplierChangeRequestsController } from './supplier-change-requests.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveLinkModule],
  providers: [SupplierChangeRequestsService],
  controllers: [SupplierChangeRequestsController],
  exports: [SupplierChangeRequestsService],
})
export class SupplierChangeRequestsModule {}
