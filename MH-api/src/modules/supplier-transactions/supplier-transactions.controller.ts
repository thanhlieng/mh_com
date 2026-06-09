import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { GetUser } from "src/common/decorators/user.decorator";
import { UserEntity } from "../users/user.entity";
import { assertSupplierLinked } from "src/common/helper/supplier.helper";
import {
  SupplierTransactionsQuery,
  SupplierTransactionsService,
} from "./supplier-transactions.service";

/**
 * System B endpoint phục vụ màn "Bảng kê chi phí".
 * Proxy danh sách giao dịch (PNL + Chi hộ) từ hệ thống A theo supplier.
 */
@Controller("api/supplier/transactions")
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
    const a_supplier_id = assertSupplierLinked(user);
    return this.supplierTransactionsService.getTransactions(
      a_supplier_id,
      query,
    );
  }
}
