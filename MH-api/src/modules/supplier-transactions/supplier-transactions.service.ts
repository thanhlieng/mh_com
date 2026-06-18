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

  /**
   * Lấy dữ liệu Kê cước & Chi hộ (pivot theo container) của supplier từ hệ thống mhvn.
   * Proxy tới: GET /api/mhcom/supplier/ke-cuoc-chi-ho/ (token supplier).
   * Lọc thời gian theo order_container.date; container không có ngày bị bỏ qua.
   */
  async getKeCuocChiHo(
    a_supplier_id: string,
    query: { from?: string; to?: string } = {},
  ) {
    const params = new URLSearchParams();
    if (query.from) params.set('start_date', query.from);
    if (query.to) params.set('end_date', query.to);

    const qs = params.toString();
    const endpoint = `/api/mhcom/supplier/ke-cuoc-chi-ho/${qs ? `?${qs}` : ''}`;

    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      a_supplier_id,
    });
  }

  /**
   * Export Excel bảng kê chi phí của supplier (PNL + Chi hộ) theo khoảng thời gian.
   * Proxy tới: GET /api/mhcom/supplier/transactions/export/ (token supplier).
   */
  async exportCostStatement(
    a_supplier_id: string,
    query: { from?: string; to?: string } = {},
  ) {
    const params = new URLSearchParams();
    if (query.from) params.set('start_date', query.from);
    if (query.to) params.set('end_date', query.to);

    const qs = params.toString();
    const endpoint = `/api/mhcom/supplier/transactions/export/${qs ? `?${qs}` : ''}`;

    return this.mhvnIntegrationService.callMhvnDownload({
      endpoint,
      a_supplier_id,
    });
  }

  /**
   * Export Excel Báo cáo kê cước & chi hộ của supplier theo khoảng thời gian.
   * Proxy tới: GET /api/mhcom/supplier/bao-cao-ke-cuoc-chi-ho/export/ (token supplier).
   */
  async exportKeCuocChiHo(
    a_supplier_id: string,
    query: { from?: string; to?: string } = {},
  ) {
    const params = new URLSearchParams();
    if (query.from) params.set('start_date', query.from);
    if (query.to) params.set('end_date', query.to);

    const qs = params.toString();
    const endpoint = `/api/mhcom/supplier/bao-cao-ke-cuoc-chi-ho/export/${qs ? `?${qs}` : ''}`;

    return this.mhvnIntegrationService.callMhvnDownload({
      endpoint,
      a_supplier_id,
    });
  }
}
