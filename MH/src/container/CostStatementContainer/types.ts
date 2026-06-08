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
}

export type EditableField = Exclude<keyof CostStatementRow, 'id' | 'total'>;

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
