import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { ActiveTargetModule } from 'src/common/guards/active-target.module';
import { BangKeService } from './bangke.service';
import { BangKeController } from './bangke.controller';

@Module({
  imports: [MhvnIntegrationModule, ActiveTargetModule],
  providers: [BangKeService],
  controllers: [BangKeController],
  exports: [BangKeService],
})
export class BangKeModule {}
