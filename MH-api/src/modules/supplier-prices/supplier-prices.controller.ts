import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
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
import { SupplierPricesService } from './supplier-prices.service';

/**
 * System B endpoint phục vụ màn quản lý giá (ServiceSupplierPrice).
 * Proxy thao tác giá của supplier sang hệ thống A theo supplier active.
 */
@Controller('api/supplier/prices')
@UseGuards(JwtAuthGuard)
export class SupplierPricesController {
  constructor(
    private readonly supplierPricesService: SupplierPricesService,
    private readonly activeLinkService: ActiveLinkService,
  ) {}

  @Get()
  async getPrices(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.supplierPricesService.getPrices(a_supplier_id);
  }

  @Patch()
  async updatePrices(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Body() body: { items: any[] },
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    if (!Array.isArray(body?.items) || body.items.length === 0) {
      throw new BadRequestException('items is required.');
    }
    return this.supplierPricesService.updatePrices(a_supplier_id, body.items);
  }

  @Post('import')
  @UseInterceptors(AnyFilesInterceptor())
  async importPrices(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('currency_id') currencyId: string,
    @Body('route_type') routeType: string,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    const file = files?.[0];
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.supplierPricesService.importPrices(
      a_supplier_id,
      file,
      currencyId,
      routeType,
    );
  }

  @Get('price-changes')
  async getPriceChanges(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Query('status') status?: string,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.supplierPricesService.getPriceChanges(a_supplier_id, status);
  }

  @Delete('price-changes/:id')
  async deletePriceChange(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Param('id') id: string,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.supplierPricesService.deletePriceChange(a_supplier_id, id);
  }
}
