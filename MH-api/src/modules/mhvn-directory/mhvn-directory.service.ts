import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';

export interface DirectoryQuery {
  q?: string;
  is_active?: string;
}

/**
 * Proxy danh mục supplier/customer (master data) từ hệ thống mhvn.
 *
 * Không truyền a_supplier_id / a_customer_id → MhvnIntegrationService tự dùng
 * **service token**. Đây là dữ liệu danh mục dùng cho màn admin tạo/liên kết
 * tài khoản NCC, không gắn với một supplier/customer cụ thể.
 */
@Injectable()
export class MhvnDirectoryService {
  constructor(private readonly mhvnIntegrationService: MhvnIntegrationService) {}

  private buildQuery(query: DirectoryQuery = {}): string {
    const params: Record<string, string> = {};
    if (query.q) params.q = query.q;
    if (query.is_active) params.is_active = query.is_active;
    const qs = new URLSearchParams(params).toString();
    return qs ? `?${qs}` : '';
  }

  async getSuppliers(query: DirectoryQuery = {}) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: `/api/mhcom/suppliers/${this.buildQuery(query)}`,
    });
  }

  async getCustomers(query: DirectoryQuery = {}) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: `/api/mhcom/customers/${this.buildQuery(query)}`,
    });
  }
}
