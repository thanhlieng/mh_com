import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { VirtualDeliveryAddressEntity } from './entities/virtual-delivery-address.entity';
import { VirtualDeliveryAddressController } from './virtual-delivery-address.controller';
import { VirtualDeliveryAddressService } from './virtual-delivery-address.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VirtualDeliveryAddressEntity]),
    RolesModule,
  ],
  controllers: [VirtualDeliveryAddressController],
  providers: [VirtualDeliveryAddressService],
  exports: [VirtualDeliveryAddressService],
})
export class VirtualDeliveryAddressModule {}
