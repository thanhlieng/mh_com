/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowRightIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { notification } from 'antd';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  deleteSupplierPriceChange,
  getSupplierPriceChanges,
} from '@/services/supplier.services';
import type {
  PriceChangeStatus,
  SupplierPriceChange,
} from '@/services/supplier.services';

import {
  CHANGE_TYPE_LABEL,
  SOURCE_LABEL,
  STATUS_FILTER_OPTIONS,
  STATUS_LABEL,
} from './types';

const STATUS_BADGE: Record<
  PriceChangeStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  CONFLICT: 'secondary',
};

const formatVND = (n: number | string | null | undefined) => {
  const num = n == null || n === '' ? null : Number(n);
  return num == null || Number.isNaN(num)
    ? '—'
    : num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const formatDateTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
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
 * Danh sách "Yêu cầu thay đổi giá" (filter trạng thái + bảng + xóa yêu cầu PENDING).
 * Dùng kiểu bảng HTML + Tailwind giống các màn supplier khác (Quản lý chi hộ,
 * Bảng kê chi phí), thay cho Ant Design Table.
 */
export function PriceChangeList() {
  const [status, setStatus] = React.useState<string>('');
  const queryClient = useQueryClient();

  const { data, isFetching, refetch } = useQuery(
    ['supplier-price-changes', status],
    () => getSupplierPriceChanges(status || undefined),
    {
      keepPreviousData: true,
      retry: false,
      onError: (e: any) => {
        notification.error({
          message: e?.response?.data?.message
            ? `${e.response.data.message}`
            : 'Tải danh sách yêu cầu thay đổi giá thất bại',
          placement: 'top',
        });
      },
    },
  );

  const deleteMutation = useMutation(deleteSupplierPriceChange, {
    onSuccess: () => {
      queryClient.invalidateQueries('supplier-price-changes');
      notification.success({ message: 'Đã xóa yêu cầu', placement: 'top' });
    },
    onError: (e: any) => {
      notification.error({
        message:
          e?.response?.data?.message ||
          e?.response?.data?.detail ||
          'Xóa yêu cầu thất bại',
        placement: 'top',
      });
    },
  });

  const rows = data?.results ?? [];

  const handleDelete = (r: SupplierPriceChange) => {
    if (window.confirm('Xóa yêu cầu thay đổi giá này?')) {
      deleteMutation.mutate(r.id);
    }
  };

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* ── Filter bar ── */}
      <div className='shrink-0 border-b border-border bg-muted/20 px-4 py-3 md:px-6'>
        <div className='flex flex-wrap items-center gap-2'>
          {STATUS_FILTER_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value || 'all'}
                type='button'
                onClick={() => setStatus(opt.value)}
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
          <Button
            variant='outline'
            size='sm'
            className='ml-auto h-8 gap-1.5 text-xs'
            onClick={() => refetch()}
            disabled={isFetching}
            title='Tải lại dữ liệu'
          >
            <RefreshCwIcon
              className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
            />
            Tải lại
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        {/* Card list — mobile */}
        <div className='flex flex-col gap-2 md:hidden'>
          {rows.length === 0 ? (
            <div className='py-16 text-center text-xs text-muted-foreground'>
              Chưa có yêu cầu thay đổi giá
            </div>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className='rounded-md border border-border bg-background p-3'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-medium text-foreground'>
                    {r.label || '—'}
                  </span>
                  <Badge variant={STATUS_BADGE[r.status]}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </div>
                <div className='mt-1 text-[11px] text-muted-foreground'>
                  {CHANGE_TYPE_LABEL[r.change_type] ?? r.change_type} ·{' '}
                  {SOURCE_LABEL[r.source] ?? r.source} ·{' '}
                  {r.created_at ? formatDateTime(r.created_at) : '—'}
                </div>
                <div className='mt-1.5 flex items-center gap-1.5 text-xs tabular-nums'>
                  <span className='text-muted-foreground line-through'>
                    {formatVND(r.old_amount)}
                  </span>
                  <ArrowRightIcon className='h-3 w-3 shrink-0 text-muted-foreground' />
                  <span className='font-semibold text-foreground'>
                    {formatVND(r.new_amount)}
                  </span>
                </div>
                {r.reason && (
                  <div className='mt-2 rounded border border-border bg-muted/30 p-2 text-[11px]'>
                    <div className='font-medium text-muted-foreground'>
                      Lý do của bạn
                    </div>
                    <div className='mt-0.5 whitespace-pre-wrap text-foreground'>
                      {r.reason}
                    </div>
                  </div>
                )}
                {r.review_note && (
                  <div className='mt-1.5 rounded border border-blue-200 bg-blue-50 p-2 text-[11px]'>
                    <div className='font-medium text-blue-700'>
                      Phản hồi từ MH
                      {r.approved_by ? ` (${r.approved_by})` : ''}
                    </div>
                    <div className='mt-0.5 whitespace-pre-wrap text-blue-900'>
                      {r.review_note}
                    </div>
                  </div>
                )}
                {r.status === 'PENDING' && (
                  <div className='mt-2 border-t border-border pt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700'
                      onClick={() => handleDelete(r)}
                      disabled={deleteMutation.isLoading}
                    >
                      <Trash2Icon className='h-3.5 w-3.5' />
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Table — desktop */}
        <div className='hidden w-full min-w-max rounded-md border border-border md:block'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted/40 text-left'>
                <th className='px-3 py-2 text-xs font-semibold'>STT</th>
                <th className='px-3 py-2 text-xs font-semibold'>Loại</th>
                <th className='px-3 py-2 text-xs font-semibold'>Tuyến / Dịch vụ</th>
                <th className='px-3 py-2 text-xs font-semibold'>Giá cũ</th>
                <th className='px-3 py-2 text-xs font-semibold' />
                <th className='px-3 py-2 text-xs font-semibold'>Giá mới</th>
                <th className='px-3 py-2 text-xs font-semibold'>Nguồn</th>
                <th className='px-3 py-2 text-xs font-semibold'>Lý do của bạn</th>
                <th className='px-3 py-2 text-xs font-semibold'>Phản hồi MH</th>
                <th className='px-3 py-2 text-xs font-semibold'>Trạng thái</th>
                <th className='px-3 py-2 text-xs font-semibold'>Ngày tạo</th>
                <th className='px-3 py-2 text-xs font-semibold'>Người duyệt</th>
                <th className='w-12 px-3 py-2' />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    Chưa có yêu cầu thay đổi giá
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
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
                    <td className='px-3 py-2 text-xs'>
                      <Badge variant='secondary'>
                        {CHANGE_TYPE_LABEL[r.change_type] ?? r.change_type}
                      </Badge>
                    </td>
                    <td className='px-3 py-2 text-xs text-foreground'>
                      {r.label || '—'}
                    </td>
                    <td className='px-3 py-2 text-xs tabular-nums text-muted-foreground line-through'>
                      {formatVND(r.old_amount)}
                    </td>
                    <td className='px-3 py-2 text-xs text-muted-foreground'>
                      <ArrowRightIcon className='h-3 w-3' />
                    </td>
                    <td className='px-3 py-2 text-xs font-semibold tabular-nums text-foreground'>
                      {formatVND(r.new_amount)}
                    </td>
                    <td className='px-3 py-2 text-xs text-foreground'>
                      {SOURCE_LABEL[r.source] ?? r.source}
                    </td>
                    <td className='px-3 py-2 align-top text-xs text-foreground'>
                      {r.reason ? (
                        <span
                          title={r.reason}
                          className='block max-w-[220px]'
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {r.reason}
                        </span>
                      ) : (
                        <span className='italic text-muted-foreground/60'>
                          —
                        </span>
                      )}
                    </td>
                    <td className='px-3 py-2 align-top text-xs'>
                      {r.review_note ? (
                        <>
                          <span
                            title={r.review_note}
                            className='block max-w-[220px] text-blue-900'
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {r.review_note}
                          </span>
                          {r.approved_by && (
                            <div className='mt-0.5 text-[10px] text-muted-foreground'>
                              {r.approved_by}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className='italic text-muted-foreground/60'>
                          {r.status === 'PENDING' ? 'Chưa duyệt' : '—'}
                        </span>
                      )}
                    </td>
                    <td className='px-3 py-2 text-xs'>
                      <Badge variant={STATUS_BADGE[r.status]}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
                    </td>
                    <td className='px-3 py-2 text-xs tabular-nums text-muted-foreground'>
                      {r.created_at ? formatDateTime(r.created_at) : '—'}
                    </td>
                    <td className='px-3 py-2 text-xs text-foreground'>
                      {r.approved_by || '—'}
                    </td>
                    <td className='px-3 py-2 text-center'>
                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => handleDelete(r)}
                          disabled={deleteMutation.isLoading}
                          className='rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-40'
                          title='Xóa yêu cầu'
                        >
                          <Trash2Icon className='h-3.5 w-3.5' />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
