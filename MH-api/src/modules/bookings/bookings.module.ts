// bookings.module.ts
// bookings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostcodeDataModule } from '../postcode-data/postcode-data.module';
import { CategoriesModule } from '../categories/categories.module';
import { CommoditiesTypeModule } from '../commodities-types/commodities-types.module';
import { CurrencyUnitModule } from '../currency-units/currency-units.module';
import { CustomersEntity } from '../customers/entities/customers.entity';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ManagementStaffRepository } from '../customers/repositories/management-staff.repository';
import { DeliveryConditionsModule } from '../delivery-conditions/delivery-conditions.module';
import { InvoiceModule } from '../invoices/invoices.module';
import { PuDeliveriesModule } from '../pu-deliveries/pu-deliveries.module';
import { PUDeliveryRepository } from '../pu-deliveries/repositories/pu-deliveries.repository';
import { RolesModule } from '../roles/roles.module';
import { ServiceBookingRepository } from '../services-booking/repositories/service.repository';
import { ServiceModule } from '../services-booking/services.module';
import { ShippingItemModule } from '../shipping-items/shipping-items.module';
import { StaffsModule } from '../staffs/staffs.module';
import { TrackingRepository } from '../trackings/repositories/tracking.repository';
import { TrackingsModule } from '../trackings/trackings.module';
import { TypeOfPaymentModule } from '../type-of-payments/type-of-payments.module';
import { UsersModule } from '../users/users.module';
import { VirtualDeliveryAddressModule } from '../virtual-delivery-address/virtual-delivery-address.module';
import { BookingAdminController } from './controllers/booking.admin.controller';
import { PostcodeController } from './controllers/booking.postcode.controller';
import { BookingController } from './controllers/bookings.controller';
import { BookingDetailEntity } from './entities/booking-detail.entity';
import { BookingEntity } from './entities/bookings.entity';
import { PostCodeEntity } from './entities/postcode.entity';
import { BookingRepository } from './repositories/booking.repository';
import { BookingService } from './services/bookings.service';
import { GenerateBillService } from './services/generate-bill.service';
import { ManageManifestService } from './services/manage-manifest.service';
import { PostCodeService } from './services/postcode.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, BookingDetailEntity, PostCodeEntity, CustomersEntity]),
    RolesModule,
    UsersModule,
    InvoiceModule,
    DeliveryConditionsModule,
    VirtualDeliveryAddressModule,
    CurrencyUnitModule,
    TrackingsModule,
    StaffsModule,
    PuDeliveriesModule,
    CommoditiesTypeModule,
    ShippingItemModule,
    TypeOfPaymentModule,
    ServiceModule,
    PuDeliveriesModule,
    CategoriesModule,
    PostcodeDataModule,
  ],
  controllers: [PostcodeController, BookingAdminController, BookingController],
  providers: [
    BookingService,
    GenerateBillService,
    PostCodeService,
    ManageManifestService,
    BookingRepository,
    TrackingRepository,
    CustomerRepository,
    ManagementStaffRepository,
    ServiceBookingRepository,
    PUDeliveryRepository,
  ],
  exports: [BookingService, GenerateBillService, BookingRepository],
})
export class BookingModule {}
