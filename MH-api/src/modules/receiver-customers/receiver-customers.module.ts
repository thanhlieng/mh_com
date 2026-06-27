import { Module } from '@nestjs/common';
import { ReceiverCustomerService } from './receiver-customers.service';
import { ReceiverCustomerController } from './receiver-customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiverCustomerEntity } from './entities/receiver-customers.entity';
import { RolesModule } from '../roles/roles.module';
import { CustomerModule } from '../customers/customers.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReceiverCustomerEntity]), CustomerModule, RolesModule],
  controllers: [ReceiverCustomerController],
  providers: [ReceiverCustomerService],
  exports: [ReceiverCustomerService],
})
export class ReceiverCustomerModule {}
