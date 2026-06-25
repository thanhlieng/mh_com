import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';
import { EATarget } from '../users/entities/user-a-link.entity';

@Injectable()
export class ServicesCatalogService {
  constructor(private mhvnIntegrationService: MhvnIntegrationService) {}

  /**
   * Lấy services catalog từ hệ A theo target. Dùng service token (không gắn
   * supplier/customer cụ thể) nhưng cần `target` tường minh để chọn baseUrl.
   */
  async getServicesCatalog(target: EATarget, query: any = {}) {
    const queryParams = new URLSearchParams(query).toString();
    const endpoint = `/api/services${queryParams ? '?' + queryParams : ''}`;
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      target,
    });
  }
}
