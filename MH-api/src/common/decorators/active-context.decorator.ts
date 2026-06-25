import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveAContext } from 'src/common/guards/active-target.guard';

/**
 * Lấy `ActiveAContext` (target/accountType/entityIds) do `ActiveTargetGuard`
 * gắn vào request. Dùng trong controller có @UseGuards(JwtAuthGuard, ActiveTargetGuard).
 */
export const GetActiveContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): ActiveAContext => {
    const req = ctx.switchToHttp().getRequest();
    return req.activeContext as ActiveAContext;
  },
);
