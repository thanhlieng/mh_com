import { Injectable } from '@nestjs/common';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';

@Injectable()
export class SupplierChangeRequestsService {
  constructor(
    private readonly mhvnIntegrationService: MhvnIntegrationService,
  ) {}

  /**
   * Lấy danh sách yêu cầu thay đổi cost của supplier từ hệ thống mhvn.
   * Proxy tới: GET /api/service-change-supplier-requests/ (token supplier).
   */
  async findAll(a_supplier_id: string) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: '/api/service-change-supplier-requests/',
      a_supplier_id,
    });
  }

  /**
   * Lấy chi tiết một yêu cầu thay đổi cost từ hệ thống mhvn.
   * Proxy tới: GET /api/service-change-supplier-requests/<id>/ (token supplier).
   */
  async findOne(a_supplier_id: string, id: number) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint: `/api/service-change-supplier-requests/${id}/`,
      a_supplier_id,
    });
  }

  /**
   * Tạo yêu cầu thay đổi cost trên hệ thống mhvn.
   * Proxy tới: POST /api/service-change-supplier-requests/ (token supplier).
   */
  async create(a_supplier_id: string, dto: CreateChangeRequestDto[]) {
    return this.mhvnIntegrationService.callMhvn({
      method: 'POST',
      endpoint: '/api/service-change-supplier-requests/',
      data: dto,
      a_supplier_id,
    });
  }
}
