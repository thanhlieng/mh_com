import { Module } from '@nestjs/common';
import { TypeOfPaymentService } from './type-of-payments.service';
import { TypeOfPaymentController } from './type-of-payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOfPaymentEntity } from './entities/type-of-payments.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOfPaymentEntity]), RolesModule],
  controllers: [TypeOfPaymentController],
  providers: [TypeOfPaymentService],
  exports: [TypeOfPaymentService],
})
export class TypeOfPaymentModule {}
