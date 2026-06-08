/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';

import { DateRangePicker } from '@/components/DateRangePicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { type ChangeRequest, type ChangeRequestStatus } from './types';

const STATUS_BADGE: Record<
  ChangeRequestStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  'Chờ duyệt': 'warning',
  'Đã duyệt': 'success',
  'Từ chối': 'destructive',
  'Đang xử lý': 'secondary',
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

interface ChangeRequestListProps {
  requests: ChangeRequest[];
  onCancel: (id: string) => void;
}

export function ChangeRequestList({ requests, onCancel }: ChangeRequestListProps) {
  const [search, setSearch] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Lọc theo mã đề nghị + thời gian gửi, sắp xếp mới nhất trước
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests
      .filter((r) => {
        if (q && !r.code.toLowerCase().includes(q)) return false;
        if (dateRange?.from) {
          const from = dateRange.from;
          const to = dateRange.to ?? dateRange.from;
          const t = new Date(r.submittedAt);
          // so sánh theo ngày (bao trùm cả ngày "to")
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (t < from || t > end) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
  }, [requests, search, dateRange]);

  const hasActiveFilters = !!search || !!dateRange?.from;
  const clearFilters = () => {
    setSearch('');
    setDateRange(undefined);
  };

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* Filter bar */}
      <div className='shrink-0 border-b border-border bg-muted/20 px-4 py-3 md:px-6'>
        <div className='flex flex-wrap items-end gap-3'>
          <DateRangePicker
            label='Thời gian gửi'
            value={dateRange}
            onChange={setDateRange}
            className='w-full md:w-60'
          />
          <div className='flex flex-col gap-1'>
            <span className='text-xs font-medium text-foreground'>Mã đề nghị</span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='DNTD-2024-...'
              className='h-8 w-full text-xs md:w-44'
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              className='h-8 gap-1 text-xs text-muted-foreground hover:text-foreground'
              onClick={clearFilters}
            >
              <XCircleIcon className='h-3.5 w-3.5' />
              Xóa bộ lọc
            </Button>
          )}
          <div className='ml-auto flex items-end text-xs text-muted-foreground'>
            {filtered.length} đề nghị
          </div>
        </div>
      </div>

      {/* Table (desktop) / Card list (mobile) */}
      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        {/* Card list — mobile: thông tin chính + xem chi tiết + hủy */}
        <div className='flex flex-col gap-2 md:hidden'>
          {filtered.length === 0 ? (
            <div className='py-16 text-center text-xs text-muted-foreground'>
              Chưa có đề nghị thay đổi nào
            </div>
          ) : (
            filtered.map((req) => {
              const isOpen = expanded.has(req.id);
              return (
                <div
                  key={req.id}
                  className='rounded-md border border-border bg-background'
                >
                  <button
                    onClick={() => toggle(req.id)}
                    className='flex w-full flex-col gap-1.5 p-3 text-left'
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-sm font-semibold text-primary'>
                        {req.code}
                      </span>
                      <Badge variant={STATUS_BADGE[req.status]}>
                        {req.status}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span className='tabular-nums'>
                        {formatDateTime(req.submittedAt)}
                      </span>
                      <span>{req.items.length} trường</span>
                    </div>
                    <div className='flex items-center gap-1 text-xs font-medium text-primary'>
                      {isOpen ? (
                        <ChevronDownIcon className='h-3.5 w-3.5' />
                      ) : (
                        <ChevronRightIcon className='h-3.5 w-3.5' />
                      )}
                      {isOpen ? 'Ẩn chi tiết' : 'Xem chi tiết thay đổi'}
                    </div>
                  </button>

                  {isOpen && (
                    <div className='flex flex-col gap-2 border-t border-border px-3 py-2'>
                      {req.items.map((item, idx) => (
                        <div
                          key={`${item.rowId}-${item.field}-${idx}`}
                          className='rounded border border-border bg-muted/20 p-2 text-xs'
                        >
                          <div className='flex items-center justify-between'>
                            <span className='font-medium text-foreground'>
                              {item.billCode}
                            </span>
                            <span className='text-muted-foreground'>
                              {item.fieldLabel}
                            </span>
                          </div>
                          <div className='mt-1 flex items-center gap-1.5'>
                            <span className='text-muted-foreground line-through'>
                              {item.oldValue || '—'}
                            </span>
                            <ArrowRightIcon className='h-3 w-3 shrink-0 text-muted-foreground' />
                            <span className='font-medium text-emerald-600'>
                              {item.newValue || '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {req.status === 'Chờ duyệt' && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700'
                          onClick={() => {
                            if (
                              window.confirm(
                                `Hủy đề nghị ${req.code}? Yêu cầu duyệt sẽ bị xóa.`
                              )
                            ) {
                              onCancel(req.id);
                            }
                          }}
                        >
                          <Trash2Icon className='h-3.5 w-3.5' />
                          Hủy đề nghị
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Table — từ sm trở lên */}
        <div className='hidden w-full min-w-max rounded-md border border-border md:block'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted/40 text-left'>
                <th className='w-10 px-3 py-2' />
                <th className='px-3 py-2 text-xs font-semibold'>Mã đề nghị</th>
                <th className='px-3 py-2 text-xs font-semibold'>Thời gian gửi</th>
                <th className='px-3 py-2 text-xs font-semibold'>Trạng thái</th>
                <th className='px-3 py-2 text-xs font-semibold'>Số thay đổi</th>
                <th className='w-12 px-3 py-2' />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    Chưa có đề nghị thay đổi nào
                  </td>
                </tr>
              ) : (
                filtered.map((req, i) => {
                  const isOpen = expanded.has(req.id);
                  return (
                    <React.Fragment key={req.id}>
                      {/* Row nội dung đề nghị */}
                      <tr
                        onClick={() => toggle(req.id)}
                        className={cn(
                          'cursor-pointer border-b border-border transition-colors hover:bg-primary/5',
                          isOpen
                            ? 'bg-primary/5'
                            : i % 2 === 0
                              ? 'bg-background'
                              : 'bg-muted/10'
                        )}
                      >
                        <td className='px-3 py-2 text-muted-foreground'>
                          {isOpen ? (
                            <ChevronDownIcon className='h-4 w-4' />
                          ) : (
                            <ChevronRightIcon className='h-4 w-4' />
                          )}
                        </td>
                        <td className='px-3 py-2 text-xs font-medium text-primary'>
                          {req.code}
                        </td>
                        <td className='px-3 py-2 text-xs tabular-nums'>
                          {formatDateTime(req.submittedAt)}
                        </td>
                        <td className='px-3 py-2 text-xs'>
                          <Badge variant={STATUS_BADGE[req.status]}>
                            {req.status}
                          </Badge>
                        </td>
                        <td className='px-3 py-2 text-xs text-muted-foreground'>
                          {req.items.length} trường
                        </td>
                        <td className='px-3 py-2 text-center'>
                          {/* Chỉ đề nghị đang chờ duyệt mới được hủy */}
                          {req.status === 'Chờ duyệt' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Hủy đề nghị ${req.code}? Yêu cầu duyệt sẽ bị xóa.`
                                  )
                                ) {
                                  onCancel(req.id);
                                }
                              }}
                              className='rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600'
                              title='Hủy đề nghị'
                            >
                              <Trash2Icon className='h-3.5 w-3.5' />
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Child-rows: chi tiết các thông tin đề nghị thay đổi */}
                      {isOpen && (
                        <tr className='bg-muted/20'>
                          <td />
                          <td colSpan={5} className='px-3 py-2'>
                            <div className='overflow-hidden rounded-md border border-border bg-background'>
                              <table className='w-full border-collapse text-xs'>
                                <thead>
                                  <tr className='border-b border-border bg-muted/40 text-left text-muted-foreground'>
                                    <th className='px-3 py-1.5 font-medium'>Mã bill</th>
                                    <th className='px-3 py-1.5 font-medium'>Trường</th>
                                    <th className='px-3 py-1.5 font-medium'>Giá trị cũ</th>
                                    <th className='px-3 py-1.5 font-medium'></th>
                                    <th className='px-3 py-1.5 font-medium'>Giá trị mới</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {req.items.map((item, idx) => (
                                    <tr
                                      key={`${item.rowId}-${item.field}-${idx}`}
                                      className='border-b border-border last:border-0'
                                    >
                                      <td className='px-3 py-1.5 font-medium text-foreground'>
                                        {item.billCode}
                                      </td>
                                      <td className='px-3 py-1.5 text-foreground'>
                                        {item.fieldLabel}
                                      </td>
                                      <td className='px-3 py-1.5 text-muted-foreground line-through'>
                                        {item.oldValue || '—'}
                                      </td>
                                      <td className='px-3 py-1.5 text-muted-foreground'>
                                        <ArrowRightIcon className='h-3 w-3' />
                                      </td>
                                      <td className='px-3 py-1.5 font-medium text-emerald-600'>
                                        {item.newValue || '—'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
