import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../users/user.entity';
import { ActiveLinkService } from 'src/common/services/active-link.service';
import { SupplierOrderSearchService } from './supplier-order-search.service';

/**
 * mhcom endpoint phục vụ ô tìm kiếm ở màn "Quản lý chi hộ".
 * Tra cứu đơn hàng theo booking_bill_number (match exact), proxy sang mhvn
 * theo supplier.
 */
@Controller('api/supplier/order-by-booking')
@UseGuards(JwtAuthGuard)
export class SupplierOrderSearchController {
  constructor(
    private readonly supplierOrderSearchService: SupplierOrderSearchService,
    private readonly activeLinkService: ActiveLinkService,
  ) {}

  @Get()
  async findByBooking(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Query('q') q: string,
    @Query('booking_bill_number') bookingBillNumber: string,
  ) {
    const booking = bookingBillNumber || q;
    if (!booking) {
      throw new BadRequestException('booking_bill_number is required.');
    }
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.supplierOrderSearchService.findByBooking(a_supplier_id, booking);
  }
}
