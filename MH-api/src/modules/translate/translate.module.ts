import { Module } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslateEntity } from './entities/translate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TranslateEntity])],
  providers: [TranslateService],
  exports: [TranslateService],
})
export class TranslateModule {}
