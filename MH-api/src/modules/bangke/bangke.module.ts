import { Module } from '@nestjs/common';
import { SystemAIntegrationModule } from '../system-a-integration/system-a-integration.module';
import { BangKeService } from './bangke.service';
import { BangKeController } from './bangke.controller';

@Module({
  imports: [SystemAIntegrationModule],
  providers: [BangKeService],
  controllers: [BangKeController],
  exports: [BangKeService],
})
export class BangKeModule {}
