import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { BangKeService } from './bangke.service';
import { BangKeController } from './bangke.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveLinkModule],
  providers: [BangKeService],
  controllers: [BangKeController],
  exports: [BangKeService],
})
export class BangKeModule {}
