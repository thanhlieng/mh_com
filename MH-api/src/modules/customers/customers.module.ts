import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { ServiceModule } from '../services-booking/services.module';
import { StaffsModule } from '../staffs/staffs.module';
import { UsersModule } from '../users/users.module';
import { CustomerController } from './customers.controller';
import { CustomerService } from './customers.service';
import { ContractEntity } from './entities/contract.entity';
import { CustomersEntity } from './entities/customers.entity';
import { ManagementStaffEntity } from './entities/management-staff.entity';
import { OtherPriceEntity } from './entities/other-price.entity';
import { PriceListEntity } from './entities/price-list.entity';
import { CustomerRepository } from './repositories/customer.repository';
import { ManagementStaffRepository } from './repositories/management-staff.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomersEntity,
      PriceListEntity,
      ManagementStaffEntity,
      ContractEntity,
      OtherPriceEntity,
    ]),
    forwardRef(() => ServiceModule),
    RolesModule,
    forwardRef(() => UsersModule),
    StaffsModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository, ManagementStaffRepository],
  exports: [CustomerService],
})
export class CustomerModule {}
