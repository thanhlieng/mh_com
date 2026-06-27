import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommonError, CommonResponse } from 'src/common/constants/common.constants';
import { UsersRole } from 'src/common/constants/user-role.constants';
import { PermissionDecoratorDto } from 'src/common/dto/permission-decorator.dto';
import { EPermissionActionKey } from 'src/common/guards/permission';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { commonResponse } from 'src/common/helper/common-response';
import { IStaffs } from '../staffs/staffs.interface';
import { IUser } from '../users/user.interface';
import { CreateRolesDto } from './dto/create-roles.dto';
import { GetModuleNameDto } from './dto/get-module-name.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { IActionModule } from './interfaces/actions_module.interface';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRoleRepository } from './repositories/user-role.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  updatePermissionRoleAdmin(permissions: string[]) {
    return this.rolesRepository.update(
      { name: UsersRole.ADMIN },
      {
        permissions: [...new Set(permissions)].filter(
          (item) =>
            ![
              EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
              EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
              EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
            ].includes(item as EPermissionActionKey),
        ),
      },
    );
  }

  async getAllCategoryRoleName(getModuleNameDto: GetModuleNameDto) {
    const { roleId } = getModuleNameDto;

    const query = this.permissionRepository
      .createQueryBuilder('permission')
      .select([
        'permission.module_name as module_name',
        `array_agg(jsonb_build_object('action', permission.action, 'description', permission.description, 'selected', false)) as actions`,
      ])
      .groupBy('permission.module_name');
    const result: IActionModule[] = await query.getRawMany();
    if (!roleId) {
      return result;
    }
    const role = await this.findOne(roleId);

    for (let i = 0; i < result.length; i++) {
      const actions = result[i].actions;
      for (let j = 0; j < actions.length; j++) {
        if (role.permissions.includes(actions[j].action)) {
          actions[j].selected = true;
        }
      }
    }

    return result;
  }

  async createPermission(permissionDecoratorDto: PermissionDecoratorDto) {
    const checkExists = await this.permissionRepository.findOne({
      where: {
        action: permissionDecoratorDto.action,
      },
    });
    if (checkExists) {
      return checkExists;
    }

    return this.permissionRepository.save({
      action: permissionDecoratorDto.action,
      description: permissionDecoratorDto.description,
      moduleName: permissionDecoratorDto.moduleName,
    });
  }

  async create(createRolesDto: CreateRolesDto) {
    return await this.rolesRepository.save(createRolesDto);
  }

  findAll(getRolesDto: GetRolesDto) {
    const { search } = getRolesDto;
    const query = this.rolesRepository.createQueryBuilder('role').where('role.is_default = false');
    if (search) {
      query.andWhere('role.name LIKE :search', {
        search: `%${search}%`,
      });
    }
    query.orderBy('created_at', 'DESC');

    return CommonPagination(getRolesDto, query);
  }

  async findOne(id: string) {
    const role = await this.rolesRepository.findOne({ where: { id } });

    if (!role) throw new NotFoundException(`Role id ${id} not found`);

    return role;
  }

  async findByRoleName(name: string) {
    return await this.rolesRepository.findOne({ where: { name } });
  }

  async update(id: string, updateRolesDto: UpdateRolesDto) {
    const role = await this.findOne(id);
    if (role.isDefault) {
      throw new BadRequestException(CommonError.ROLE_DEFAULT_CAN_NOT_UPDATE);
    }
    return this.rolesRepository.update(id, updateRolesDto);
  }

  async remove(id: string) {
    try {
      const role = await this.findOne(id);
      if (role.isDefault) {
        throw new BadRequestException(CommonError.ROLE_DEFAULT_CAN_NOT_REMOVE);
      }
      await this.rolesRepository.delete(id);

      return commonResponse(CommonResponse.SUCCESS, {});
    } catch (error) {
      if (error?.response) {
        throw new BadRequestException(error.response);
      }
      throw new BadRequestException(CommonError.ROLE_ALREADY_USE_CAN_NOT_REMOVE);
    }
  }

  async getAllPermissionsUser(user: IUser) {
    const query = this.rolesRepository
      .createQueryBuilder('role')
      .leftJoinAndMapMany('role.user_role', 'user_role', 'user_role', 'role.id = user_role.role_id')
      .select(['role.permissions as permissions'])
      .where('role.active = :active', {
        active: true,
      })
      .andWhere('user_role.user_id = :userId', {
        userId: user.id,
      });

    const result = await query.getRawMany();
    const [...permissions] = result.map((item) => [...item.permissions]);

    return [...new Set(permissions.flat())];
  }

  async createRoleUser(roleIds: string[], userId: string) {
    const roleIdsRemovedDuplicate = [...new Set(roleIds)];
    const roles = roleIdsRemovedDuplicate.map((roleId) => ({
      roleId: roleId,
      userId,
    }));
    await this.userRoleRepository.delete({
      userId: userId,
    });
    return this.userRoleRepository.save(roles);
  }

  async getRolesStaff(staff: IStaffs) {
    const query = this.userRoleRepository
      .createQueryBuilder('user_role')
      .leftJoinAndMapOne('user_role.role', 'roles', 'role', 'role.id = user_role.role_id')
      .select(['role.id as id', 'role.name as role_name'])
      .where('user_role.user_id = :userId', {
        userId: staff.userId,
      })
      .groupBy('role.id');

    return query.getRawMany();
  }

  getRolesActive() {
    return this.rolesRepository
      .createQueryBuilder('role')
      .select(['id', 'name as role_name'])
      .where('active = :active', {
        active: true,
      })
      .andWhere('is_default = false')
      .getRawMany();
  }
}
