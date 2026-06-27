import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MLExchangeRateEntity } from './entities/ml-exchange-rate.entity';

@Injectable()
export class MLExchangeRateRepository extends Repository<MLExchangeRateEntity> {
  constructor(private dataSource: DataSource) {
    super(MLExchangeRateEntity, dataSource.createEntityManager());
  }

  async getExchangeRates(currency: string, dateTimes: string[]): Promise<MLExchangeRateEntity[]> {
    const query = this.createQueryBuilder('ml_er').where('ml_er.from_currency = :currency', { currency });

    const timeApplies = [];
    let parameters = {};
    for (let i = 0; i < dateTimes.length; i++) {
      timeApplies.push(`(time_apply_from <= :timeApplyFrom${i} AND time_apply_to >= :timeApplyTo${i})`);
      parameters[`timeApplyFrom${i}`] = dateTimes[i];
      parameters[`timeApplyTo${i}`] = dateTimes[i];
    }
    if(timeApplies.length > 0) {
        query.andWhere(`(${timeApplies.join(' OR ')})`, parameters);
    }

    return query.getMany();
  }
}
