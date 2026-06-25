import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import {
  ActiveTargetGuard,
  ActiveAContext,
} from 'src/common/guards/active-target.guard';
import { GetActiveContext } from 'src/common/decorators/active-context.decorator';
import { SupplierTransactionsService } from './supplier-transactions.service';

/**
 * mhcom endpoint export Excel cho màn "Bảng kê chi phí".
 * Proxy file Excel (PNL + Chi hộ) từ hệ A theo supplier + target (mhvn|gp)
 * trong header `X-A-Target`.
 */
@ApiTags('supplier-cost-statement-export')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/supplier/cost-statement')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class SupplierCostStatementExportController {
  constructor(
    private readonly supplierTransactionsService: SupplierTransactionsService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'Export Excel bảng kê chi phí (PNL + Chi hộ)' })
  async exportCostStatement(
    @GetActiveContext() ctx: ActiveAContext,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const file = await this.supplierTransactionsService.exportCostStatement(
      ctx,
      { from, to },
    );

    res.setHeader(
      'Content-Type',
      file.contentType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      file.contentDisposition || 'attachment; filename="bang-ke-chi-phi.xlsx"',
    );
    res.send(file.data);
  }

  @Get('ke-cuoc-chi-ho/export')
  @ApiOperation({ summary: 'Export Excel Báo cáo kê cước & chi hộ' })
  async exportKeCuocChiHo(
    @GetActiveContext() ctx: ActiveAContext,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const file = await this.supplierTransactionsService.exportKeCuocChiHo(
      ctx,
      { from, to },
    );

    res.setHeader(
      'Content-Type',
      file.contentType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      file.contentDisposition ||
        'attachment; filename="bao-cao-ke-cuoc-chi-ho.xlsx"',
    );
    res.send(file.data);
  }
}
