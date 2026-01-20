import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCodeEntity } from '../bookings/entities/postcode.entity';
import { PostcodeDataService } from './services/postcode-data.service';
import { PostcodeDataController } from './controllers/postcode-data.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostCodeEntity])],
  controllers: [PostcodeDataController],
  providers: [PostcodeDataService],
  exports: [PostcodeDataService],
})
export class PostcodeDataModule {}