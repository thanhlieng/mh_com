import { forwardRef, Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryEntity } from './entities/history.entity';
import { RolesModule } from '../roles/roles.module';
import { BookingEntity } from '../bookings/entities/bookings.entity';
import { PuDeliveriesEntity } from '../pu-deliveries/entities/pu-deliveries.entity';
import { CustomersEntity } from '../customers/entities/customers.entity';
import { BookingRepository } from '../bookings/repositories/booking.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HistoryEntity,
      CustomersEntity,
      BookingEntity,
      PuDeliveriesEntity,
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [HistoryController],
  providers: [HistoryService, BookingRepository, CustomerRepository],
  exports: [HistoryService],
})
export class HistoryModule {}
