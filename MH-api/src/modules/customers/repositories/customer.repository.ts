import { CommonError } from '@constants/common.constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CustomersEntity } from '../entities/customers.entity';

@Injectable()
export class CustomerRepository extends Repository<CustomersEntity> {
  constructor(private dataSource: DataSource) {
    super(CustomersEntity, dataSource.createEntityManager());
  }

  async getCustomerByUserID(id: string) {
    const customer: any = await this.createQueryBuilder('customer')
      .leftJoinAndMapOne('customer.user', 'users', 'user', 'customer.user_id = user.id')
      .leftJoinAndMapOne('customer.unit', 'units', 'unit', 'customer.unit_id = unit.id')
      .where('user.id = :userId', {
        userId: id,
      })
      .getOne();

    if (!customer) {
      throw new NotFoundException(CommonError.NOT_FOUND_CUSTOMER);
    }

    return customer;
  }

  async getCustomerByUserIDV2(userID: string) {
    const customer: any = await this.createQueryBuilder('customer')
      .leftJoinAndMapOne('customer.user', 'users', 'user', 'customer.user_id = user.id')
      .leftJoinAndMapOne('customer.unit', 'units', 'unit', 'customer.unit_id = unit.id')
      .where('user.id = :userId', {
        userId: userID,
      })
      .getOne();

    return customer;
  }

  async getCustomerByCustomerCode(customerCode: string) {
    const customer = await this.findOne({
      where: {
        customerCode,
      },
    });

    if (!customer) {
      throw new NotFoundException(CommonError.NOT_FOUND_CUSTOMER);
    }

    return customer;
  }
}
