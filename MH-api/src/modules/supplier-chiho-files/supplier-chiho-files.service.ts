import { BadRequestException, Injectable } from '@nestjs/common';
import FormData from 'form-data';
import { MhvnIntegrationService } from '../mhvn-integration/mhvn-integration.service';

@Injectable()
export class SupplierChiHoFilesService {
  constructor(
    private readonly mhvnIntegrationService: MhvnIntegrationService,
  ) {}

  /**
   * Liệt kê file Chi hộ của một order do supplier này upload từ hệ thống B.
   * Proxy tới: GET /api/mhcom/supplier/chiho-files/ (token supplier).
   */
  async listFiles(
    a_supplier_id: string,
    orderId: string | number,
    includeInactive?: boolean,
  ) {
    const params = new URLSearchParams();
    params.set('order_id', String(orderId));
    if (includeInactive) params.set('include_inactive', 'true');

    const endpoint = `/api/mhcom/supplier/chiho-files/?${params.toString()}`;
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      a_supplier_id,
    });
  }

  /**
   * Liệt kê TẤT CẢ file Chi hộ supplier này đã upload, gộp mọi đơn.
   * Proxy tới: GET /api/mhcom/supplier/chiho-files/uploads/ (token supplier).
   * Phục vụ tab "Danh sách yêu cầu tải lên".
   */
  async listAllUploads(
    a_supplier_id: string,
    fileStatus?: string,
    includeInactive?: boolean,
  ) {
    const params = new URLSearchParams();
    if (fileStatus) params.set('status', fileStatus);
    if (includeInactive) params.set('include_inactive', 'true');

    const qs = params.toString();
    const endpoint = `/api/mhcom/supplier/chiho-files/uploads/${qs ? `?${qs}` : ''}`;
    return this.mhvnIntegrationService.callMhvn({
      method: 'GET',
      endpoint,
      a_supplier_id,
    });
  }

  /**
   * Xoá một file Chi hộ supplier đã upload — chỉ cho phép khi file đang ở
   * trạng thái PENDING (chưa được duyệt). Phục vụ tab "Danh sách yêu cầu tải lên".
   * Proxy tới: DELETE /api/mhcom/supplier/chiho-files/<file_id>/ (token supplier).
   *
   * Hệ thống mhvn tự kiểm tra:
   *   - file thuộc supplier trong token,
   *   - approval_status === 'PENDING'.
   * Trả lỗi 400 nếu file đã APPROVED/REJECTED, 404 nếu không thuộc supplier.
   */
  async deleteUpload(a_supplier_id: string, fileId: string | number) {
    const endpoint = `/api/mhcom/supplier/chiho-files/${fileId}/`;
    return this.mhvnIntegrationService.callMhvn({
      method: 'DELETE',
      endpoint,
      a_supplier_id,
    });
  }

  /**
   * Upload một hoặc nhiều file Chi hộ vào order.
   * Proxy tới: POST /api/mhcom/supplier/chiho-files/ (multipart, token supplier).
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

    return this.mhvnIntegrationService.callMhvnMultipart({
      endpoint: '/api/mhcom/supplier/chiho-files/',
      form,
      a_supplier_id,
    });
  }
}
