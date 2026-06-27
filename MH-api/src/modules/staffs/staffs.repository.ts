import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StaffsEntity } from './entities/staffs.entity';

@Injectable()
export class StaffRepository extends Repository<StaffsEntity> {
  constructor(private dataSource: DataSource) {
    super(StaffsEntity, dataSource.createEntityManager());
  }
}
