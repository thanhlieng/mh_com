import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../users/user.entity';
import {
  AccountTargetsResult,
  ActiveLinkService,
} from 'src/common/services/active-link.service';

/**
 * Cung cấp danh sách target hệ A (mhvn/gp) mà account hiện tại được liên kết,
 * gồm `account_type` cố định và danh sách `entity_ids` cho từng target — để FE
 * render switcher target + switcher entity (nếu account có nhiều supplier).
 */
@ApiTags('account-links')
@ApiBearerAuth()
@Controller('api/account')
@UseGuards(JwtAuthGuard)
export class AccountLinksController {
  constructor(private readonly activeLinkService: ActiveLinkService) {}

  @Get('a-targets')
  @ApiOperation({
    summary:
      'Danh sách target (mhvn/gp) + entity ids account được liên kết, kèm account_type',
  })
  async getATargets(@GetUser() user: UserEntity): Promise<AccountTargetsResult> {
    return this.activeLinkService.listLinksByTarget(user);
  }
}
