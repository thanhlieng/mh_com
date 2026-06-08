import { Injectable } from '@nestjs/common';
import { SystemAIntegrationService } from '../system-a-integration/system-a-integration.service';

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
    private readonly systemAIntegrationService: SystemAIntegrationService,
  ) {}

  /**
   * Lấy danh sách giao dịch hợp nhất (PNL + Chi hộ) của supplier từ hệ thống A.
   * Proxy tới: GET /api/system-b/supplier/transactions/ (token supplier).
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
    const endpoint = `/api/system-b/supplier/transactions/${qs ? `?${qs}` : ''}`;

    return this.systemAIntegrationService.callSystemA({
      method: 'GET',
      endpoint,
      a_supplier_id,
    });
  }
}
