import { Module } from '@nestjs/common';
import { DeliveryConditionsService } from './delivery-conditions.service';
import { DeliveryConditionsController } from './delivery-conditions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryConditionsEntity } from './entities/delivery-conditions.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryConditionsEntity]), RolesModule],
  controllers: [DeliveryConditionsController],
  providers: [DeliveryConditionsService],
  exports: [DeliveryConditionsService],
})
export class DeliveryConditionsModule {}
