import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingModule } from '../bookings/bookings.module';
import { RolesModule } from '../roles/roles.module';
import { StaffsModule } from '../staffs/staffs.module';
import { StaffRepository } from '../staffs/staffs.repository';
import { FinanceCPNEntity } from './entities/finance-cpn.entity';
import { FinanceAndStatisticalController } from './finance-statistical.controller';
import { FinanceAndStatisticalService } from './finance-statistical.service';
import { FinanceStatisticalRepository } from './finance-statistical.repository';
import { MLExchangeRateRepository } from '../ml-exchange-rate/ml-exchange-rate.repository';
import { PUDeliveryRepository } from '../pu-deliveries/repositories/pu-deliveries.repository';
import { ServiceBookingRepository } from '../services-booking/repositories/service.repository';

@Module({
  imports: [RolesModule, BookingModule, TypeOrmModule.forFeature([FinanceCPNEntity]), StaffsModule],
  controllers: [FinanceAndStatisticalController],
  providers: [
    FinanceAndStatisticalService,
    StaffRepository,
    FinanceStatisticalRepository,
    MLExchangeRateRepository,
    PUDeliveryRepository,
    ServiceBookingRepository
  ],
  exports: [
    FinanceAndStatisticalService
  ]
})
export class FinanceAndStatisticalModule {}
