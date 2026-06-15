import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';

interface UserIdentity {
  a_supplier_id?: string;
  a_customer_id?: string;
}

@Injectable()
export class BangKeService {
  constructor(
    private mhvnIntegrationService: MhvnIntegrationService,
  ) {}

  async getBangKe(identity: UserIdentity, query: any = {}) {
    const queryParams = new URLSearchParams(query).toString();
    const endpoint = `/api/bangke${queryParams ? '?' + queryParams : ''}`;

    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      a_supplier_id: identity.a_supplier_id,
      a_customer_id: identity.a_customer_id,
    });
  }

  async getBangKeById(identity: UserIdentity, bangkeId: string) {
    const endpoint = `/api/bangke/${bangkeId}`;

    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      a_supplier_id: identity.a_supplier_id,
      a_customer_id: identity.a_customer_id,
    });
  }
}
