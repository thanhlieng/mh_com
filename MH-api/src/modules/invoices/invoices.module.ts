import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../bookings/entities/bookings.entity';
import { BookingRepository } from '../bookings/repositories/booking.repository';
import { CustomerModule } from '../customers/customers.module';
import { RolesModule } from '../roles/roles.module';
import { InvoiceDetailEntity } from './entities/invoices-detail.entity';
import { InvoiceEntity } from './entities/invoices.entity';
import { InvoiceController } from './invoices.controller';
import { InvoiceService } from './invoices.service';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity, InvoiceDetailEntity, BookingEntity]), RolesModule, CustomerModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, BookingRepository],
  exports: [InvoiceService],
})
export class InvoiceModule {}
