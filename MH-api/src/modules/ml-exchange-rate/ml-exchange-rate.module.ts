import { Module } from '@nestjs/common';
import { MlExchangeRateController } from './ml-exchange-rate.controller';
import { MlExchangeRateService } from './ml-exchange-rate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MLExchangeRateEntity } from './entities/ml-exchange-rate.entity';
import { MLExchangeRateRepository } from './ml-exchange-rate.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MLExchangeRateEntity])],
  controllers: [MlExchangeRateController],
  providers: [MlExchangeRateService, MLExchangeRateRepository]
})
export class MlExchangeRateModule {}
