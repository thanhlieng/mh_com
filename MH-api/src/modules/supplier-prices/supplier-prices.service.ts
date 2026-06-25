import { Injectable } from '@nestjs/common';
import FormDataNode from 'form-data';
import multer from 'multer';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';

@Injectable()
export class SupplierPricesService {
  constructor(
    private readonly mhvnIntegrationService: MhvnIntegrationService,
  ) {}

  /**
   * Lấy danh sách giá (ServiceSupplierPrice) của supplier từ hệ thống mhvn.
   * Proxy tới: GET /api/mhcom/supplier/prices/ (token supplier).
   * Chuyển tiếp các tham số lọc/phân trang (page, page_size, route_id,
   * service_id, q, effective_from, effective_to) sang A nguyên trạng.
   */
  async getPrices(a_supplier_id: string, query?: Record<string, string>) {
    const qs = this.buildQueryString(query, [
      'page',
      'page_size',
      'route_id',
      'service_id',
      'q',
      'effective_from',
      'effective_to',
      'sort',
    ]);
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: `/api/mhcom/supplier/prices/${qs}`,
      a_supplier_id,
    });
  }

  /**
   * Lấy lựa chọn bộ lọc (routes + services) cho màn giá vận chuyển.
   * Proxy tới: GET /api/mhcom/supplier/prices/filter-options/ (token supplier).
   */
  async getFilterOptions(a_supplier_id: string) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: '/api/mhcom/supplier/prices/filter-options/',
      a_supplier_id,
    });
  }

  /**
   * Build "?a=b&c=d" từ whitelist key có giá trị (bỏ rỗng/undefined).
   * Whitelist tránh forward param lạ xuống A.
   */
  private buildQueryString(
    query: Record<string, string> | undefined,
    allowed: string[],
  ): string {
    if (!query) return '';
    const sp = new URLSearchParams();
    for (const key of allowed) {
      const value = query[key];
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        sp.append(key, `${value}`);
      }
    }
    const s = sp.toString();
    return s ? `?${s}` : '';
  }

  /**
   * Cập nhật giá theo lô cho supplier.
   * Proxy tới: PATCH /api/mhcom/supplier/prices/ (token supplier).
   */
  async updatePrices(a_supplier_id: string, items: any[]) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'PATCH',
      endpoint: '/api/mhcom/supplier/prices/',
      data: { items },
      a_supplier_id,
    });
  }

  /**
   * Import giá từ file (multipart) cho supplier.
   * Proxy tới: POST /api/mhcom/supplier/prices/import/ (multipart, token supplier).
   */
  async importPrices(
    a_supplier_id: string,
    file: Express.Multer.File,
    currencyId: string,
    routeType: string,
  ) {
    const form = new FormDataNode();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    form.append('currency_id', currencyId);
    form.append('route_type', routeType);

    return this.mhvnIntegrationService.callMhvnMultipart({
      endpoint: '/api/mhcom/supplier/prices/import/',
      form,
      a_supplier_id,
    });
  }

  /**
   * Lấy danh sách yêu cầu thay đổi giá của supplier từ hệ thống mhvn.
   * Proxy tới: GET /api/mhcom/supplier/price-changes/ (token supplier).
   */
  async getPriceChanges(a_supplier_id: string, status?: string) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: `/api/mhcom/supplier/price-changes/${
        status ? `?status=${encodeURIComponent(status)}` : ''
      }`,
      a_supplier_id,
    });
  }

  /**
   * Xóa một yêu cầu thay đổi giá đang ở trạng thái PENDING của supplier.
   * Proxy tới: DELETE /api/mhcom/supplier/price-changes/<id>/ (token supplier).
   */
  async deletePriceChange(a_supplier_id: string, id: string | number) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'DELETE',
      endpoint: `/api/mhcom/supplier/price-changes/${id}/`,
      a_supplier_id,
    });
  }
}
