/**
 * Types dùng riêng cho QualityReportsContainer (NCC mhcom).
 * Spec backend: notifications/models.QualityReport.
 */

import type {
  QualityReport,
  QualityReportSeverity,
  QualityReportStatus,
  QualityReportTab,
} from '@/services/supplier.services';

export type { QualityReport, QualityReportTab };

export const SEVERITY_OPTIONS: Array<{
  value: QualityReportSeverity;
  label: string;
  color: string;
}> = [
  { value: 'low', label: 'Ảnh hưởng thấp', color: 'green' },
  { value: 'high', label: 'Ảnh hưởng cao', color: 'orange' },
  { value: 'urgent', label: 'Yêu cầu gấp', color: 'red' },
];

export const STATUS_OPTIONS: Array<{
  value: QualityReportStatus;
  label: string;
  color: string;
}> = [
  { value: 'sent', label: 'Đã gửi báo cáo', color: 'blue' },
  { value: 'notified', label: 'Đã thông báo NCC', color: 'cyan' },
  { value: 'received', label: 'Đã tiếp nhận', color: 'geekblue' },
  { value: 'processed', label: 'Đã xử lý', color: 'green' },
  { value: 'rejected', label: 'Từ chối xử lý', color: 'red' },
];

export const severityLabel = (v: QualityReportSeverity) =>
  SEVERITY_OPTIONS.find((s) => s.value === v)?.label ?? v;
export const severityColor = (v: QualityReportSeverity) =>
  SEVERITY_OPTIONS.find((s) => s.value === v)?.color ?? 'default';

export const statusLabel = (v: QualityReportStatus) =>
  STATUS_OPTIONS.find((s) => s.value === v)?.label ?? v;
export const statusColor = (v: QualityReportStatus) =>
  STATUS_OPTIONS.find((s) => s.value === v)?.color ?? 'default';

export interface FilterState {
  from?: string;
  to?: string;
  status?: string;
  severity?: string;
  page: number;
  page_size: number;
}

export const DEFAULT_FILTERS: FilterState = {
  page: 1,
  page_size: 20,
};
