import { SetMetadata } from '@nestjs/common';
import { PermissionDecoratorDto } from '../dto/permission-decorator.dto';

export const PERMISSION_KEY = 'permission';
export const Permission = (...permissions: PermissionDecoratorDto[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
