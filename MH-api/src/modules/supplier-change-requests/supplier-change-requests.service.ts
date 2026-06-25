import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';
import { ActiveAContext } from 'src/common/guards/active-target.guard';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';

@Injectable()
export class SupplierChangeRequestsService {
  constructor(
    private readonly mhvnIntegrationService: MhvnIntegrationService,
  ) {}

  /**
   * Lấy danh sách yêu cầu thay đổi cost của supplier từ hệ thống A.
   * Proxy tới: GET /api/service-change-supplier-requests/ (token supplier).
   */
  async findAll(activeContext: ActiveAContext) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: '/api/service-change-supplier-requests/',
      activeContext,
    });
  }

  /**
   * Lấy chi tiết một yêu cầu thay đổi cost từ hệ thống A.
   * Proxy tới: GET /api/service-change-supplier-requests/<id>/ (token supplier).
   */
  async findOne(activeContext: ActiveAContext, id: number) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: `/api/service-change-supplier-requests/${id}/`,
      activeContext,
    });
  }

  /**
   * Tạo yêu cầu thay đổi cost trên hệ thống A.
   * Proxy tới: POST /api/service-change-supplier-requests/ (token supplier).
   */
  async create(activeContext: ActiveAContext, dto: CreateChangeRequestDto[]) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'POST',
      endpoint: '/api/service-change-supplier-requests/',
      data: dto,
      activeContext,
    });
  }

  /**
   * Hủy (xóa) một yêu cầu thay đổi cost — chỉ khi đang PENDING (A kiểm tra).
   * Proxy tới: DELETE /api/service-change-supplier-requests/<id>/ (token supplier).
   */
  async remove(activeContext: ActiveAContext, id: number) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'DELETE',
      endpoint: `/api/service-change-supplier-requests/${id}/`,
      activeContext,
    });
  }
}
