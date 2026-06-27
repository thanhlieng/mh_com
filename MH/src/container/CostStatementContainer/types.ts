export type CostCategory = 'cost' | 'invoice_mh' | 'chi_ho';

export interface CostStatementRow {
  id: string;
  orderCode: string;
  bookingBillNumber: string;
  containerNo: string;
  containerType: string;
  route: string;
  serviceName: string;
  contractNumber: string;
  amount: number;            // cột "Tiền"
  category: CostCategory;    // cột "Loại"
  editable: boolean;         // chỉ pnl & expense_type !== 'invoice_mh'
  // Extra fields for API integration
  pnlId?: number;            // PNL ID from system A (pnl type only)
  orderId?: number;          // Order ID from system A
  type: 'pnl' | 'chi_ho';
}

/** Trường duy nhất có thể chỉnh sửa trong bảng kê */
export type EditableField = 'amount';

// ─── Đề nghị thay đổi (change request gửi sang hệ thống khác) ──────────────────

export type ChangeRequestStatus =
  | 'Chờ duyệt'
  | 'Đã duyệt'
  | 'Từ chối'
  | 'Đang xử lý';

/** Lý do mặc định khi sửa chi phí — user có thể chỉnh lại trong modal xác nhận */
export const DEFAULT_EDIT_REASON =
  'Cập nhật cost theo thực tế phát sinh, vui lòng MH duyệt.';

/** Một thay đổi cụ thể của một ô trong bảng kê */
export interface ChangeRequestItem {
  rowId: string;
  billCode: string;
  field: EditableField;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  reason?: string | null;       // Lý do supplier điền khi gửi
  reviewNote?: string | null;   // Phản hồi MH-logistic khi duyệt/từ chối
  approvedBy?: string | null;
  approvedAt?: string | null;
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
        field: 'amount',
        fieldLabel: 'Tiền',
        oldValue: oldCost.toLocaleString('vi-VN') + ' ₫',
        newValue: reqCost.toLocaleString('vi-VN') + ' ₫',
        reason: apiItem.reason ?? null,
        reviewNote: apiItem.review_note ?? null,
        approvedBy: apiItem.approved_by ?? null,
        approvedAt: apiItem.approved_at ?? null,
      },
    ],
  };
}

/** Nhãn tiếng Việt cho từng trường có thể chỉnh sửa */
export const FIELD_LABELS: Record<EditableField, string> = {
  amount: 'Tiền',
};
