/* eslint-disable @typescript-eslint/no-explicit-any */
import { Popconfirm, notification } from 'antd';
import { parseISO } from 'date-fns';
import {
  DownloadIcon,
  ExternalLinkIcon,
  Loader2Icon,
  RefreshCwIcon,
  Trash2Icon,
} from 'lucide-react';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  deleteChiHoUpload,
  listChiHoUploads,
  resolveChiHoFileUrl,
} from '@/services/supplier.services';
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

/**
 * Mở file Chi hộ trong tab mới. `file_url` của hệ A là path tương đối (vd
 * `/media/...`) — `resolveChiHoFileUrl` prepend host theo target đang active
 * (env `NEXT_PUBLIC_MHGS_MHVN_HOST` / `NEXT_PUBLIC_MHGS_GP_HOST`) để tạo URL
 * tuyệt đối. `/media/` ở hệ A là public, không cần auth.
 */
const openFile = (url: string | null) => {
  const full = resolveChiHoFileUrl(url);
  if (!full) return;
  window.open(full, '_blank', 'noopener,noreferrer');
};

export function UploadRequestsTab() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('ALL');

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['chiho-uploads', statusFilter],
    () =>
      listChiHoUploads(
        statusFilter === 'ALL' ? undefined : (statusFilter as PanelApprovalStatus),
      ),
    { retry: false, keepPreviousData: true }
  );

  const rows = data?.data ?? [];

  // Xoá yêu cầu upload (chỉ PENDING) — backend mhvn enforce điều kiện.
  // Invalidate cả 2 query để các tab/widget khác (đếm Chờ duyệt) cập nhật theo.
  const deleteMutation = useMutation(
    (fileId: number) => deleteChiHoUpload(fileId),
    {
      onSuccess: () => {
        notification.success({
          message: 'Đã xoá yêu cầu tải lên',
          placement: 'top',
        });
        queryClient.invalidateQueries('chiho-uploads');
        queryClient.invalidateQueries('supplier-ke-cuoc-chi-ho');
      },
      onError: (e: any) => {
        notification.error({
          message:
            e?.response?.data?.detail ??
            e?.response?.data?.message ??
            'Xoá yêu cầu thất bại',
          placement: 'top',
        });
      },
    },
  );

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
                    <th className='px-3 py-2 text-center text-xs font-semibold'>
                      Hành động
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
                              href={resolveChiHoFileUrl(r.file_url) ?? undefined}
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
                        <td className='px-3 py-2 text-center'>
                          {r.approval_status === 'PENDING' ? (
                            <Popconfirm
                              title={
                                <div className='flex flex-col gap-1'>
                                  <span className='font-medium'>
                                    Xoá yêu cầu tải lên?
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {`File "${
                                      r.file_name ?? `file-${r.id}`
                                    }" sẽ bị xoá vĩnh viễn.`}
                                  </span>
                                </div>
                              }
                              okText='Xoá'
                              okButtonProps={{ danger: true }}
                              cancelText='Huỷ'
                              placement='topRight'
                              onConfirm={() => deleteMutation.mutate(r.id)}
                              disabled={deleteMutation.isLoading}
                            >
                              <button
                                title='Xoá yêu cầu (chỉ khi đang Chờ duyệt)'
                                className='rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-40'
                                disabled={deleteMutation.isLoading}
                              >
                                <Trash2Icon className='h-3.5 w-3.5' />
                              </button>
                            </Popconfirm>
                          ) : (
                            <span className='text-[10px] text-muted-foreground/60'>
                              —
                            </span>
                          )}
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
