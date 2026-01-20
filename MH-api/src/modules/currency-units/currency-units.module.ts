import { Module } from '@nestjs/common';
import { CurrencyUnitService } from './currency-units.service';
import { CurrencyUnitController } from './currency-units.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyUnitEntity } from './entities/currency-units.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyUnitEntity]), RolesModule],
  controllers: [CurrencyUnitController],
  providers: [CurrencyUnitService],
  exports: [CurrencyUnitService],
})
export class CurrencyUnitModule {}
