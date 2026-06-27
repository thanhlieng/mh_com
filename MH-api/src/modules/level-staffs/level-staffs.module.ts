import { Module } from '@nestjs/common';
import { LevelStaffsService } from './level-staffs.service';
import { LevelStaffsController } from './level-staffs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelStaffsEntity } from './entities/level-staffs.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([LevelStaffsEntity]), RolesModule],
  controllers: [LevelStaffsController],
  providers: [LevelStaffsService],
})
export class LevelStaffsModule {}
