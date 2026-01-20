import { SetMetadata } from '@nestjs/common';
import { UsersRole } from '../constants/user-role.constants';

export const ROLES_KEY = 'role';
export const Roles = (...roles: UsersRole[]) => SetMetadata(ROLES_KEY, roles);
