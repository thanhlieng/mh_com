import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { QR_LAST_SEEN_PREFIX } from '@/contants/Storage';
import {
  listQualityReports,
  type QualityReport,
} from '@/services/supplier.services';
import { useAppSelector } from '@/store/hook';

/**
 * Quản lý "báo cáo chất lượng mới" cho phía NCC (mhcom):
 * - LastSeen lưu trong localStorage theo từng target (mhvn/gp tách biệt).
 * - Báo cáo được coi là MỚI khi `source='mhvn'` (do MHVN/GP tạo về NCC) và
 *   `created_at > lastSeen`.
 *
 * Hook trả về:
 *   - `baseline`: lastSeen tại thời điểm hook mount (frozen) — để badge "Mới"
 *     trên hàng không biến mất khi lastSeen được cập nhật trong cùng phiên.
 *   - `isNew(row)`: helper kiểm tra 1 hàng có mới so với baseline không.
 *   - `markAllSeen()`: ghi lastSeen = now, xóa dot ở sidebar trong lần fetch tiếp theo.
 */
const readLastSeen = (target: string): string => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(QR_LAST_SEEN_PREFIX + target) || '';
};

const writeLastSeen = (target: string, iso: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(QR_LAST_SEEN_PREFIX + target, iso);
};

export const useQualityReportSeenBaseline = () => {
  const target = useAppSelector((s) => s.activeTarget.current);
  const queryClient = useQueryClient();
  // Đóng băng baseline ở thời điểm mount của component sử dụng hook.
  const [baseline] = useState<string>(() =>
    target ? readLastSeen(target) : '',
  );

  // Cập nhật lastSeen = now ngay khi mount + invalidate query đếm new ở sidebar
  // để dot tắt ngay, không phải chờ refetch interval. Baseline đã frozen ở trên
  // nên badge "Mới" trên hàng vẫn hiển thị suốt phiên hiện tại.
  useEffect(() => {
    if (!target) return;
    writeLastSeen(target, new Date().toISOString());
    queryClient.invalidateQueries(['quality-reports-new-count', target]);
  }, [target, queryClient]);

  const isNew = (row: QualityReport): boolean => {
    if (row.source !== 'mhvn') return false;
    if (!baseline) return true; // chưa bao giờ xem → tất cả đều mới
    return row.created_at > baseline;
  };

  return { baseline, isNew };
};

/**
 * Đếm số báo cáo chất lượng MỚI (tab received) cho sidebar dot.
 * Refetch mỗi 60s + khi window focus để bắt notify thời gian thực không quá tốn.
 */
export const useQualityReportNewCount = () => {
  const target = useAppSelector((s) => s.activeTarget.current);
  const accountType = useAppSelector((s) => s.activeTarget.accountType);

  // Chỉ supplier mới có khái niệm "báo cáo nhận từ MHVN/GP".
  const enabled = !!target && accountType === 'supplier';

  const { data } = useQuery(
    ['quality-reports-new-count', target],
    () =>
      listQualityReports({
        tab: 'received',
        page: 1,
        page_size: 50,
      }),
    {
      enabled,
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
      staleTime: 30_000,
    },
  );

  if (!enabled || !data) return 0;
  const lastSeen = target ? readLastSeen(target) : '';
  return data.results.filter(
    (r) => r.source === 'mhvn' && (!lastSeen || r.created_at > lastSeen),
  ).length;
};
