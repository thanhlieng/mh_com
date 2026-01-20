import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from '../roles/repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './user.entity';
import { AdminUserController, UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, UserRepository, RoleRepository],
  exports: [UsersService],
  controllers: [UsersController, AdminUserController],
})
export class UsersModule {}
