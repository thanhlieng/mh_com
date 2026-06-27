import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FinanceCPNEntity } from './entities/finance-cpn.entity';
import dayjs from 'dayjs';

@Injectable()
export class FinanceStatisticalRepository extends Repository<FinanceCPNEntity> {
  constructor(private dataSource: DataSource) {
    super(FinanceCPNEntity, dataSource.createEntityManager());
  }
}
