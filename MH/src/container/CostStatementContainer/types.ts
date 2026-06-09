export type CostStatus = 'Chờ xử lý' | 'Đã thanh toán' | 'Chưa thanh toán' | 'Đã hủy';

export interface CostStatementRow {
  id: string;
  billCode: string;
  createdDate: string;       // ISO date string YYYY-MM-DD
  customer: string;
  route: string;
  cargoType: string;
  quantity: number;
  freightCost: number;
  surcharge: number;
  total: number;
  status: CostStatus;
  note: string;
  // Extra fields for API integration
  pnlId?: number;            // PNL ID from system A (pnl type only)
  orderId?: number;          // Order ID from system A
  transactionType?: 'pnl' | 'chi_ho';
}

export type EditableField = Exclude<keyof CostStatementRow, 'id' | 'total' | 'pnlId' | 'orderId' | 'transactionType'>;

// ─── Đề nghị thay đổi (change request gửi sang hệ thống khác) ──────────────────

export type ChangeRequestStatus =
  | 'Chờ duyệt'
  | 'Đã duyệt'
  | 'Từ chối'
  | 'Đang xử lý';

/** Một thay đổi cụ thể của một ô trong bảng kê */
export interface ChangeRequestItem {
  rowId: string;
  billCode: string;
  field: EditableField;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

/** Một đề nghị thay đổi đã gửi đi */
export interface ChangeRequest {
  id: string;
  code: string;             // Mã đề nghị, vd DNTD-2024-0001
  submittedAt: string;      // ISO datetime — thời gian gửi
  status: ChangeRequestStatus;
  items: ChangeRequestItem[];
}

// ─── API response mapping ──────────────────────────────────────────────────────

/** Map API status (English) → ChangeRequestStatus (Vietnamese) */
export const API_STATUS_TO_VN: Record<string, ChangeRequestStatus> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

/**
 * Map một ChangeRequestResponse từ API hệ thống A sang ChangeRequest
 * để hiển thị trên ChangeRequestList.
 */
export function mapApiResponseToChangeRequest(
  apiItem: import('@/services/supplier.services').ChangeRequestResponse,
): ChangeRequest {
  const reqCost = Number(apiItem.requested_cost);
  const oldCost = apiItem.pnl_data?.cost ?? 0;
  const billCode = apiItem.order_data?.order_code ?? apiItem.pnl_data?.service_name ?? '';

  return {
    id: String(apiItem.id),
    code: apiItem.order_data?.order_code
      ? `${apiItem.order_data.order_code}-${apiItem.id}`
      : `REQ-${apiItem.id}`,
    submittedAt: apiItem.created_at,
    status: API_STATUS_TO_VN[apiItem.status] || 'Chờ duyệt',
    items: [
      {
        rowId: String(apiItem.pnl),
        billCode,
        field: 'freightCost',
        fieldLabel: 'Cước phí',
        oldValue: oldCost.toLocaleString('vi-VN') + ' ₫',
        newValue: reqCost.toLocaleString('vi-VN') + ' ₫',
      },
    ],
  };
}

/** Nhãn tiếng Việt cho từng trường có thể chỉnh sửa */
export const FIELD_LABELS: Record<EditableField, string> = {
  billCode: 'Mã bill',
  createdDate: 'Ngày tạo',
  customer: 'Khách hàng',
  route: 'Tuyến đường',
  cargoType: 'Loại hàng',
  quantity: 'Số lượng',
  freightCost: 'Cước phí',
  surcharge: 'Phụ phí',
  status: 'Trạng thái',
  note: 'Ghi chú',
};
