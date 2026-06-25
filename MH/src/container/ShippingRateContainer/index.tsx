/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification, Select } from 'antd';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  RouteIcon,
  SearchIcon,
  UploadCloudIcon,
  XCircleIcon,
} from 'lucide-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { cn } from '@/lib/utils';

import { DateRangePicker } from '@/components/DateRangePicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';
import type {
  SupplierPrice,
  SupplierPricesParams,
  SupplierPriceSort,
} from '@/services/supplier.services';
import {
  getSupplierPriceFilterOptions,
  getSupplierPrices,
  updateSupplierPrices,
} from '@/services/supplier.services';

import {
  ConfirmChangesModal,
  type DirtyRowChange,
} from '../CostStatementContainer/ConfirmChangesModal';
import { PriceChangeList } from '../SupplierPriceChangeContainer/PriceChangeList';
import { UploadRateModal } from './UploadRateModal';

/** Lý do mặc định khi đề nghị đổi giá tuyến đường (shipping rate). */
const DEFAULT_RATE_REASON =
  'Cập nhật giá tuyến đường theo tình hình thực tế, MH xem xét yêu cầu';

const PAGE_SIZE = 20;

type TabKey = 'rates' | 'changes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v: number | string | null | undefined): number => {
  if (v == null || v === '') return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

const formatNum = (v: number | string | null | undefined): string =>
  toNum(v).toLocaleString('vi-VN');

const formatDisplay = (v: number | string | null | undefined): string =>
  v == null || v === '' ? '-' : toNum(v).toLocaleString('vi-VN');

const formatDateTime = (iso: string | null): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

/** Nhãn tuyến: server đã build sẵn chuỗi vào route_type. */
const routeLabel = (r: SupplierPrice): string =>
  r.route_type || (r.route_id != null ? String(r.route_id) : '-');

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * Sinh danh sách trang hiển thị có dấu "…" (ellipsis): luôn có trang đầu/cuối,
 * và ±1 quanh trang hiện tại. 'gap' = chỗ rút gọn.
 */
function buildPageItems(
  current: number,
  totalPages: number,
): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < totalPages) pages.add(current + 1);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push('gap');
    out.push(p);
    prev = p;
  }
  return out;
}

// ─── Editable numeric cell (cột Đơn giá) ───────────────────────────────────────

function EditableNumericCell({
  value,
  formatted,
  isDirty = false,
  onCommit,
}: {
  value: number;
  formatted: string;
  isDirty?: boolean;
  onCommit: (v: number) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) ref.current?.select();
  }, [editing]);
  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    setEditing(false);
    const num = parseFloat(draft.replace(/[^0-9.-]/g, ''));
    if (!isNaN(num) && num !== value) onCommit(num);
  };

  if (editing) {
    return (
      <Input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        className={cn(
          'h-7 w-full px-2 py-0 text-right text-xs tabular-nums',
          isDirty && 'border-amber-400 focus-visible:ring-amber-300'
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        'min-h-[28px] cursor-pointer rounded px-1 py-1 text-right text-xs tabular-nums hover:bg-accent',
        isDirty && 'border-l-2 border-amber-400 bg-amber-50 pr-1 text-amber-900'
      )}
      onClick={() => setEditing(true)}
      title={
        isDirty
          ? 'Đã chỉnh sửa — Click để tiếp tục chỉnh sửa'
          : 'Click để chỉnh sửa'
      }
    >
      {formatted}
    </div>
  );
}

// ─── Edit tracking (key = price id) — sống xuyên các trang ─────────────────────

interface EditEntry {
  amount: number;
  original: number;
  serviceName: string;
  containerName: string;
  routeLabel: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

const ShippingRateContainer = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<TabKey>('rates');
  React.useEffect(() => {
    if (router.isReady && router.query.tab === 'changes') {
      setActiveTab('changes');
    }
  }, [router.isReady, router.query.tab]);

