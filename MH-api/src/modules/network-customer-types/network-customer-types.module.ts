import { Module } from '@nestjs/common';
import { NetworkCustomerTypeService } from './network-customer-types.service';
import { NetworkCustomerTypeController } from './network-customer-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkCustomerTypeEntity } from './entities/network-customer-types.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkCustomerTypeEntity]), RolesModule],
  controllers: [NetworkCustomerTypeController],
  providers: [NetworkCustomerTypeService],
})
export class NetworkCustomerTypeModule {}
