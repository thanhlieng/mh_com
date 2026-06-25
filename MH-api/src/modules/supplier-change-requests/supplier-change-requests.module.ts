import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveTargetModule } from 'src/common/guards/active-target.module';
import { SupplierChangeRequestsService } from './supplier-change-requests.service';
import { SupplierChangeRequestsController } from './supplier-change-requests.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveTargetModule],
  providers: [SupplierChangeRequestsService],
  controllers: [SupplierChangeRequestsController],
  exports: [SupplierChangeRequestsService],
})
export class SupplierChangeRequestsModule {}