  // ── Bộ lọc (draft — chỉ áp dụng khi bấm "Áp dụng") ──────────────────────────
  const [routeId, setRouteId] = React.useState<number | undefined>();
  const [serviceId, setServiceId] = React.useState<number | undefined>();
  const [keyword, setKeyword] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // ── Tham số thực sự gửi lên server (gồm phân trang + sort) ──────────────────
  // Sort mặc định: giá cao → thấp.
  const [params, setParams] = React.useState<SupplierPricesParams>({
    page: 1,
    page_size: PAGE_SIZE,
    sort: 'amount_desc',
  });

  const apiQuery = useQuery(
    ['supplier-prices', params],
    () => getSupplierPrices(params),
    {
      keepPreviousData: true,
      retry: false,
      onError: (e: any) => {
        notification.error({
          message: e?.response?.data?.message
            ? `${e.response.data.message}`
            : 'Tải giá vận chuyển thất bại',
          placement: 'top',
        });
      },
    }
  );

  // Filter options (routes + services) — cache lâu vì ít đổi.
  const optionsQuery = useQuery(
    ['supplier-price-filter-options'],
    getSupplierPriceFilterOptions,
    { staleTime: 5 * 60 * 1000, retry: false }
  );

  const rows: SupplierPrice[] = apiQuery.data?.results ?? [];
  const total = apiQuery.data?.count ?? 0;
  const currentPage = params.page ?? 1;
  const pageSize = params.page_size ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [showUpload, setShowUpload] = React.useState(false);

