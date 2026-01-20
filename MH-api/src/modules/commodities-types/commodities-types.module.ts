import { Module } from '@nestjs/common';
import { CommoditiesTypeService } from './commodities-types.service';
import { CommoditiesTypeController } from './commodities-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommoditiesTypeEntity } from './entities/commodities-types.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommoditiesTypeEntity]), RolesModule],
  controllers: [CommoditiesTypeController],
  providers: [CommoditiesTypeService],
  exports: [CommoditiesTypeService],
})
export class CommoditiesTypeModule {}
