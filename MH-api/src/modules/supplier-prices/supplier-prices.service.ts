import { Injectable } from '@nestjs/common';
import FormDataNode from 'form-data';
import { SystemAIntegrationService } from '../system-a-integration/system-a-integration.service';

@Injectable()
export class SupplierPricesService {
  constructor(
    private readonly systemAIntegrationService: SystemAIntegrationService,
  ) {}

  /**
   * Lấy danh sách giá (ServiceSupplierPrice) của supplier từ hệ thống A.
   * Proxy tới: GET /api/system-b/supplier/prices/ (token supplier).
   */
  async getPrices(a_supplier_id: string) {
    return this.systemAIntegrationService.callSystemA({
      method: 'GET',
      endpoint: '/api/system-b/supplier/prices/',
      a_supplier_id,
    });
  }

  /**
   * Cập nhật giá theo lô cho supplier.
   * Proxy tới: PATCH /api/system-b/supplier/prices/ (token supplier).
   */
  async updatePrices(a_supplier_id: string, items: any[]) {
    return this.systemAIntegrationService.callSystemA({
      method: 'PATCH',
      endpoint: '/api/system-b/supplier/prices/',
      data: { items },
      a_supplier_id,
    });
  }

  /**
   * Import giá từ file (multipart) cho supplier.
   * Proxy tới: POST /api/system-b/supplier/prices/import/ (multipart, token supplier).
   */
  async importPrices(
    a_supplier_id: string,
    file: Express.Multer.File,
    currencyId: string,
    routeType: string,
  ) {
    const form = new FormDataNode();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    form.append('currency_id', currencyId);
    form.append('route_type', routeType);

    return this.systemAIntegrationService.callSystemAMultipart({
      endpoint: '/api/system-b/supplier/prices/import/',
      form,
      a_supplier_id,
    });
  }

  /**
   * Lấy danh sách yêu cầu thay đổi giá của supplier từ hệ thống A.
   * Proxy tới: GET /api/system-b/supplier/price-changes/ (token supplier).
   */
  async getPriceChanges(a_supplier_id: string, status?: string) {
    return this.systemAIntegrationService.callSystemA({
      method: 'GET',
      endpoint: `/api/system-b/supplier/price-changes/${
        status ? `?status=${encodeURIComponent(status)}` : ''
      }`,
      a_supplier_id,
    });
  }

  /**
   * Xóa một yêu cầu thay đổi giá đang ở trạng thái PENDING của supplier.
   * Proxy tới: DELETE /api/system-b/supplier/price-changes/<id>/ (token supplier).
   */
  async deletePriceChange(a_supplier_id: string, id: string | number) {
    return this.systemAIntegrationService.callSystemA({
      method: 'DELETE',
      endpoint: `/api/system-b/supplier/price-changes/${id}/`,
      a_supplier_id,
    });
  }
}
