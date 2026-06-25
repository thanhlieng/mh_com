import { Module } from '@nestjs/common';
import { ActiveTargetGuard } from './active-target.guard';

/**
 * Cung cấp `ActiveTargetGuard` (resolver target A active + entity ids) cho
 * tất cả module proxy. DataSource là global provider nên không cần
 * TypeOrmModule.forFeature.
 */
@Module({
  providers: [ActiveTargetGuard],
  exports: [ActiveTargetGuard],
})
export class ActiveTargetModule {}