  // Edits keyed theo price id → sống xuyên các trang.
  const [edits, setEdits] = React.useState<Record<number, EditEntry>>({});
  const [reasonMap, setReasonMap] = React.useState<Record<string, string>>({});
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);

  const handleUploaded = (created: number) => {
    setShowUpload(false);
    notification.success({
      message: `Đã tạo ${created} yêu cầu thay đổi giá từ file`,
      description: 'Các thay đổi cần được duyệt trước khi áp dụng.',
      placement: 'top',
    });
    queryClient.invalidateQueries(['supplier-prices']);
    setActiveTab('changes');
  };

  // Giá hiển thị của 1 dòng = giá đã sửa (nếu có) hoặc giá gốc từ server.
  const displayedAmount = (r: SupplierPrice): number =>
    edits[r.id] ? edits[r.id].amount : toNum(r.amount);

  const isRowDirty = (r: SupplierPrice): boolean =>
    !!edits[r.id] && edits[r.id].amount !== edits[r.id].original;

  const handleUpdate = React.useCallback(
    (r: SupplierPrice, value: number) => {
      setEdits((prev) => ({
        ...prev,
        [r.id]: {
          amount: value,
          original: toNum(r.amount),
          serviceName: r.service_name,
          containerName: r.container_name,
          routeLabel: routeLabel(r),
        },
      }));
    },
    []
  );

  // Bỏ tất cả chỉnh sửa (mọi trang).
  const handleClear = () => {
    setEdits({});
    setReasonMap({});
  };

  const updateMutation = useMutation(updateSupplierPrices, {
    onSuccess: (res) => {
      notification.success({
        message: `Đã gửi ${res?.created ?? 0} yêu cầu thay đổi giá`,
        description: 'Thay đổi cần được duyệt trước khi áp dụng.',
        placement: 'top',
      });
      if (res?.skipped?.length) {
        notification.warning({
          message: `${res.skipped.length} dòng bị bỏ qua`,
          description: `ID bị bỏ qua: ${res.skipped.join(', ')}`,
          placement: 'top',
        });
      }
      setEdits({});
      setReasonMap({});
      setConfirmModalOpen(false);
      queryClient.invalidateQueries(['supplier-prices']);
      setActiveTab('changes');
    },
    onError: (e: any) => {
      notification.error({
        message: e?.response?.data?.message
          ? `${e.response.data.message}`
          : 'Gửi yêu cầu thay đổi giá thất bại',
        placement: 'top',
      });
    },
  });

  // Tập thay đổi hợp lệ (chênh lệch thật) — gom từ mọi trang.
  const dirtyChanges: (DirtyRowChange & { priceId: number })[] =
    React.useMemo(() => {
      const out: (DirtyRowChange & { priceId: number })[] = [];
      for (const [idStr, e] of Object.entries(edits)) {
        if (e.amount === e.original) continue;
        out.push({
          key: idStr,
          orderCode: e.serviceName,
          containerNo: e.containerName,
          serviceName: e.routeLabel,
          oldAmount: e.original,
          newAmount: e.amount,
          priceId: Number(idStr),
        });
      }
      return out;
    }, [edits]);

  const dirtyRowCount = dirtyChanges.length;

  const handleOpenConfirm = () => {
    if (dirtyChanges.length === 0) return;
    setReasonMap((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const c of dirtyChanges) {
        if (next[c.key] === undefined) next[c.key] = DEFAULT_RATE_REASON;
      }
      return next;
    });
    setConfirmModalOpen(true);
  };

  const handleReasonChange = React.useCallback((key: string, value: string) => {
    setReasonMap((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetReason = React.useCallback((key: string) => {
    setReasonMap((prev) => ({ ...prev, [key]: DEFAULT_RATE_REASON }));
  }, []);

  const handleSubmitChanges = async () => {
    const items = dirtyChanges.map((c) => ({
      id: c.priceId,
      amount: c.newAmount,
      reason: (reasonMap[c.key] ?? DEFAULT_RATE_REASON).trim(),
    }));
    if (items.length === 0) return;
    try {
      await updateMutation.mutateAsync(items);
    } catch {
      // error đã được toast bởi react-query onError
    }
  };

  const sortValue: SupplierPriceSort = params.sort ?? 'amount_desc';

  // Sort áp dụng ngay (không cần bấm "Áp dụng"), giữ nguyên các filter hiện tại.
  const handleChangeSort = (value: SupplierPriceSort) => {
    setParams((prev) => ({ ...prev, page: 1, sort: value }));
  };

  // ── Filter apply / clear ────────────────────────────────────────────────────
  const handleApplyFilters = () => {
    const next: SupplierPricesParams = {
      page: 1,
      page_size: pageSize,
      sort: sortValue,
    };
    if (routeId != null) next.route_id = routeId;
    if (serviceId != null) next.service_id = serviceId;
    if (keyword.trim()) next.q = keyword.trim();
    if (dateRange?.from) next.effective_from = format(dateRange.from, 'yyyy-MM-dd');
    if (dateRange?.to) next.effective_to = format(dateRange.to, 'yyyy-MM-dd');
    setParams(next);
  };

  const hasActiveFilters =
    routeId != null ||
    serviceId != null ||
    !!keyword.trim() ||
    !!dateRange?.from;

  const handleClearFilters = () => {
    setRouteId(undefined);
    setServiceId(undefined);
    setKeyword('');
    setDateRange(undefined);
    setParams({ page: 1, page_size: pageSize, sort: sortValue });
  };

  const goToPage = (p: number) => {
    const target = Math.min(Math.max(1, p), totalPages);
    setParams((prev) => ({ ...prev, page: target }));
  };

  const handleChangePageSize = (size: number) => {
    // Đổi số phần tử/trang → quay về trang 1 để tránh lệch offset.
    setParams((prev) => ({ ...prev, page: 1, page_size: size }));
  };

  const routeOptions = optionsQuery.data?.routes ?? [];
  const serviceOptions = optionsQuery.data?.services ?? [];

  const COLSPAN = 9;

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* ── Page header ── */}
      <div className='flex shrink-0 items-center gap-3 border-b border-border px-4 py-2 md:px-6'>
        <RouteIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
        <h1 className='text-sm font-semibold'>Thiết lập giá vận chuyển</h1>
        {dirtyRowCount > 0 && (
          <Badge variant='warning' className='gap-1'>
            <PencilIcon className='h-3 w-3' />
            {dirtyRowCount} thay đổi
          </Badge>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className='flex shrink-0 items-center gap-1 border-b border-border px-4 md:px-6'>
        {([
          { key: 'rates', label: 'Thiết lập giá' },
          { key: 'changes', label: 'Yêu cầu thay đổi giá' },
        ] as { key: TabKey; label: string }[]).map((t) => (
          <button
            key={t.key}
            type='button'
            onClick={() => setActiveTab(t.key)}
            className={cn(
              '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors',
              activeTab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'changes' && <PriceChangeList />}

      {activeTab === 'rates' && (
        <>
          {/* ── Filter bar ── */}
          <div className='shrink-0 border-b border-border bg-muted/20 px-4 py-3 md:px-6'>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex flex-col gap-1'>
                <Label>Tuyến đường</Label>
                <Select
                  allowClear
                  showSearch
                  value={routeId}
                  placeholder='Tất cả tuyến'
                  optionFilterProp='label'
                  loading={optionsQuery.isLoading}
                  onChange={(v) => setRouteId(v ?? undefined)}
                  style={{ width: 240 }}
                  options={routeOptions.map((r) => ({
                    value: r.id,
                    label: r.label,
                  }))}
                  size='small'
                />
              </div>

              <div className='flex flex-col gap-1'>
                <Label>Dịch vụ</Label>
                <Select
                  allowClear
                  showSearch
                  value={serviceId}
                  placeholder='Tất cả dịch vụ'
                  optionFilterProp='label'
                  loading={optionsQuery.isLoading}
                  onChange={(v) => setServiceId(v ?? undefined)}
                  style={{ width: 180 }}
                  options={serviceOptions.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  size='small'
                />
              </div>

              <div className='flex flex-col gap-1'>
                <Label>Sắp xếp giá</Label>
                <Select<SupplierPriceSort>
                  value={sortValue}
                  onChange={handleChangeSort}
                  style={{ width: 160 }}
                  size='small'
                  options={[
                    { value: 'amount_desc', label: 'Giá: cao → thấp' },
                    { value: 'amount_asc', label: 'Giá: thấp → cao' },
                  ]}
                />
              </div>

              <DateRangePicker
                label='Thời gian áp dụng'
                value={dateRange}
                onChange={setDateRange}
                className='w-full md:w-60'
              />

              <div className='flex flex-col gap-1'>
                <Label>Tìm kiếm</Label>
                <div className='relative'>
                  <SearchIcon className='absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyFilters();
                    }}
                    placeholder='Loại cont, loại hàng, dịch vụ...'
                    className='h-8 w-full pl-7 text-xs md:w-64'
                  />
                </div>
              </div>

              <div className='flex items-end gap-2'>
                <Button
                  size='sm'
                  className='h-8 text-xs'
                  onClick={handleApplyFilters}
                >
                  Áp dụng
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 gap-1 text-xs text-muted-foreground hover:text-foreground'
                    onClick={handleClearFilters}
                  >
                    <XCircleIcon className='h-3.5 w-3.5' />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>

              <div className='flex items-end gap-2 md:ml-auto'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 shrink-0 gap-1.5 text-xs'
                  onClick={() => apiQuery.refetch()}
                  disabled={apiQuery.isFetching}
                  title='Tải lại dữ liệu'
                >
                  <RefreshCwIcon
                    className={cn(
                      'h-3.5 w-3.5',
                      apiQuery.isFetching && 'animate-spin'
                    )}
                  />
                  Tải lại
                </Button>
                <Button
                  size='sm'
                  className='h-8 shrink-0 gap-1.5 text-xs'
                  onClick={() => setShowUpload(true)}
                >
                  <UploadCloudIcon className='h-3.5 w-3.5' />
                  Upload Excel giá
                </Button>
              </div>
            </div>
          </div>

          {/* ── Hint + dirty action bar ── */}
          {dirtyRowCount > 0 ? (
            <div className='flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-amber-200 bg-amber-50 px-4 py-2 md:px-6'>
              <PencilIcon className='h-3.5 w-3.5 shrink-0 text-amber-600' />
              <span className='text-xs text-amber-700'>
                <span className='font-semibold'>{dirtyRowCount} thay đổi</span>{' '}
                chưa gửi (gồm cả các trang khác).
              </span>
              <div className='ml-auto flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 gap-1.5 border-amber-300 text-xs text-amber-700 hover:bg-amber-100 hover:text-amber-800'
                  onClick={handleClear}
                  disabled={updateMutation.isLoading}
                >
                  <RotateCcwIcon className='h-3 w-3' />
                  Hoàn tác
                </Button>
                <Button
                  size='sm'
                  className='h-7 gap-1.5 text-xs'
                  onClick={handleOpenConfirm}
                  disabled={
                    updateMutation.isLoading || dirtyChanges.length === 0
                  }
                  title='Thay đổi cần được duyệt'
                >
                  {updateMutation.isLoading ? (
                    <Loader2Icon className='h-3 w-3 animate-spin' />
                  ) : (
                    <CheckCircleIcon className='h-3 w-3' />
                  )}
                  Gửi yêu cầu thay đổi giá ({dirtyRowCount})
                </Button>
              </div>
            </div>
          ) : (
            <div className='hidden shrink-0 items-center gap-1 border-b border-border px-4 py-1.5 text-xs text-muted-foreground md:flex md:px-6'>
              <InfoIcon className='h-3.5 w-3.5 shrink-0' />
              Chỉnh sửa đơn giá rồi gửi yêu cầu — thay đổi cần được duyệt
            </div>
          )}

          {/* ── Table ── */}
          <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
            <div className='w-full min-w-max rounded-md border border-border'>
              <table className='w-full border-collapse text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/40 text-left'>
                    <th className='px-3 py-2 text-xs font-semibold'>STT</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Dịch vụ</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Loại cont</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Loại hàng</th>
                    <th className='px-3 py-2 text-xs font-semibold'>Tuyến</th>
                    <th className='px-3 py-2 text-right text-xs font-semibold'>
                      Đơn giá
                    </th>
                    <th className='px-3 py-2 text-right text-xs font-semibold'>
                      VAT
                    </th>
                    <th className='px-3 py-2 text-xs font-semibold'>
                      Thời gian áp dụng
                    </th>
                    <th className='px-3 py-2 text-right text-xs font-semibold'>
                      Tần suất (3 tháng)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiQuery.isLoading ? (
                    <tr>
                      <td
                        colSpan={COLSPAN}
                        className='py-16 text-center text-xs text-muted-foreground'
                      >
                        <Loader2Icon className='mr-1 inline h-4 w-4 animate-spin' />
                        Đang tải giá vận chuyển...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={COLSPAN}
                        className='py-16 text-center text-xs text-muted-foreground'
                      >
                        Không tìm thấy giá phù hợp
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => {
                      const rowDirty = isRowDirty(r);
                      return (
                        <tr
                          key={r.id}
                          className={cn(
                            'border-b border-border transition-colors hover:bg-primary/5',
                            rowDirty
                              ? 'bg-amber-50/50'
                              : i % 2 === 0
                                ? 'bg-background'
                                : 'bg-muted/10'
                          )}
                        >
                          <td className='px-3 py-1 text-xs text-muted-foreground'>
                            {(currentPage - 1) * pageSize + i + 1}
                          </td>
                          <td className='px-3 py-1 text-xs text-foreground'>
                            {r.service_name || (
                              <span className='italic text-muted-foreground'>
                                —
                              </span>
                            )}
                          </td>
                          <td className='px-3 py-1 text-xs text-foreground'>
                            {r.container_name || (
                              <span className='italic text-muted-foreground'>
                                —
                              </span>
                            )}
                          </td>
                          <td className='px-3 py-1 text-xs text-foreground'>
                            {r.loai_hang_hoa || (
                              <span className='italic text-muted-foreground'>
                                —
                              </span>
                            )}
                          </td>
                          <td className='px-3 py-1 text-xs text-foreground'>
                            {routeLabel(r)}
                          </td>
                          <td className='px-3 py-0.5'>
                            <EditableNumericCell
                              value={displayedAmount(r)}
                              formatted={formatNum(displayedAmount(r))}
                              isDirty={rowDirty}
                              onCommit={(v) => handleUpdate(r, v)}
                            />
                          </td>
                          <td className='px-3 py-1 text-right text-xs tabular-nums text-foreground'>
                            {formatDisplay(r.vat)}
                          </td>
                          <td className='px-3 py-1 text-xs tabular-nums text-muted-foreground'>
                            {formatDateTime(r.effective_from)}
                          </td>
                          <td className='px-3 py-1 text-right text-xs tabular-nums'>
                            {r.usage_count_3m == null ? (
                              <span className='italic text-muted-foreground/50'>
                                —
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  'font-medium',
                                  r.usage_count_3m > 0
                                    ? 'text-foreground'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {r.usage_count_3m}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ── */}
          <div className='flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 md:px-6'>
            <div className='flex items-center gap-3'>
              <span className='text-xs text-muted-foreground'>
                {apiQuery.isFetching && (
                  <Loader2Icon className='mr-1 inline h-3 w-3 animate-spin' />
                )}
                {total} bản ghi
              </span>
              <div className='flex items-center gap-1.5'>
                <span className='text-xs text-muted-foreground'>Hiển thị</span>
                <Select
                  value={pageSize}
                  onChange={handleChangePageSize}
                  size='small'
                  style={{ width: 72 }}
                  options={PAGE_SIZE_OPTIONS.map((n) => ({
                    value: n,
                    label: String(n),
                  }))}
                />
                <span className='text-xs text-muted-foreground'>/ trang</span>
              </div>
            </div>

            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                className='h-7 w-7 p-0'
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || apiQuery.isFetching}
                title='Trang trước'
              >
                <ChevronLeftIcon className='h-3.5 w-3.5' />
              </Button>

              {buildPageItems(currentPage, totalPages).map((item, idx) =>
                item === 'gap' ? (
                  <span
                    key={`gap-${idx}`}
                    className='px-1 text-xs text-muted-foreground'
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === currentPage ? 'default' : 'outline'}
                    size='sm'
                    className='h-7 min-w-7 px-2 text-xs'
                    onClick={() => goToPage(item)}
                    disabled={apiQuery.isFetching}
                  >
                    {item}
                  </Button>
                )
              )}

              <Button
                variant='outline'
                size='sm'
                className='h-7 w-7 p-0'
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || apiQuery.isFetching}
                title='Trang sau'
              >
                <ChevronRightIcon className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>

          {/* ── Upload Excel giá modal ── */}
          {showUpload && (
            <UploadRateModal
              onClose={() => setShowUpload(false)}
              onUploaded={handleUploaded}
            />
          )}

          {/* ── Modal xác nhận đổi giá + lý do per row ── */}
          {confirmModalOpen && (
            <ConfirmChangesModal
              title='Xác nhận đề nghị thay đổi giá tuyến đường'
              subtitle={
                <>
                  Vui lòng kiểm tra lại các thay đổi và{' '}
                  <strong>điền lý do</strong> cho từng tuyến trước khi gửi MH
                  duyệt.
                </>
              }
              defaultReason={DEFAULT_RATE_REASON}
              changes={dirtyChanges}
              reasonMap={reasonMap}
              onReasonChange={handleReasonChange}
              onResetReason={handleResetReason}
              onClose={() => {
                if (updateMutation.isLoading) return;
                setConfirmModalOpen(false);
              }}
              onConfirm={handleSubmitChanges}
              submitting={updateMutation.isLoading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default withPrivateRouteSupplier(ShippingRateContainer);
