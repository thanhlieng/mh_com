import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import {
  ActiveTargetGuard,
  ActiveAContext,
} from 'src/common/guards/active-target.guard';
import { GetActiveContext } from 'src/common/decorators/active-context.decorator';
import { SupplierChiHoFilesService } from './supplier-chiho-files.service';

/**
 * mhcom endpoint phục vụ màn "Quản lý chi hộ".
 * Liệt kê & upload file Chi hộ theo order, proxy sang hệ thống A theo
 * supplier + target trong header `X-A-Target`.
 */
@ApiTags('supplier-chiho-files')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/supplier/chiho-files')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class SupplierChiHoFilesController {
  constructor(
    private readonly supplierChiHoFilesService: SupplierChiHoFilesService,
  ) {}

  @Get('uploads')
  @ApiOperation({ summary: 'Tất cả file Chi hộ supplier đã upload (gộp đơn)' })
  async listAllUploads(
    @GetActiveContext() ctx: ActiveAContext,
    @Query('status') status?: string,
    @Query('include_inactive') includeInactive?: string,
  ) {
    const include = ['true', '1', 'yes'].includes(
      String(includeInactive).toLowerCase(),
    );
    return this.supplierChiHoFilesService.listAllUploads(
      ctx,
      status,
      include,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách file Chi hộ theo order' })
  async listFiles(
    @GetActiveContext() ctx: ActiveAContext,
    @Query('order_id') orderId: string,
    @Query('include_inactive') includeInactive?: string,
  ) {
    if (!orderId) {
      throw new BadRequestException('order_id is required.');
    }
    const include = ['true', '1', 'yes'].includes(
      String(includeInactive).toLowerCase(),
    );
    return this.supplierChiHoFilesService.listFiles(ctx, orderId, include);
  }

  /**
   * Xoá một yêu cầu tải lên đang ở trạng thái PENDING (do supplier upload).
   * Hệ A enforce ràng buộc: file phải thuộc supplier trong token và đang PENDING.
   */
  @Delete('uploads/:id')
  @ApiOperation({ summary: 'Xóa file Chi hộ pending' })
  async deleteUpload(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id', ParseIntPipe) fileId: number,
  ) {
    return this.supplierChiHoFilesService.deleteUpload(ctx, fileId);
  }

  @Post()
  @ApiOperation({ summary: 'Upload file Chi hộ vào order' })
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFiles(
    @GetActiveContext() ctx: ActiveAContext,
    @Body('order_id') orderId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!orderId) {
      throw new BadRequestException('order_id is required.');
    }
    return this.supplierChiHoFilesService.uploadFiles(ctx, orderId, files);
  }
}
