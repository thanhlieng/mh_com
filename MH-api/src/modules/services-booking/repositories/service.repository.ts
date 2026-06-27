import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ServiceEntity } from '../entities/services.entity';

@Injectable()
export class ServiceBookingRepository extends Repository<ServiceEntity> {
  constructor(private dataSource: DataSource) {
    super(ServiceEntity, dataSource.createEntityManager());
  }
}
