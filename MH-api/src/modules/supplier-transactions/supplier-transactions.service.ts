import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';
import { ActiveAContext } from 'src/common/guards/active-target.guard';

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
   * Lấy danh sách giao dịch hợp nhất (PNL + Chi hộ) của supplier từ hệ thống A.
   * Proxy tới: GET /api/mhcom/supplier/transactions/ (token supplier).
   */
  async getTransactions(
    activeContext: ActiveAContext,
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
      activeContext,
    });
  }

  /**
   * Lấy dữ liệu Kê cước & Chi hộ (pivot theo container) của supplier từ hệ A.
   * Proxy tới: GET /api/mhcom/supplier/ke-cuoc-chi-ho/ (token supplier).
   * Lọc thời gian theo order_container.date; container không có ngày bị bỏ qua.
   */
  async getKeCuocChiHo(
    activeContext: ActiveAContext,
    query: { from?: string; to?: string; locked?: boolean | string } = {},
  ) {
    const params = new URLSearchParams();
    if (query.from) params.set('start_date', query.from);
    if (query.to) params.set('end_date', query.to);
    // `locked=all` → tab hợp nhất: trả cả PNL đã chốt lẫn chưa chốt, hệ A đánh
    //   dấu ô đã chốt qua `locked_pnl_ids`.
    // `locked=true` → tab "Chi phí đã chốt" (PNL trucking đã nằm trong request).
    // Mặc định (không truyền) → behavior cũ: loại các PNL đã chốt.
    if (query.locked === 'all') {
      params.set('locked', 'all');
    } else if (query.locked === true || query.locked === 'true') {
      params.set('locked', 'true');
    }

    const qs = params.toString();
    const endpoint = `/api/mhcom/supplier/ke-cuoc-chi-ho/${qs ? `?${qs}` : ''}`;

    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      activeContext,
    });
  }

  /**
   * Export Excel bảng kê chi phí của supplier (PNL + Chi hộ) theo khoảng thời gian.
   * Proxy tới: GET /api/mhcom/supplier/transactions/export/ (token supplier).
   */
  async exportCostStatement(
    activeContext: ActiveAContext,
    query: { from?: string; to?: string } = {},
  ) {
    const params = new URLSearchParams();
    if (query.from) params.set('start_date', query.from);
    if (query.to) params.set('end_date', query.to);

    const qs = params.toString();
    const endpoint = `/api/mhcom/supplier/transactions/export/${qs ? `?${qs}` : ''}`;

    return this.mhvnIntegrationService.callMhvnDownload({
      endpoint,
      activeContext,
    });
  }

  /**
   * Export Excel Báo cáo kê cước & chi hộ của supplier theo khoảng thời gian.
   * Proxy tới: GET /api/mhcom/supplier/bao-cao-ke-cuoc-chi-ho/export/ (token supplier).
   */
  async exportKeCuocChiHo(
    activeContext: ActiveAContext,
    query: { from?: string; to?: string } = {},
  ) {
    const params = new URLSearchParams();
    if (query.from) params.set('start_date', query.from);
    if (query.to) params.set('end_date', query.to);

    const qs = params.toString();
    const endpoint = `/api/mhcom/supplier/bao-cao-ke-cuoc-chi-ho/export/${qs ? `?${qs}` : ''}`;

    return this.mhvnIntegrationService.callMhvnDownload({
      endpoint,
      activeContext,
    });
  }
}
