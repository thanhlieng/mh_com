import { BadRequestException, Injectable } from '@nestjs/common';
import FormData from 'form-data';
import { SystemAIntegrationService } from '../system-a-integration/system-a-integration.service';

@Injectable()
export class SupplierChiHoFilesService {
  constructor(
    private readonly systemAIntegrationService: SystemAIntegrationService,
  ) {}

  /**
   * Liệt kê file Chi hộ của một order do supplier này upload từ hệ thống B.
   * Proxy tới: GET /api/system-b/supplier/chiho-files/ (token supplier).
   */
  async listFiles(
    a_supplier_id: string,
    orderId: string | number,
    includeInactive?: boolean,
  ) {
    const params = new URLSearchParams();
    params.set('order_id', String(orderId));
    if (includeInactive) params.set('include_inactive', 'true');

    const endpoint = `/api/system-b/supplier/chiho-files/?${params.toString()}`;
    return this.systemAIntegrationService.callSystemA({
      method: 'GET',
      endpoint,
      a_supplier_id,
    });
  }

  /**
   * Upload một hoặc nhiều file Chi hộ vào order.
   * Proxy tới: POST /api/system-b/supplier/chiho-files/ (multipart, token supplier).
   */
  async uploadFiles(
    a_supplier_id: string,
    orderId: string | number,
    files: Array<{ originalname: string; buffer: Buffer; mimetype: string }>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }

    const form = new FormData();
    form.append('order_id', String(orderId));
    files.forEach((file, i) => {
      form.append(`file${i}`, file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    return this.systemAIntegrationService.callSystemAMultipart({
      endpoint: '/api/system-b/supplier/chiho-files/',
      form,
      a_supplier_id,
    });
  }
}
