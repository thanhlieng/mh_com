import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';
import { EATarget } from '../users/entities/user-a-link.entity';

export interface DirectoryQuery {
  q?: string;
  is_active?: string;
}

/**
 * Proxy danh mục supplier/customer (master data) từ hệ A theo target.
 *
 * Dùng **service token** (không gắn với supplier/customer cụ thể) nhưng phải
 * chọn target tường minh — danh mục mhvn và gp khác nhau. Phục vụ màn admin
 * web tạo/liên kết tài khoản NCC.
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

  async getSuppliers(target: EATarget, query: DirectoryQuery = {}) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: `/api/mhcom/suppliers/${this.buildQuery(query)}`,
      target,
    });
  }

  async getCustomers(target: EATarget, query: DirectoryQuery = {}) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: `/api/mhcom/customers/${this.buildQuery(query)}`,
      target,
    });
  }
}
