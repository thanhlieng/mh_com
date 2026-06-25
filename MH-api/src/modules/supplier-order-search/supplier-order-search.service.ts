import { BadRequestException, Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';
import { ActiveAContext } from 'src/common/guards/active-target.guard';

@Injectable()
export class SupplierOrderSearchService {
  constructor(
    private readonly mhvnIntegrationService: MhvnIntegrationService,
  ) {}

  /**
   * Tra cứu đơn hàng theo booking_bill_number (match exact) cho màn
   * "Quản lý chi hộ". Proxy tới: GET /api/mhcom/supplier/order-by-booking/
   * (token supplier). Trả về đơn + các bản ghi Chi hộ thuộc supplier.
   */
  async findByBooking(activeContext: ActiveAContext, booking: string) {
    const value = (booking ?? '').trim();
    if (!value) {
      throw new BadRequestException('booking_bill_number is required.');
    }

    const params = new URLSearchParams();
    params.set('booking_bill_number', value);

    const endpoint = `/api/mhcom/supplier/order-by-booking/?${params.toString()}`;
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      activeContext,
    });
  }
}
