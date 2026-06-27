/**
 * Types dùng riêng cho QualityReportsContainer (NCC mhcom).
 * Spec backend: notifications/models.QualityReport.
 */

import type { ComponentProps } from 'react';

import type { Badge } from '@/components/ui/badge';

import type {
  QualityReport,
  QualityReportSeverity,
  QualityReportStatus,
  QualityReportTab,
} from '@/services/supplier.services';

export type { QualityReport, QualityReportTab };

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

export const SEVERITY_OPTIONS: Array<{
  value: QualityReportSeverity;
  label: string;
  variant: BadgeVariant;
}> = [
  { value: 'low', label: 'Ảnh hưởng thấp', variant: 'success' },
  { value: 'high', label: 'Ảnh hưởng cao', variant: 'warning' },
  { value: 'urgent', label: 'Yêu cầu gấp', variant: 'destructive' },
];

export const STATUS_OPTIONS: Array<{
  value: QualityReportStatus;
  label: string;
  variant: BadgeVariant;
}> = [
  { value: 'sent', label: 'Đã gửi báo cáo', variant: 'pending' },
  { value: 'notified', label: 'Đã thông báo NCC', variant: 'pending' },
  { value: 'received', label: 'Đã tiếp nhận', variant: 'secondary' },
  { value: 'processed', label: 'Đã xử lý', variant: 'success' },
  { value: 'rejected', label: 'Từ chối xử lý', variant: 'destructive' },
];

export const severityLabel = (v: QualityReportSeverity) =>
  SEVERITY_OPTIONS.find((s) => s.value === v)?.label ?? v;
export const severityVariant = (v: QualityReportSeverity): BadgeVariant =>
  SEVERITY_OPTIONS.find((s) => s.value === v)?.variant ?? 'secondary';

export const statusLabel = (v: QualityReportStatus) =>
  STATUS_OPTIONS.find((s) => s.value === v)?.label ?? v;
export const statusVariant = (v: QualityReportStatus): BadgeVariant =>
  STATUS_OPTIONS.find((s) => s.value === v)?.variant ?? 'secondary';

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
