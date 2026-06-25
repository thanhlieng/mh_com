import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import {
  ActiveTargetGuard,
  ActiveAContext,
} from 'src/common/guards/active-target.guard';
import { GetActiveContext } from 'src/common/decorators/active-context.decorator';
import {
  SupplierTransactionsQuery,
  SupplierTransactionsService,
} from './supplier-transactions.service';

/**
 * mhcom endpoint phục vụ màn "Bảng kê chi phí".
 * Proxy danh sách giao dịch (PNL + Chi hộ) từ hệ A theo supplier + target
 * (mhvn|gp) trong header `X-A-Target`.
 */
@ApiTags('supplier-transactions')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/supplier/transactions')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class SupplierTransactionsController {
  constructor(
    private readonly supplierTransactionsService: SupplierTransactionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách giao dịch (PNL + Chi hộ)' })
  async getTransactions(
    @GetActiveContext() ctx: ActiveAContext,
    @Query() query: SupplierTransactionsQuery,
  ) {
    return this.supplierTransactionsService.getTransactions(ctx, query);
  }

  /**
   * Dữ liệu Kê cước & Chi hộ (pivot theo container) cho tab cùng tên ở màn
   * "Bảng kê chi phí". Lọc thời gian theo order_container.date.
   */
  @Get('ke-cuoc-chi-ho')
  @ApiOperation({ summary: 'Kê cước & Chi hộ pivot theo container' })
  async getKeCuocChiHo(
    @GetActiveContext() ctx: ActiveAContext,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.supplierTransactionsService.getKeCuocChiHo(ctx, { from, to });
  }
}
