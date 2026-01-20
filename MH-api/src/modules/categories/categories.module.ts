import { Module } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/categories.entity';
import { ItemCategoryEntity } from './entities/item-categories.entity';
import { JapanAddressService } from './services/japan-address.service';
import { JapanAddressEntity } from './entities/japan-address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      ItemCategoryEntity,
      JapanAddressEntity,
    ]),
  ],
  providers: [CategoriesService, JapanAddressService],
  controllers: [CategoriesController],
  exports: [CategoriesService, JapanAddressService],
})
export class CategoriesModule {}
