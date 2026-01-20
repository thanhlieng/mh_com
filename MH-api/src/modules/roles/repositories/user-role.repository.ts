import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserRoleEntity } from '../entities/user-role.entity';

@Injectable()
export class UserRoleRepository extends Repository<UserRoleEntity> {
  constructor(private dataSource: DataSource) {
    super(UserRoleEntity, dataSource.createEntityManager());
  }
}
