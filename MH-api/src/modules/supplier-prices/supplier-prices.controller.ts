import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { SupplierPricesService } from './supplier-prices.service';

/**
 * mhcom endpoint phục vụ màn quản lý giá (ServiceSupplierPrice).
 * Proxy thao tác giá của supplier sang hệ A theo supplier active + target
 * (mhvn|gp) trong header `X-A-Target`.
 */
@ApiTags('supplier-prices')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/supplier/prices')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class SupplierPricesController {
  constructor(private readonly supplierPricesService: SupplierPricesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách giá ServiceSupplierPrice' })
  async getPrices(
    @GetActiveContext() ctx: ActiveAContext,
    @Query() query: Record<string, string>,
  ) {
    return this.supplierPricesService.getPrices(ctx, query);
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Bộ lọc routes + services cho màn giá' })
  async getFilterOptions(@GetActiveContext() ctx: ActiveAContext) {
    return this.supplierPricesService.getFilterOptions(ctx);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật giá theo lô' })
  async updatePrices(
    @GetActiveContext() ctx: ActiveAContext,
    @Body() body: { items: any[] },
  ) {
    if (!Array.isArray(body?.items) || body.items.length === 0) {
      throw new BadRequestException('items is required.');
    }
    return this.supplierPricesService.updatePrices(ctx, body.items);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import giá từ file' })
  @UseInterceptors(AnyFilesInterceptor())
  async importPrices(
    @GetActiveContext() ctx: ActiveAContext,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('currency_id') currencyId: string,
    @Body('route_type') routeType: string,
  ) {
    const file = files?.[0];
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.supplierPricesService.importPrices(
      ctx,
      file,
      currencyId,
      routeType,
    );
  }

  @Get('price-changes')
  @ApiOperation({ summary: 'Danh sách yêu cầu thay đổi giá' })
  async getPriceChanges(
    @GetActiveContext() ctx: ActiveAContext,
    @Query('status') status?: string,
  ) {
    return this.supplierPricesService.getPriceChanges(ctx, status);
  }

  @Delete('price-changes/:id')
  @ApiOperation({ summary: 'Hủy yêu cầu thay đổi giá (PENDING)' })
  async deletePriceChange(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id') id: string,
  ) {
    return this.supplierPricesService.deletePriceChange(ctx, id);
  }
}
