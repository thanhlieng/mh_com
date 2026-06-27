import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TrackingsModule } from '../trackings/trackings.module';
import { VirtualDeliveryAddressModule } from '../virtual-delivery-address/virtual-delivery-address.module';
import { CronJobService } from './cron-job.service';
import { FinanceAndStatisticalModule } from '../finance-statistical/finance-statistical.module';

@Module({
  imports: [ScheduleModule.forRoot(), VirtualDeliveryAddressModule, TrackingsModule, FinanceAndStatisticalModule],
  providers: [CronJobService],
})
export class CronJobModule {}
