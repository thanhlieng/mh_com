import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TrackingsService } from '../trackings/trackings.service';
import { VirtualDeliveryAddressService } from '../virtual-delivery-address/virtual-delivery-address.service';
import { FinanceAndStatisticalService } from '../finance-statistical/finance-statistical.service';
import { nodeEnvConfig } from 'src/configs/configs.constants';

@Injectable()
export class CronJobService {
  constructor(
    private readonly virtualDeliveryAddressService: VirtualDeliveryAddressService,
    private readonly trackingService: TrackingsService,
    private readonly financeAndStatisticalService: FinanceAndStatisticalService,
  ) {}

  @Cron('0 0 * * 1')
  async updateEveryWeek() {
    await this.virtualDeliveryAddressService.refreshDataEveryWeek();
  }

  @Cron('*/5 * * * *')
  async syncShipmentDate() {
    if(nodeEnvConfig !== 'local'){
      await this.trackingService.syncDeliveryDate();
    }
  }

  // @Cron('*/5 * * * * *')
  // async syncExchangeRate() {
  //   await this.financeAndStatisticalService.syncExchangeRate()
  // }

  // @Cron('58 17 18 * *')
  // async syncCheckpointTime() {
  //   await this.trackingService.syncOldDeliveryDate();
  // }
}
