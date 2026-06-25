import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';
import { ActiveAContext } from 'src/common/guards/active-target.guard';

@Injectable()
export class BangKeService {
  constructor(private mhvnIntegrationService: MhvnIntegrationService) {}

  async getBangKe(activeContext: ActiveAContext, query: any = {}) {
    const queryParams = new URLSearchParams(query).toString();
    const endpoint = `/api/bangke${queryParams ? '?' + queryParams : ''}`;

    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      activeContext,
    });
  }

  async getBangKeById(activeContext: ActiveAContext, bangkeId: string) {
    const endpoint = `/api/bangke/${bangkeId}`;
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      activeContext,
    });
  }
}
