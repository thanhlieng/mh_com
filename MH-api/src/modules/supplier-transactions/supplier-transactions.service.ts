import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';

export interface SupplierTransactionsQuery {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  q?: string;
  page?: string | number;
  page_size?: string | number;
}

@Injectable()
export class SupplierTransactionsService {
  constructor(
    private readonly mhvnIntegrationService: MhvnIntegrationService,
  ) {}

  /**
   * Lấy danh sách giao dịch hợp nhất (PNL + Chi hộ) của supplier từ hệ thống mhvn.
   * Proxy tới: GET /api/mhcom/supplier/transactions/ (token supplier).
   */
  async getTransactions(
    a_supplier_id: string,
    query: SupplierTransactionsQuery = {},
  ) {
    const params = new URLSearchParams();
    if (query.start_date) params.set('start_date', query.start_date);
    if (query.end_date) params.set('end_date', query.end_date);
    if (query.q) params.set('q', String(query.q));
    if (query.page != null) params.set('page', String(query.page));
    if (query.page_size != null) params.set('page_size', String(query.page_size));

    const qs = params.toString();
    const endpoint = `/api/mhcom/supplier/transactions/${qs ? `?${qs}` : ''}`;

    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      a_supplier_id,
    });
  }
}
