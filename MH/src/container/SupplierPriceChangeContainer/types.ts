import type {
  PriceChangeSource,
  PriceChangeStatus,
  PriceChangeType,
} from '@/services/supplier.services';

// ─── Nhãn tiếng Việt cho cột "Loại" (change_type) ──────────────────────────────

export const CHANGE_TYPE_LABEL: Record<PriceChangeType, string> = {
  CREATE: 'Tạo mới',
  REPLACE: 'Thay thế',
  EDIT_AMOUNT: 'Sửa giá',
};

/** Màu antd Tag cho cột "Loại" */
export const CHANGE_TYPE_COLOR: Record<PriceChangeType, string> = {
  CREATE: 'green',
  REPLACE: 'gold',
  EDIT_AMOUNT: 'blue',
};

// ─── Nhãn tiếng Việt cho cột "Nguồn" (source) ──────────────────────────────────

export const SOURCE_LABEL: Record<PriceChangeSource, string> = {
  MANUAL: 'Thủ công',
  EXCEL: 'Excel',
};

// ─── Nhãn + màu antd Tag cho cột "Trạng thái" (status) ─────────────────────────

export const STATUS_LABEL: Record<PriceChangeStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CONFLICT: 'Xung đột',
};

export const STATUS_COLOR: Record<PriceChangeStatus, string> = {
  PENDING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  CONFLICT: 'warning',
};

/** Tùy chọn cho Select lọc theo trạng thái ('' = Tất cả) */
export const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'CONFLICT', label: 'Xung đột' },
];
