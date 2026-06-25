import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { SupplierOrderSearchService } from './supplier-order-search.service';

/**
 * mhcom endpoint phục vụ ô tìm kiếm ở màn "Quản lý chi hộ".
 * Tra cứu đơn hàng theo booking_bill_number (match exact), proxy sang hệ A
 * theo supplier + target trong header `X-A-Target`.
 */
@ApiTags('supplier-order-search')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/supplier/order-by-booking')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class SupplierOrderSearchController {
  constructor(
    private readonly supplierOrderSearchService: SupplierOrderSearchService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Tra cứu đơn theo booking_bill_number' })
  async findByBooking(
    @GetActiveContext() ctx: ActiveAContext,
    @Query('q') q: string,
    @Query('booking_bill_number') bookingBillNumber: string,
  ) {
    const booking = bookingBillNumber || q;
    if (!booking) {
      throw new BadRequestException('booking_bill_number is required.');
    }
    return this.supplierOrderSearchService.findByBooking(ctx, booking);
  }
}
