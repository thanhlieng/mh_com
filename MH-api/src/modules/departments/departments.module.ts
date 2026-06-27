import { Module } from '@nestjs/common';
import { DepartmentService } from './departments.service';
import { DepartmentController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from './entities/departments.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity]), RolesModule],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
