import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Headers,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../users/user.entity';
import { ActiveLinkService } from 'src/common/services/active-link.service';
import { SupplierChiHoFilesService } from './supplier-chiho-files.service';

/**
 * mhcom endpoint phục vụ màn "Quản lý chi hộ".
 * Liệt kê & upload file Chi hộ theo order, proxy sang hệ thống mhvn theo supplier.
 */
@Controller('api/supplier/chiho-files')
@UseGuards(JwtAuthGuard)
export class SupplierChiHoFilesController {
  constructor(
    private readonly supplierChiHoFilesService: SupplierChiHoFilesService,
    private readonly activeLinkService: ActiveLinkService,
  ) {}

  @Get('uploads')
  async listAllUploads(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Query('status') status?: string,
    @Query('include_inactive') includeInactive?: string,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    const include = ['true', '1', 'yes'].includes(
      String(includeInactive).toLowerCase(),
    );
    return this.supplierChiHoFilesService.listAllUploads(
      a_supplier_id,
      status,
      include,
    );
  }

  @Get()
  async listFiles(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Query('order_id') orderId: string,
    @Query('include_inactive') includeInactive?: string,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    if (!orderId) {
      throw new BadRequestException('order_id is required.');
    }
    const include = ['true', '1', 'yes'].includes(
      String(includeInactive).toLowerCase(),
    );
    return this.supplierChiHoFilesService.listFiles(
      a_supplier_id,
      orderId,
      include,
    );
  }

  /**
   * Xoá một yêu cầu tải lên đang ở trạng thái PENDING (do supplier upload).
   * mhvn enforce ràng buộc: file phải thuộc supplier trong token và đang PENDING.
   */
  @Delete('uploads/:id')
  async deleteUpload(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Param('id', ParseIntPipe) fileId: number,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.supplierChiHoFilesService.deleteUpload(a_supplier_id, fileId);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFiles(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Body('order_id') orderId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    if (!orderId) {
      throw new BadRequestException('order_id is required.');
    }
    return this.supplierChiHoFilesService.uploadFiles(
      a_supplier_id,
      orderId,
      files,
    );
  }
}
