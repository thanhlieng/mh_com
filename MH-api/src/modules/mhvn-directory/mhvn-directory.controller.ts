import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { ETypeUser } from '@constants/common.constants';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { DirectoryQuery, MhvnDirectoryService } from './mhvn-directory.service';

/**
 * Danh mục supplier/customer (bên mhvn) phục vụ màn **web admin** tạo/liên kết
 * tài khoản NCC ở mhcom. Chỉ ADMIN được gọi.
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

  @Get('suppliers')
  @ApiOperation({ summary: 'Danh sách nhà cung cấp (bên mhvn) — chỉ ADMIN' })
  async getSuppliers(
    @GetUser() user: IJwtPayload,
    @Query() query: DirectoryQuery,
  ) {
    this.assertAdmin(user);
    return this.mhvnDirectoryService.getSuppliers(query);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Danh sách khách hàng (bên mhvn) — chỉ ADMIN' })
  async getCustomers(
    @GetUser() user: IJwtPayload,
    @Query() query: DirectoryQuery,
  ) {
    this.assertAdmin(user);
    return this.mhvnDirectoryService.getCustomers(query);
  }
}
