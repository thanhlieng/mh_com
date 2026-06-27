import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';

@Injectable()
export class ServicesCatalogService {
  constructor(private mhvnIntegrationService: MhvnIntegrationService) {}

  async getServicesCatalog(query: any = {}) {
    const queryParams = new URLSearchParams(query).toString();
    const endpoint = `/api/services${queryParams ? '?' + queryParams : ''}`;

    // No a_supplier_id → uses service token (not tied to a specific supplier)
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
    });
  }
}
