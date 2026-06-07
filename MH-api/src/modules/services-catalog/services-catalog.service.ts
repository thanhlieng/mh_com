import { Injectable } from '@nestjs/common';
import { SystemAIntegrationService } from '../system-a-integration/system-a-integration.service';

@Injectable()
export class ServicesCatalogService {
  constructor(private systemAIntegrationService: SystemAIntegrationService) {}

  async getServicesCatalog(query: any = {}) {
    const queryParams = new URLSearchParams(query).toString();
    const endpoint = `/api/services${queryParams ? '?' + queryParams : ''}`;

    // No a_supplier_id → uses service token (not tied to a specific supplier)
    return this.systemAIntegrationService.callSystemA({
      method: 'GET',
      endpoint,
    });
  }
}
