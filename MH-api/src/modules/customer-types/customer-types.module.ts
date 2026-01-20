import { Module } from '@nestjs/common';
import { CustomerTypeService } from './customer-types.service';
import { CustomerTypeController } from './customer-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerTypeEntity } from './entities/customer-types.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerTypeEntity]), RolesModule],
  controllers: [CustomerTypeController],
  providers: [CustomerTypeService],
})
export class CustomerTypeModule {}
