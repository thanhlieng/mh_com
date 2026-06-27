import { Module } from '@nestjs/common';
import { ActiveLinkService } from './active-link.service';

/**
 * Cung cấp ActiveLinkService (resolver thực thể A active) cho các module proxy.
 * DataSource là global provider nên không cần TypeOrmModule.forFeature.
 */
@Module({
  providers: [ActiveLinkService],
  exports: [ActiveLinkService],
})
export class ActiveLinkModule {}
