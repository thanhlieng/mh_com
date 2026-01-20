import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRepository } from '../bookings/repositories/booking.repository';
import { RolesModule } from '../roles/roles.module';
import { TrackingsModule } from '../trackings/trackings.module';
import { TranslateModule } from '../translate/translate.module';
import { CheckpointsController } from './checkpoints.controller';
import { CheckpointsService } from './checkpoints.service';
import { CheckpointsEntity } from './entities/checkpoints.entity';
import { CheckpointRepository } from './repositories/checkpoint.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckpointsEntity]),
    RolesModule,
    TranslateModule,
    forwardRef(() => TrackingsModule),
  ],
  controllers: [CheckpointsController],
  providers: [CheckpointsService, BookingRepository, CheckpointRepository],
  exports: [CheckpointsService],
})
export class CheckpointsModule {}
