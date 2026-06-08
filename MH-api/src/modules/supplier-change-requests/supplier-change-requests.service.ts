import { Injectable } from '@nestjs/common';
import { SystemAIntegrationService } from '../system-a-integration/system-a-integration.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';

@Injectable()
export class SupplierChangeRequestsService {
  constructor(
    private readonly systemAIntegrationService: SystemAIntegrationService,
  ) {}

  /**
   * Lấy danh sách yêu cầu thay đổi cost của supplier từ hệ thống A.
   * Proxy tới: GET /api/service-change-supplier-requests/ (token supplier).
   */
  async findAll(a_supplier_id: string) {
    return this.systemAIntegrationService.callSystemA({
      method: 'GET',
      endpoint: '/api/service-change-supplier-requests/',
      a_supplier_id,
    });
  }

  /**
   * Lấy chi tiết một yêu cầu thay đổi cost từ hệ thống A.
   * Proxy tới: GET /api/service-change-supplier-requests/<id>/ (token supplier).
   */
  async findOne(a_supplier_id: string, id: number) {
    return this.systemAIntegrationService.callSystemA({
      method: 'GET',
      endpoint: `/api/service-change-supplier-requests/${id}/`,
      a_supplier_id,
    });
  }

  /**
   * Tạo yêu cầu thay đổi cost trên hệ thống A.
   * Proxy tới: POST /api/service-change-supplier-requests/ (token supplier).
   */
  async create(a_supplier_id: string, dto: CreateChangeRequestDto) {
    return this.systemAIntegrationService.callSystemA({
      method: 'POST',
      endpoint: '/api/service-change-supplier-requests/',
      data: dto,
      a_supplier_id,
    });
  }
}
