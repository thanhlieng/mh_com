import { Module } from '@nestjs/common';
import { SystemAIntegrationModule } from '../system-a-integration/system-a-integration.module';
import { SupplierChangeRequestsService } from './supplier-change-requests.service';
import { SupplierChangeRequestsController } from './supplier-change-requests.controller';

@Module({
  imports: [SystemAIntegrationModule],
  providers: [SupplierChangeRequestsService],
  controllers: [SupplierChangeRequestsController],
  exports: [SupplierChangeRequestsService],
})
export class SupplierChangeRequestsModule {}
