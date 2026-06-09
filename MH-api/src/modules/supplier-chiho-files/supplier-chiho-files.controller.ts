import {
  Controller,
  Get,
  Post,
  Query,
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
import { assertSupplierLinked } from 'src/common/helper/supplier.helper';
import { SupplierChiHoFilesService } from './supplier-chiho-files.service';

/**
 * System B endpoint phục vụ màn "Quản lý chi hộ".
 * Liệt kê & upload file Chi hộ theo order, proxy sang hệ thống A theo supplier.
 */
@Controller('api/supplier/chiho-files')
@UseGuards(JwtAuthGuard)
export class SupplierChiHoFilesController {
  constructor(
    private readonly supplierChiHoFilesService: SupplierChiHoFilesService,
  ) {}

  @Get()
  async listFiles(
    @GetUser() user: UserEntity,
    @Query('order_id') orderId: string,
    @Query('include_inactive') includeInactive?: string,
  ) {
    const a_supplier_id = assertSupplierLinked(user);
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

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFiles(
    @GetUser() user: UserEntity,
    @Body('order_id') orderId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const a_supplier_id = assertSupplierLinked(user);
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
