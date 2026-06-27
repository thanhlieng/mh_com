import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PuDeliveriesEntity } from '../entities/pu-deliveries.entity';
import dayjs from 'dayjs';
import { DefaultTimezone } from '@constants/common.constants';

@Injectable()
export class PUDeliveryRepository extends Repository<PuDeliveriesEntity> {
  constructor(private dataSource: DataSource) {
    super(PuDeliveriesEntity, dataSource.createEntityManager());
  }

  async getExportDateByBookingIds(bookingIds: string[]): Promise<object> {
    let mapValues = {}
    const result = await this.createQueryBuilder('pu')
      .innerJoin('connect_bill', 'cb', 'cb.id = pu.connect_bill_id')
      .select([
        'cb.created_at as export_date',
        'pu.booking_id as booking_id',
      ])
      .where('pu.booking_id IN (:...bookingIds)', { bookingIds })
      .getRawMany();

    result.forEach((item) => {
      const dateTime = dayjs(item.export_date).tz(DefaultTimezone).format('YYYY-MM-DD');
      mapValues[item.booking_id] = dateTime;
    })

    return mapValues
  }
}
