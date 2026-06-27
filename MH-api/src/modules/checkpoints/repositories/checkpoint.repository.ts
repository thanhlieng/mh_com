import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CheckpointsEntity } from '../entities/checkpoints.entity';

@Injectable()
export class CheckpointRepository extends Repository<CheckpointsEntity> {
  constructor(private dataSource: DataSource) {
    super(CheckpointsEntity, dataSource.createEntityManager());
  }
}
