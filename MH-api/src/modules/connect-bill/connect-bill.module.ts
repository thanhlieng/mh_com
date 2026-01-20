import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharePointModule } from 'src/share-point/share-point.module';
import { BookingModule } from '../bookings/bookings.module';
import { PuDeliveriesModule } from '../pu-deliveries/pu-deliveries.module';
import { PUDeliveryRepository } from '../pu-deliveries/repositories/pu-deliveries.repository';
import { RolesModule } from '../roles/roles.module';
import { ServiceModule } from '../services-booking/services.module';
import { ConnectBillController } from './connect-bill.controller';
import { ConnectBillService } from './connect-bill.service';
import { ConnectBillEntity } from './entities/connect-bill.entity';
import { StaffRepository } from '../staffs/staffs.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectBillEntity]),
    PuDeliveriesModule,
    RolesModule,
    ServiceModule,
    SharePointModule,
    BookingModule,
  ],
  providers: [ConnectBillService, PUDeliveryRepository, StaffRepository],
  controllers: [ConnectBillController],
})
export class ConnectBillModule {}
