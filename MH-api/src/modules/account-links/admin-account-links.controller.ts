import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { ETypeUser } from '@constants/common.constants';
import { ActiveLinkService } from 'src/common/services/active-link.service';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { SetAccountLinksDto } from './dto/set-account-links.dto';

/**
 * Quản trị liên kết account ↔ thực thể hệ A (multi-target: mhvn + gp).
 *
 * Phục vụ màn web admin (tab "Kết nối hệ A"): chọn loại account (NCC/KH) +
 * danh sách entity cho từng target. Chỉ ADMIN được thao tác.
 */
@ApiTags('admin-account-links')
@ApiBearerAuth()
@Controller('api/admin/account-links')
@UseGuards(JwtAuthGuard)
export class AdminAccountLinksController {
  constructor(private readonly activeLinkService: ActiveLinkService) {}

  private assertAdmin(user: IJwtPayload) {
    if (user?.typeUser !== ETypeUser.ADMIN) {
      throw new ForbiddenException(
        'Chỉ quản trị viên mới được quản lý liên kết hệ A.',
      );
    }
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Lấy liên kết hệ A của một account (gộp theo target) — chỉ ADMIN',
  })
  async getLinks(
    @GetUser() user: IJwtPayload,
    @Param('userId') userId: string,
  ) {
    this.assertAdmin(user);
    return this.activeLinkService.getLinksForUser(userId);
  }

  @Put(':userId')
  @ApiOperation({
    summary:
      'Thay thế toàn bộ liên kết hệ A của một account (đa target) — chỉ ADMIN',
  })
  async setLinks(
    @GetUser() user: IJwtPayload,
    @Param('userId') userId: string,
    @Body() body: SetAccountLinksDto,
  ) {
    this.assertAdmin(user);
    return this.activeLinkService.setLinksForUser(
      userId,
      body.linkType ?? null,
      body.targets ?? [],
    );
  }
}
