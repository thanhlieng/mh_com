import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../users/user.entity';
import { ActiveLinkService } from 'src/common/services/active-link.service';

/**
 * Cung cấp danh sách thực thể A mà account hiện tại được liên kết,
 * để FE render bộ chọn (switcher) supplier/customer.
 */
@ApiTags('account-links')
@ApiBearerAuth()
@Controller('api/account/a-links')
@UseGuards(JwtAuthGuard)
export class AccountLinksController {
  constructor(private readonly activeLinkService: ActiveLinkService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách supplier/customer (bên A) account được liên kết',
  })
  async getLinks(@GetUser() user: UserEntity) {
    return this.activeLinkService.listLinks(user);
  }
}
