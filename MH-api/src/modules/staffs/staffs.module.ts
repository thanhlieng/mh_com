import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { StaffsEntity } from './entities/staffs.entity';
import { StaffsController } from './staffs.controller';
import { StaffRepository } from './staffs.repository';
import { StaffsService } from './staffs.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaffsEntity]), RolesModule, forwardRef(() => UsersModule)],
  controllers: [StaffsController],
  providers: [StaffsService, StaffRepository],
  exports: [StaffsService],
})
export class StaffsModule {}
