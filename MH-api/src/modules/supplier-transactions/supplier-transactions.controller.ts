import {
  Controller,
  Get,
  Query,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../users/user.entity';
import {
  SupplierTransactionsQuery,
  SupplierTransactionsService,
} from './supplier-transactions.service';

/**
 * System B endpoint phục vụ màn "Bảng kê chi phí".
 * Proxy danh sách giao dịch (PNL + Chi hộ) từ hệ thống A theo supplier.
 */
@Controller('api/supplier/transactions')
@UseGuards(JwtAuthGuard)
export class SupplierTransactionsController {
  constructor(
    private readonly supplierTransactionsService: SupplierTransactionsService,
  ) {}

  @Get()
  async getTransactions(
    @GetUser() user: UserEntity,
    @Query() query: SupplierTransactionsQuery,
  ) {
    const { a_supplier_id } = user;
    // Endpoint A chỉ chấp nhận token supplier → bắt buộc tài khoản đã liên kết supplier
    if (!a_supplier_id) {
      throw new ConflictException(
        'Tài khoản chưa được liên kết với nhà cung cấp. Vui lòng liên hệ quản trị viên.',
      );
    }
    return this.supplierTransactionsService.getTransactions(
      a_supplier_id,
      query,
    );
  }
}
