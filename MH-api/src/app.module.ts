import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PERMISSION_KEY } from './common/decorators/permission.decorator';
import { GlobalSeed } from './common/seed/global.seed';
import { nodeEnvConfig } from './configs/configs.constants';
import { TypeOrmModule } from './datasource/typeorm.module';
import { AddressBookModule } from './modules/address-books/address-books.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingModule } from './modules/bookings/bookings.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CheckpointsModule } from './modules/checkpoints/checkpoints.module';
import { CommoditiesTypeModule } from './modules/commodities-types/commodities-types.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ConnectBillModule } from './modules/connect-bill/connect-bill.module';
import { CronJobModule } from './modules/cron-job/cron-job.module';
import { CurrencyUnitModule } from './modules/currency-units/currency-units.module';
import { CustomerContractModule } from './modules/customer-contracts/customer-contracts.module';
import { CustomerTypeModule } from './modules/customer-types/customer-types.module';
import { CustomerModule } from './modules/customers/customers.module';
import { DeliveryConditionsModule } from './modules/delivery-conditions/delivery-conditions.module';
import { DepartmentModule } from './modules/departments/departments.module';
import { EventsModule } from './modules/events/event.module';
import { FinanceAndStatisticalModule } from './modules/finance-statistical/finance-statistical.module';
import { HistoryModule } from './modules/history/history.module';
import { HomepageModule } from './modules/homepage/homepage.module';
import { InvoiceModule } from './modules/invoices/invoices.module';
import { LevelStaffsModule } from './modules/level-staffs/level-staffs.module';
import { NetworkCustomerTypeModule } from './modules/network-customer-types/network-customer-types.module';
import { PostsModule } from './modules/posts/posts.module';
import { PuDeliveriesModule } from './modules/pu-deliveries/pu-deliveries.module';
import { RolesModule } from './modules/roles/roles.module';
import { RolesService } from './modules/roles/roles.service';
import { ServiceModule } from './modules/services-booking/services.module';
import { ShippingItemModule } from './modules/shipping-items/shipping-items.module';
import { StaffsModule } from './modules/staffs/staffs.module';
import { TrackingsModule } from './modules/trackings/trackings.module';
import { TranslateModule } from './modules/translate/translate.module';
import { TypeOfPaymentModule } from './modules/type-of-payments/type-of-payments.module';
import { UnitsModule } from './modules/units/units.module';
import { UsersModule } from './modules/users/users.module';
import { VirtualDeliveryAddressModule } from './modules/virtual-delivery-address/virtual-delivery-address.module';
import { MlExchangeRateModule } from './modules/ml-exchange-rate/ml-exchange-rate.module';
import { PostcodeDataModule } from './modules/postcode-data/postcode-data.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';
import { SystemAIntegrationModule } from './modules/system-a-integration/system-a-integration.module';
import { BangKeModule } from './modules/bangke/bangke.module';
import { SupplierTransactionsModule } from './modules/supplier-transactions/supplier-transactions.module';
import { SupplierChiHoFilesModule } from './modules/supplier-chiho-files/supplier-chiho-files.module';
import { ServicesCatalogModule } from './modules/services-catalog/services-catalog.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    RolesModule,
    CompaniesModule,
    CustomerModule,
    DepartmentModule,
    PostsModule,
    StaffsModule,
    UnitsModule,
    CustomerContractModule,
    BookingModule,
    InvoiceModule,
    CommandModule,
    LevelStaffsModule,
    CommoditiesTypeModule,
    ServiceModule,
    CustomerTypeModule,
    NetworkCustomerTypeModule,
    DeliveryConditionsModule,
    TypeOfPaymentModule,
    CurrencyUnitModule,
    ShippingItemModule,
    PuDeliveriesModule,
    VirtualDeliveryAddressModule,
    CronJobModule,
    CheckpointsModule,
    TrackingsModule,
    ConnectBillModule,
    AddressBookModule,
    // SharePointModule,
    TranslateModule,
    HomepageModule,
    DiscoveryModule,
    CategoriesModule,
    FinanceAndStatisticalModule,
    HistoryModule,
    EventsModule,
    MlExchangeRateModule,
    PostcodeDataModule,
    FileStorageModule,
    SystemAIntegrationModule,
    BangKeModule,
    SupplierTransactionsModule,
    SupplierChiHoFilesModule,
    ServicesCatalogModule,
  ],
  controllers: [AppController],
  providers: [GlobalSeed, AppService],
})
export class AppModule {
  constructor(private readonly discover: DiscoveryService, private readonly roleService: RolesService) {}

  public async onModuleInit() {
    if (nodeEnvConfig !== 'local') {
      const decoratedMethods = await this.discover.methodsAndControllerMethodsWithMetaAtKey<any>(PERMISSION_KEY);

      const permissions = [];
      for (const item of decoratedMethods) {
        for (const metaItem of item.meta) {
          if(metaItem.action && metaItem.moduleName) {
            permissions.push(metaItem.action);
            await this.roleService.createPermission({
              action: metaItem.action,
              description: metaItem.description,
              moduleName: metaItem.moduleName,
            });
          }
        }
      }

      await this.roleService.updatePermissionRoleAdmin(permissions);
    }
  }
}
