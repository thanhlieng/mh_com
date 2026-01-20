import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { IUser } from '../user.interface';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async findCustomerOrStaffByUsername(username: string): Promise<IUser> {
    const user = await this.createQueryBuilder('user')
      .leftJoinAndMapOne('user.customer', 'customers', 'c', 'c.user_id = user.id')
      .leftJoinAndMapOne('user.staff', 'staffs', 's', 's.user_id = user.id')
      .where('user.username = :username', { username })
      .getOne();

    return user as IUser;
  }
}
