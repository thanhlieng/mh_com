import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingModule } from '../bookings/bookings.module';
import { CheckpointsModule } from '../checkpoints/checkpoints.module';
import { CheckpointRepository } from '../checkpoints/repositories/checkpoint.repository';
import { RolesModule } from '../roles/roles.module';
import { ServiceModule } from '../services-booking/services.module';
import { TrackingsEntity } from './entities/trackings.entity';
import { TrackingRepository } from './repositories/tracking.repository';
import { TrackingsController } from './trackings.controller';
import { TrackingsService } from './trackings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingsEntity]),
    forwardRef(() => BookingModule),
    RolesModule,
    ServiceModule,
    forwardRef(() => CheckpointsModule),
  ],
  controllers: [TrackingsController],
  providers: [TrackingsService, TrackingRepository, CheckpointRepository],
  exports: [TrackingsService],
})
export class TrackingsModule {}
