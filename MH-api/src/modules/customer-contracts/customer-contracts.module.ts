import { Module } from '@nestjs/common';
import { CustomerContractService } from './customer-contracts.service';
import { CustomerContractController } from './customer-contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerContractEntity } from './entities/customer-contracts.entity';
import { RolesModule } from '../roles/roles.module';
import { CustomerModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerContractEntity]),
    RolesModule,
    CustomerModule,
  ],
  controllers: [CustomerContractController],
  providers: [CustomerContractService],
})
export class CustomerContractModule {}
