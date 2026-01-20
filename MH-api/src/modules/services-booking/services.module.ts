import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from '../customers/customers.module';
import { RolesModule } from '../roles/roles.module';
import { ServiceEntity } from './entities/services.entity';
import { ZoneServiceEntity } from './entities/zone-services.entity';
import { ServiceBookingRepository } from './repositories/service.repository';
import { ServiceController } from './services.controller';
import { ServiceService } from './services.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity, ZoneServiceEntity]),
    RolesModule,
    forwardRef(() => CustomerModule),
  ],
  controllers: [ServiceController],
  providers: [ServiceService, ZoneServiceEntity, ServiceBookingRepository],
  exports: [ServiceService, ServiceBookingRepository],
})
export class ServiceModule {}
