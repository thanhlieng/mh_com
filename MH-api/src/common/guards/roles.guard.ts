import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { PermissionDecoratorDto } from '../dto/permission-decorator.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<PermissionDecoratorDto[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const { user } = context.switchToHttp().getRequest();

    if (!permissions) {
      return true;
    }
    if (!user.permissions) {
      return false;
    }

    for (let i = 0; i < permissions.length; i++) {
      if ((user.permissions as string[]).includes(permissions[i].action)) {
        return true;
      }
    }

    return false;
  }
}
