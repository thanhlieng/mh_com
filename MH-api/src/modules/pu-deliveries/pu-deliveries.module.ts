import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingModule } from '../bookings/bookings.module';
import { BookingRepository } from '../bookings/repositories/booking.repository';
import { CheckpointRepository } from '../checkpoints/repositories/checkpoint.repository';
import { CustomerModule } from '../customers/customers.module';
import { RolesModule } from '../roles/roles.module';
import { ServiceBookingRepository } from '../services-booking/repositories/service.repository';
import { StaffsModule } from '../staffs/staffs.module';
import { TrackingRepository } from '../trackings/repositories/tracking.repository';
import { TrackingsModule } from '../trackings/trackings.module';
import { CargoListController } from './controllers/cargo-list.controller';
import { PuDeliveriesController } from './controllers/pu-deliveries.controller';
import { CargoListLogEntity } from './entities/cargo-list-log.entity';
import { PuDeliveriesDetailEntity } from './entities/pu-deliveries-detail.entity';
import { PuDeliveriesEntity } from './entities/pu-deliveries.entity';
import { PUDeliveryRepository } from './repositories/pu-deliveries.repository';
import { CargoListService } from './services/cargo-list.service';
import { PuDeliveriesService } from './services/pu-deliveries.service';
import { FinanceStatisticalRepository } from '../finance-statistical/finance-statistical.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PuDeliveriesEntity, PuDeliveriesDetailEntity, CargoListLogEntity]),
    StaffsModule,
    RolesModule,
    forwardRef(() => BookingModule),
    CustomerModule,
    TrackingsModule,
  ],
  controllers: [PuDeliveriesController, CargoListController],
  providers: [
    PuDeliveriesService,
    CargoListService,
    ServiceBookingRepository,
    BookingRepository,
    TrackingRepository,
    CheckpointRepository,
    PUDeliveryRepository,
    FinanceStatisticalRepository
  ],
  exports: [PuDeliveriesService],
})
export class PuDeliveriesModule {}
