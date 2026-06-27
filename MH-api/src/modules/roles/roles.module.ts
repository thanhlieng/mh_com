import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permissions.entity';
import { RolesEntity } from './entities/roles.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolesEntity, PermissionEntity, UserRoleEntity])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository, PermissionRepository, UserRoleRepository],
  exports: [RolesService],
})
export class RolesModule {}
