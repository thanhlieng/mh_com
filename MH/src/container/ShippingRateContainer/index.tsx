/* eslint-disable @typescript-eslint/no-explicit-any */
import { isWithinInterval, parseISO } from 'date-fns';
import {
  RouteIcon,
  SearchIcon,
  UploadCloudIcon,
  XCircleIcon,
} from 'lucide-react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';

import { DateRangePicker } from '@/components/DateRangePicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';

import { FAKE_SHIPPING_RATES } from './fakeData';
import { type RateStatus, type ShippingRate } from './types';
import { UploadRateModal } from './UploadRateModal';

const formatVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatDate = (iso: string) => {
  try {
    return parseISO(iso).toLocaleDateString('vi-VN');
  } catch {
    return iso;
  }
};

const STATUS_BADGE: Record<
  RateStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  'Đang áp dụng': 'success',
  'Hết hiệu lực': 'outline',
  Nháp: 'secondary',
};

const ShippingRateContainer = () => {
  const [rates, setRates] = React.useState<ShippingRate[]>(() =>
    FAKE_SHIPPING_RATES.map((r) => ({ ...r }))
  );
  const [search, setSearch] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [showUpload, setShowUpload] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rates.filter((r) => {
      if (q) {
        const haystack =
          `${r.routeCode} ${r.origin} ${r.destination} ${r.vehicleType}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (dateRange?.from) {
        const from = dateRange.from;
        const to = dateRange.to ?? dateRange.from;
        try {
          if (
            !isWithinInterval(parseISO(r.effectiveDate), { start: from, end: to })
          )
            return false;
        } catch {
          /* giữ lại nếu ngày không hợp lệ */
        }
      }
      return true;
    });
  }, [rates, search, dateRange]);

  const hasActiveFilters = !!search || !!dateRange?.from;
  const clearFilters = () => {
    setSearch('');
    setDateRange(undefined);
  };

  // Giả lập: sau khi upload file, thêm 1 dòng nháp để demo (chưa nối backend)
  const handleUploaded = (file: File) => {
    const now = new Date();
    setRates((prev) => [
      {
        id: `new-${now.getTime()}`,
        routeCode: 'TR-MỚI',
        origin: '—',
        destination: '—',
        vehicleType: `Từ file: ${file.name}`,
        unit: '—',
        price: 0,
        effectiveDate: now.toISOString().slice(0, 10),
        status: 'Nháp',
      },
      ...prev,
    ]);
    setShowUpload(false);
  };

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* ── Page header ── */}
      <div className='flex shrink-0 flex-col gap-2 border-b border-border px-4 py-2 md:h-14 md:flex-row md:flex-wrap md:items-center md:gap-3 md:px-6 md:py-0'>
        <div className='flex items-center gap-2'>
          <RouteIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
          <h1 className='text-sm font-semibold'>Chi phí vận chuyển theo tuyến</h1>
        </div>

        <div className='relative w-full md:ml-4 md:w-72'>
          <SearchIcon className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Tìm mã tuyến, điểm đi/đến, phương tiện...'
            className='h-8 pl-8 text-xs'
          />
        </div>

        <div className='flex items-center gap-3 md:ml-auto'>
          <span className='text-xs text-muted-foreground'>
            {filtered.length} tuyến
          </span>
          <Button
            size='sm'
            className='h-8 gap-1.5 text-xs'
            onClick={() => setShowUpload(true)}
          >
            <UploadCloudIcon className='h-3.5 w-3.5' />
            Upload giá mới
          </Button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className='shrink-0 border-b border-border bg-muted/20 px-4 py-3 md:px-6'>
        <div className='flex flex-wrap items-end gap-3'>
          <DateRangePicker
            label='Ngày áp dụng'
            value={dateRange}
            onChange={setDateRange}
            className='w-full md:w-60'
          />
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
        </div>
      </div>

      {/* ── Table (desktop) / Card list (mobile) ── */}
      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        {/* Card list — mobile */}
        <div className='flex flex-col gap-2 md:hidden'>
          {filtered.length === 0 ? (
            <div className='py-16 text-center text-xs text-muted-foreground'>
              Không tìm thấy tuyến phù hợp
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className='flex flex-col gap-1.5 rounded-md border border-border bg-background p-3'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-sm font-semibold text-primary'>
                    {r.routeCode}
                  </span>
                  <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
                </div>
                <div className='text-xs text-foreground'>
                  {r.origin} → {r.destination}
                </div>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>{r.vehicleType}</span>
                  <span>{formatDate(r.effectiveDate)}</span>
                </div>
                <div className='flex items-center justify-between border-t border-border pt-1'>
                  <span className='text-[11px] text-muted-foreground'>
                    Đơn giá / {r.unit}
                  </span>
                  <span className='text-sm font-semibold tabular-nums text-foreground'>
                    {formatVND(r.price)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table — PC */}
        <div className='hidden w-full min-w-max rounded-md border border-border md:block'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted/40 text-left'>
                <th className='px-3 py-2 text-xs font-semibold'>Mã tuyến</th>
                <th className='px-3 py-2 text-xs font-semibold'>Điểm đi</th>
                <th className='px-3 py-2 text-xs font-semibold'>Điểm đến</th>
                <th className='px-3 py-2 text-xs font-semibold'>Phương tiện</th>
                <th className='px-3 py-2 text-xs font-semibold'>Đơn vị</th>
                <th className='px-3 py-2 text-right text-xs font-semibold'>
                  Đơn giá
                </th>
                <th className='px-3 py-2 text-xs font-semibold'>Ngày áp dụng</th>
                <th className='px-3 py-2 text-xs font-semibold'>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    Không tìm thấy tuyến phù hợp
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={cn(
                      'border-b border-border transition-colors hover:bg-primary/5',
                      i % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    )}
                  >
                    <td className='px-3 py-2 text-xs font-medium text-primary'>
                      {r.routeCode}
                    </td>
                    <td className='px-3 py-2 text-xs'>{r.origin}</td>
                    <td className='px-3 py-2 text-xs'>{r.destination}</td>
                    <td className='px-3 py-2 text-xs'>{r.vehicleType}</td>
                    <td className='px-3 py-2 text-xs'>{r.unit}</td>
                    <td className='px-3 py-2 text-right text-xs font-semibold tabular-nums'>
                      {formatVND(r.price)}
                    </td>
                    <td className='px-3 py-2 text-xs'>
                      {formatDate(r.effectiveDate)}
                    </td>
                    <td className='px-3 py-2 text-xs'>
                      <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Upload modal ── */}
      {showUpload && (
        <UploadRateModal
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
};

export default withPrivateRouteSupplier(ShippingRateContainer);
