/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArrowRightIcon,
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

interface FlatRow {
  reqId: string;
  reqCode: string;
  submittedAt: string;
  status: ChangeRequestStatus;
  billCode: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  rowKey: string;
}

function flattenRequests(requests: ChangeRequest[]): FlatRow[] {
  return requests.flatMap((req) =>
    req.items.map((item, idx) => ({
      reqId: req.id,
      reqCode: req.code,
      submittedAt: req.submittedAt,
      status: req.status,
      billCode: item.billCode,
      fieldLabel: item.fieldLabel,
      oldValue: item.oldValue,
      newValue: item.newValue,
      rowKey: `${req.id}-${item.rowId}-${item.field}-${idx}`,
    }))
  );
}

interface ChangeRequestListProps {
  requests: ChangeRequest[];
  onCancel: (id: string) => void;
}

export function ChangeRequestList({ requests, onCancel }: ChangeRequestListProps) {
  const [search, setSearch] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...requests].sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    const filteredReqs = sorted.filter((r) => {
      if (q && !r.code.toLowerCase().includes(q)) return false;
      if (dateRange?.from) {
        const from = dateRange.from;
        const to = dateRange.to ?? dateRange.from;
        const t = new Date(r.submittedAt);
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (t < from || t > end) return false;
      }
      return true;
    });
    return flattenRequests(filteredReqs);
  }, [requests, search, dateRange]);

  const hasActiveFilters = !!search || !!dateRange?.from;
  const clearFilters = () => {
    setSearch('');
    setDateRange(undefined);
  };

  const handleCancel = (reqId: string, reqCode: string) => {
    if (window.confirm(`Hủy đề nghị ${reqCode}? Yêu cầu duyệt sẽ bị xóa.`)) {
      onCancel(reqId);
    }
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
            {filtered.length} bản ghi
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        {/* Card list — mobile */}
        <div className='flex flex-col gap-2 md:hidden'>
          {filtered.length === 0 ? (
            <div className='py-16 text-center text-xs text-muted-foreground'>
              Chưa có đề nghị thay đổi nào
            </div>
          ) : (
            filtered.map((row) => (
              <div
                key={row.rowKey}
                className='rounded-md border border-border bg-background p-3'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-sm font-semibold text-primary'>
                    {row.reqCode}
                  </span>
                  <Badge variant={STATUS_BADGE[row.status]}>{row.status}</Badge>
                </div>
                <div className='mt-1 text-xs text-muted-foreground tabular-nums'>
                  {formatDateTime(row.submittedAt)}
                </div>
                <div className='mt-2 flex items-center justify-between text-xs'>
                  <span className='font-medium text-foreground'>{row.billCode}</span>
                  <span className='text-muted-foreground'>{row.fieldLabel}</span>
                </div>
                <div className='mt-1 flex items-center gap-1.5 text-xs'>
                  <span className='text-muted-foreground line-through'>
                    {row.oldValue || '—'}
                  </span>
                  <ArrowRightIcon className='h-3 w-3 shrink-0 text-muted-foreground' />
                  <span className='font-medium text-emerald-600'>
                    {row.newValue || '—'}
                  </span>
                </div>
                {row.status === 'Chờ duyệt' && (
                  <div className='mt-2 border-t border-border pt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700'
                      onClick={() => handleCancel(row.reqId, row.reqCode)}
                    >
                      <Trash2Icon className='h-3.5 w-3.5' />
                      Hủy đề nghị
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
                <th className='px-3 py-2 text-xs font-semibold'>Mã đề nghị</th>
                <th className='px-3 py-2 text-xs font-semibold'>Thời gian gửi</th>
                <th className='px-3 py-2 text-xs font-semibold'>Mã bill</th>
                <th className='px-3 py-2 text-xs font-semibold'>Trường thay đổi</th>
                <th className='px-3 py-2 text-xs font-semibold'>Giá trị cũ</th>
                <th className='px-3 py-2 text-xs font-semibold' />
                <th className='px-3 py-2 text-xs font-semibold'>Giá trị mới</th>
                <th className='px-3 py-2 text-xs font-semibold'>Trạng thái</th>
                <th className='w-12 px-3 py-2' />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    Chưa có đề nghị thay đổi nào
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr
                    key={row.rowKey}
                    className={cn(
                      'border-b border-border',
                      i % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    )}
                  >
                    <td className='px-3 py-2 text-xs font-medium text-primary'>
                      {row.reqCode}
                    </td>
                    <td className='px-3 py-2 text-xs tabular-nums text-muted-foreground'>
                      {formatDateTime(row.submittedAt)}
                    </td>
                    <td className='px-3 py-2 text-xs font-medium text-foreground'>
                      {row.billCode}
                    </td>
                    <td className='px-3 py-2 text-xs text-foreground'>
                      {row.fieldLabel}
                    </td>
                    <td className='px-3 py-2 text-xs text-muted-foreground line-through'>
                      {row.oldValue || '—'}
                    </td>
                    <td className='px-3 py-2 text-xs text-muted-foreground'>
                      <ArrowRightIcon className='h-3 w-3' />
                    </td>
                    <td className='px-3 py-2 text-xs font-medium text-emerald-600'>
                      {row.newValue || '—'}
                    </td>
                    <td className='px-3 py-2 text-xs'>
                      <Badge variant={STATUS_BADGE[row.status]}>{row.status}</Badge>
                    </td>
                    <td className='px-3 py-2 text-center'>
                      {row.status === 'Chờ duyệt' && (
                        <button
                          onClick={() => handleCancel(row.reqId, row.reqCode)}
                          className='rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600'
                          title='Hủy đề nghị'
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
