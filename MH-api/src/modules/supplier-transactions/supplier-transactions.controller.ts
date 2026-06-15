import {
  Controller,
  Get,
  Headers,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { GetUser } from "src/common/decorators/user.decorator";
import { UserEntity } from "../users/user.entity";
import { ActiveLinkService } from "src/common/services/active-link.service";
import {
  SupplierTransactionsQuery,
  SupplierTransactionsService,
} from "./supplier-transactions.service";

/**
 * mhcom endpoint phục vụ màn "Bảng kê chi phí".
 * Proxy danh sách giao dịch (PNL + Chi hộ) từ hệ thống mhvn theo supplier.
 */
@Controller("api/supplier/transactions")
@UseGuards(JwtAuthGuard)
export class SupplierTransactionsController {
  constructor(
    private readonly supplierTransactionsService: SupplierTransactionsService,
    private readonly activeLinkService: ActiveLinkService,
  ) {}

  @Get()
  async getTransactions(
    @GetUser() user: UserEntity,
    @Headers("x-active-supplier-id") activeSupplierId: string,
    @Query() query: SupplierTransactionsQuery,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.supplierTransactionsService.getTransactions(
      a_supplier_id,
      query,
    );
  }
}
