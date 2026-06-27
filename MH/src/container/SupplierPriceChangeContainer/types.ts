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

// ─── Nhãn tiếng Việt cho cột "Nguồn" (source) ──────────────────────────────────

export const SOURCE_LABEL: Record<PriceChangeSource, string> = {
  MANUAL: 'Thủ công',
  EXCEL: 'Excel',
};

// ─── Nhãn tiếng Việt cho cột "Trạng thái" (status) ─────────────────────────────

export const STATUS_LABEL: Record<PriceChangeStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CONFLICT: 'Xung đột',
};

/** Tùy chọn lọc theo trạng thái ('' = Tất cả) */
export const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'CONFLICT', label: 'Xung đột' },
];
