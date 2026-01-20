import { Module } from '@nestjs/common';
import { ShippingItemService } from './shipping-items.service';
import { ShippingItemController } from './shipping-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingItemEntity } from './entities/shipping-items.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingItemEntity]), RolesModule],
  controllers: [ShippingItemController],
  providers: [ShippingItemService],
  exports: [ShippingItemService],
})
export class ShippingItemModule {}
