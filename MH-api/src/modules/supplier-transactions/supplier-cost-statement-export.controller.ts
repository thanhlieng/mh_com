import {
  Controller,
  Get,
  Headers,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../users/user.entity';
import { ActiveLinkService } from 'src/common/services/active-link.service';
import { SupplierTransactionsService } from './supplier-transactions.service';

/**
 * mhcom endpoint export Excel cho màn "Bảng kê chi phí".
 * Proxy file Excel (PNL + Chi hộ) từ hệ thống mhvn theo supplier.
 */
@Controller('api/supplier/cost-statement')
@UseGuards(JwtAuthGuard)
export class SupplierCostStatementExportController {
  constructor(
    private readonly supplierTransactionsService: SupplierTransactionsService,
    private readonly activeLinkService: ActiveLinkService,
  ) {}

  @Get('export')
  async exportCostStatement(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    const file = await this.supplierTransactionsService.exportCostStatement(
      a_supplier_id,
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
  async exportKeCuocChiHo(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    const file = await this.supplierTransactionsService.exportKeCuocChiHo(
      a_supplier_id,
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
