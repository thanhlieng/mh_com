/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseISO } from 'date-fns';
import {
  DownloadIcon,
  ExternalLinkIcon,
  Loader2Icon,
  RefreshCwIcon,
} from 'lucide-react';
import * as React from 'react';
import { useQuery } from 'react-query';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { listChiHoUploads } from '@/services/supplier.services';
import type { ChiHoApprovalStatus } from '@/services/supplier.services';
import type { ChiHoApprovalStatus as PanelApprovalStatus } from './types';

const APPROVAL_BADGE: Record<
  ChiHoApprovalStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  REJECTED: { label: 'Từ chối', variant: 'destructive' },
};

type StatusFilter = 'ALL' | ChiHoApprovalStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
];

const formatDateTime = (iso: string) => {
  try {
    return parseISO(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const openFile = (url: string | null) => {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export function UploadRequestsTab() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('ALL');

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['chiho-uploads', statusFilter],
    () =>
      listChiHoUploads(
        statusFilter === 'ALL' ? undefined : (statusFilter as PanelApprovalStatus),
      ),
    { retry: false, keepPreviousData: true }
  );

  const rows = data?.data ?? [];

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* Toolbar: filter + reload */}
      <div className='shrink-0 border-b border-border bg-muted/20 px-4 py-3 md:px-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-1'>
            {STATUS_FILTERS.map((opt) => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <Button
            variant='outline'
            size='sm'
            className='h-8 gap-1.5 text-xs'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCwIcon
              className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
            />
            Tải lại
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        {isLoading ? (
          <div className='flex items-center justify-center gap-2 py-20 text-xs text-muted-foreground'>
            <Loader2Icon className='h-4 w-4 animate-spin' />
            Đang tải danh sách...
          </div>
        ) : isError ? (
          <div className='py-16 text-center text-xs text-destructive'>
            Có lỗi xảy ra khi tải danh sách. Vui lòng thử lại.
          </div>
        ) : rows.length === 0 ? (
          <div className='py-16 text-center text-xs text-muted-foreground'>
            Chưa có file nào được yêu cầu tải lên
          </div>
        ) : (
          <>
            <div className='mb-3 text-xs text-muted-foreground'>
              Tổng {rows.length} file
            </div>
            <div className='w-full min-w-max rounded-md border border-border'>
              <table className='w-full border-collapse text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/40 text-left'>
                    <th className='px-3 py-2 text-xs font-semibold'>STT</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Mã đơn</th>
                    <th className='px-3 py-2 text-xs font-semibold'>
                      Booking / Bill
                    </th>
                    <th className='px-3 py-2 text-xs font-semibold'>Tên file</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Trạng thái</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Ngày tải</th>
                    <th className='px-3 py-2 text-center text-xs font-semibold'>
                      Tải / Xem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const badge = APPROVAL_BADGE[r.approval_status];
                    return (
                      <tr
                        key={r.id}
                        className={cn(
                          'border-b border-border',
                          i % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                        )}
                      >
                        <td className='px-3 py-2 text-xs text-muted-foreground'>
                          {i + 1}
                        </td>
                        <td className='px-3 py-2 text-xs font-medium text-primary'>
                          {r.order_code ?? `#${r.order_id}`}
                        </td>
                        <td className='px-3 py-2 text-xs'>
                          {r.booking_bill_number ?? '—'}
                        </td>
                        <td className='px-3 py-2 text-xs'>
                          {r.file_name ?? `file-${r.id}`}
                        </td>
                        <td className='px-3 py-2 text-xs'>
                          {badge && (
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          )}
                        </td>
                        <td className='px-3 py-2 text-xs'>
                          {formatDateTime(r.created_at)}
                        </td>
                        <td className='px-3 py-2 text-center'>
                          <div className='inline-flex items-center gap-1'>
                            <button
                              onClick={() => openFile(r.file_url)}
                              disabled={!r.file_url}
                              title='Xem trên trình duyệt'
                              className='rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40'
                            >
                              <ExternalLinkIcon className='h-3.5 w-3.5' />
                            </button>
                            <a
                              href={r.file_url ?? undefined}
                              download={r.file_name ?? undefined}
                              target='_blank'
                              rel='noreferrer'
                              title='Tải xuống'
                              className={cn(
                                'rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground',
                                !r.file_url && 'pointer-events-none opacity-40'
                              )}
                            >
                              <DownloadIcon className='h-3.5 w-3.5' />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
