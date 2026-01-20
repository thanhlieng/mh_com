import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TrackingsEntity } from '../entities/trackings.entity';

@Injectable()
export class TrackingRepository extends Repository<TrackingsEntity> {
  constructor(private dataSource: DataSource) {
    super(TrackingsEntity, dataSource.createEntityManager());
  }
}
