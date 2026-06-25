import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { ETypeUser } from '@constants/common.constants';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { EATarget } from '../users/entities/user-a-link.entity';
import {
  DirectoryQuery,
  MhvnDirectoryService,
} from './mhvn-directory.service';

/**
 * Danh mục supplier/customer (bên hệ A) phục vụ màn **web admin** tạo/liên kết
 * tài khoản NCC ở mhcom. Chỉ ADMIN được gọi.
 *
 * Admin chọn target qua query `?target=mhvn|gp` (không dùng `ActiveTargetGuard`
 * vì admin thường không có user_a_links).
 */
@ApiTags('mhvn-directory')
@ApiBearerAuth()
@Controller('api/directory')
@UseGuards(JwtAuthGuard)
export class MhvnDirectoryController {
  constructor(private readonly mhvnDirectoryService: MhvnDirectoryService) {}

  private assertAdmin(user: IJwtPayload) {
    if (user?.typeUser !== ETypeUser.ADMIN) {
      throw new ForbiddenException(
        'Chỉ quản trị viên mới được truy cập danh mục này.',
      );
    }
  }

  private parseTarget(target?: string): EATarget {
    const lower = String(target ?? '').toLowerCase();
    if (lower !== EATarget.MHVN && lower !== EATarget.GP) {
      throw new BadRequestException(
        "Query 'target' bắt buộc và phải là 'mhvn' hoặc 'gp'.",
      );
    }
    return lower as EATarget;
  }

  @Get('suppliers')
  @ApiQuery({ name: 'target', required: true, enum: EATarget })
  @ApiOperation({ summary: 'Danh sách NCC (bên hệ A) — chỉ ADMIN' })
  async getSuppliers(
    @GetUser() user: IJwtPayload,
    @Query('target') target: string,
    @Query() query: DirectoryQuery,
  ) {
    this.assertAdmin(user);
    return this.mhvnDirectoryService.getSuppliers(this.parseTarget(target), query);
  }

  @Get('customers')
  @ApiQuery({ name: 'target', required: true, enum: EATarget })
  @ApiOperation({ summary: 'Danh sách khách hàng (bên hệ A) — chỉ ADMIN' })
  async getCustomers(
    @GetUser() user: IJwtPayload,
    @Query('target') target: string,
    @Query() query: DirectoryQuery,
  ) {
    this.assertAdmin(user);
    return this.mhvnDirectoryService.getCustomers(this.parseTarget(target), query);
  }
}
