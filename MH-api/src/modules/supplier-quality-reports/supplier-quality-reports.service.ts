import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';
import { ActiveAContext } from 'src/common/guards/active-target.guard';

/**
 * Proxy phía mhcom (NestJS) cho tính năng "Báo cáo chất lượng".
 *
 * Gọi sang Django:
 *   /api/mhcom/supplier/quality-reports/*
 * với token RS256 supplier do `MhcomJwtService` mint, target = activeContext.target.
 *
 * Tab/filter (truyền nguyên xuống Django):
 *   - tab=sent|received
 *   - page, page_size
 *   - from, to     (ISO datetime, lọc theo ngay_phat_sinh)
 *   - status       (CSV: sent,notified,received,processed,rejected)
 *   - severity     (CSV: low,high,urgent)
 */
@Injectable()
export class SupplierQualityReportsService {
  constructor(private readonly mhvn: MhvnIntegrationService) {}

  private buildQs(params: Record<string, string | number | undefined>): string {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      search.set(k, String(v));
    });
    const qs = search.toString();
    return qs ? `?${qs}` : '';
  }

  async list(
    ctx: ActiveAContext,
    params: {
      tab?: string;
      page?: number;
      page_size?: number;
      from?: string;
      to?: string;
      status?: string;
      severity?: string;
    },
  ) {
    const qs = this.buildQs(params);
    return this.mhvn.callMhvn({
      method: 'GET',
      endpoint: `/api/mhcom/supplier/quality-reports/${qs}`,
      activeContext: ctx,
    });
  }

  async detail(ctx: ActiveAContext, id: number) {
    return this.mhvn.callMhvn({
      method: 'GET',
      endpoint: `/api/mhcom/supplier/quality-reports/${id}/`,
      activeContext: ctx,
    });
  }

  async create(ctx: ActiveAContext, body: Record<string, unknown>) {
    return this.mhvn.callMhvn({
      method: 'POST',
      endpoint: '/api/mhcom/supplier/quality-reports/',
      data: body,
      activeContext: ctx,
    });
  }

  async update(ctx: ActiveAContext, id: number, body: Record<string, unknown>) {
    return this.mhvn.callMhvn({
      method: 'PATCH',
      endpoint: `/api/mhcom/supplier/quality-reports/${id}/`,
      data: body,
      activeContext: ctx,
    });
  }

  async remove(ctx: ActiveAContext, id: number) {
    return this.mhvn.callMhvn({
      method: 'DELETE',
      endpoint: `/api/mhcom/supplier/quality-reports/${id}/`,
      activeContext: ctx,
    });
  }

  async changeStatus(
    ctx: ActiveAContext,
    id: number,
    status: string,
  ) {
    return this.mhvn.callMhvn({
      method: 'POST',
      endpoint: `/api/mhcom/supplier/quality-reports/${id}/status/`,
      data: { status },
      activeContext: ctx,
    });
  }

  async options(ctx: ActiveAContext) {
    return this.mhvn.callMhvn({
      method: 'GET',
      endpoint: '/api/mhcom/supplier/quality-reports/options/',
      activeContext: ctx,
    });
  }
}
