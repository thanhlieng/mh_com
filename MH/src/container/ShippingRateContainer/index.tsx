/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { notification } from 'antd';
import {
  CheckCircleIcon,
  InfoIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  RouteIcon,
  UploadCloudIcon,
} from 'lucide-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';
import type { SupplierPrice } from '@/services/supplier.services';
import {
  getSupplierPrices,
  updateSupplierPrices,
} from '@/services/supplier.services';

import { PriceChangeList } from '../SupplierPriceChangeContainer/PriceChangeList';
import { UploadRateModal } from './UploadRateModal';

type TabKey = 'rates' | 'changes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Coerce một giá trị Decimal (string | number | null) về number an toàn. */
const toNum = (v: number | string | null | undefined): number => {
  if (v == null || v === '') return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

/** Format số tiền (đã coerce) theo locale vi-VN. */
const formatNum = (v: number | string | null | undefined): string =>
  toNum(v).toLocaleString('vi-VN');

/** Hiển thị số tiền nhưng giữ "-" khi chưa có giá trị (null/rỗng). */
const formatDisplay = (v: number | string | null | undefined): string =>
  v == null || v === '' ? '-' : toNum(v).toLocaleString('vi-VN');

// ─── Row model (số tiền đã coerce về number để edit) ───────────────────────────

interface PriceRow extends SupplierPrice {
  amount: number;
}

function mapPriceToRow(p: SupplierPrice): PriceRow {
  return { ...p, amount: toNum(p.amount) };
}

// ─── Editable numeric cell (chỉ dùng cho cột Đơn giá) ──────────────────────────

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

// ─── Read-only text cell ──────────────────────────────────────────────────────

function TextCell({
  value,
  align = 'left',
}: {
  value: string;
  align?: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'px-1 py-1 text-xs text-foreground',
        align === 'right' && 'text-right tabular-nums'
      )}
    >
      {value || <span className='italic text-muted-foreground'>—</span>}
    </div>
  );
}

/** Nhãn tuyến (best-effort): route_type, fallback route_id, fallback "-". */
const routeLabel = (r: PriceRow): string =>
  r.route_type || (r.route_id != null ? String(r.route_id) : '-');

// ─── Column definitions ───────────────────────────────────────────────────────

type DirtyMap = Record<number, true>;

function buildColumns(
  onUpdate: (id: number, value: number) => void,
  dirtyMap: DirtyMap
): ColumnDef<PriceRow>[] {
  return [
    {
      id: 'index',
      size: 44,
      header: () => <span className='text-xs font-semibold'>STT</span>,
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground'>{row.index + 1}</span>
      ),
    },
    {
      accessorKey: 'service_name',
      size: 180,
      header: () => <span className='text-xs font-semibold'>Dịch vụ</span>,
      cell: ({ row }) => <TextCell value={row.original.service_name} />,
    },
    {
      accessorKey: 'container_name',
      size: 110,
      header: () => <span className='text-xs font-semibold'>Loại cont</span>,
      cell: ({ row }) => <TextCell value={row.original.container_name} />,
    },
    {
      accessorKey: 'loai_hang_hoa',
      size: 120,
      header: () => <span className='text-xs font-semibold'>Loại hàng</span>,
      cell: ({ row }) => <TextCell value={row.original.loai_hang_hoa} />,
    },
    {
      id: 'route',
      size: 120,
      header: () => <span className='text-xs font-semibold'>Tuyến</span>,
      cell: ({ row }) => <TextCell value={routeLabel(row.original)} />,
    },
    {
      accessorKey: 'amount',
      size: 140,
      header: () => (
        <span className='block text-right text-xs font-semibold'>Đơn giá</span>
      ),
      cell: ({ row }) => (
        <EditableNumericCell
          value={row.original.amount}
          formatted={formatNum(row.original.amount)}
          isDirty={!!dirtyMap[row.original.id]}
          onCommit={(v) => onUpdate(row.original.id, v)}
        />
      ),
    },
    // {
    //   accessorKey: 'amount_next_cont',
    //   size: 130,
    //   header: () => (
    //     <span className='block text-right text-xs font-semibold'>
    //       Cont tiếp theo
    //     </span>
    //   ),
    //   cell: ({ row }) => (
    //     <TextCell value={formatDisplay(row.original.amount_next_cont)} align='right' />
    //   ),
    // },
    {
      accessorKey: 'vat',
      size: 80,
      header: () => (
        <span className='block text-right text-xs font-semibold'>VAT</span>
      ),
      cell: ({ row }) => (
        <TextCell value={formatDisplay(row.original.vat)} align='right' />
      ),
    },
    {
      accessorKey: 'currency_code',
      size: 90,
      header: () => <span className='text-xs font-semibold'>Tiền tệ</span>,
      cell: ({ row }) => <TextCell value={row.original.currency_code ?? '-'} />,
    },
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────

const ShippingRateContainer = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<TabKey>('rates');
  // Cho phép deep-link tới tab "Yêu cầu thay đổi giá" qua ?tab=changes.
  React.useEffect(() => {
    if (router.isReady && router.query.tab === 'changes') {
      setActiveTab('changes');
    }
  }, [router.isReady, router.query.tab]);

  const apiQuery = useQuery(['supplier-prices'], getSupplierPrices, {
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
  });

  const [data, setData] = React.useState<PriceRow[]>([]);
  const [dirtyMap, setDirtyMap] = React.useState<DirtyMap>({});
  const [showUpload, setShowUpload] = React.useState(false);
  const originalDataRef = React.useRef<PriceRow[]>([]);

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

  React.useEffect(() => {
    if (apiQuery.data) {
      const mapped = (apiQuery.data.results ?? []).map(mapPriceToRow);
      setData(mapped);
      originalDataRef.current = mapped;
      setDirtyMap({});
    }
  }, [apiQuery.data]);

  const dirtyRowCount = Object.keys(dirtyMap).length;

  const handleUpdate = React.useCallback((id: number, value: number) => {
    setData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, amount: value } : row))
    );
    setDirtyMap((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleClear = () => {
    setData(originalDataRef.current.map((r) => ({ ...r })));
    setDirtyMap({});
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
      originalDataRef.current = data.map((r) => ({ ...r }));
      setDirtyMap({});
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

  const handleConfirm = () => {
    const items = data
      .filter((r) => dirtyMap[r.id])
      .map((r) => ({ id: r.id, amount: r.amount }));
    if (items.length === 0) return;
    updateMutation.mutate(items);
  };

  const columns = React.useMemo(
    () => buildColumns(handleUpdate, dirtyMap),
    [handleUpdate, dirtyMap]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* ── Page header ── */}
      <div className='flex shrink-0 items-center gap-3 border-b border-border px-4 py-2 md:px-6'>
        <RouteIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
        <h1 className='text-sm font-semibold'>Thiết lập giá vận chuyển</h1>
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
            {t.key === 'rates' && dirtyRowCount > 0 && (
              <Badge variant='warning' className='gap-1'>
                <PencilIcon className='h-3 w-3' />
                {dirtyRowCount}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'changes' && <PriceChangeList />}

      {activeTab === 'rates' && (
        <>
      {/* ── Rates toolbar ── */}
      <div className='flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-4 py-2 md:px-6'>
        <span className='hidden items-center gap-1 text-xs text-muted-foreground lg:flex'>
          <InfoIcon className='h-3.5 w-3.5 shrink-0' />
          Chỉnh sửa đơn giá rồi gửi yêu cầu — thay đổi cần được duyệt.
        </span>
        <div className='flex items-center gap-3 md:ml-auto'>
          <Button
            variant='outline'
            size='sm'
            className='h-8 shrink-0 gap-1.5 text-xs'
            onClick={() => apiQuery.refetch()}
            disabled={apiQuery.isFetching}
            title='Tải lại dữ liệu'
          >
            <RefreshCwIcon
              className={cn('h-3.5 w-3.5', apiQuery.isFetching && 'animate-spin')}
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

      {/* ── Dirty action bar ── */}
      {dirtyRowCount > 0 && (
        <div className='flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-amber-200 bg-amber-50 px-4 py-2 md:px-6'>
          <PencilIcon className='h-3.5 w-3.5 shrink-0 text-amber-600' />
          <span className='text-xs text-amber-700'>
            <span className='font-semibold'>{dirtyRowCount} thay đổi</span> chưa
            gửi.
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
              onClick={handleConfirm}
              disabled={updateMutation.isLoading}
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
      )}

      {/* ── Table ── */}
      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        <div className='w-full min-w-max rounded-md border border-border'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className='border-b border-border bg-muted/40'>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className='px-3 py-2 text-left align-middle font-normal'
                      style={{ width: h.getSize(), minWidth: h.getSize() }}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {apiQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    <Loader2Icon className='mr-1 inline h-4 w-4 animate-spin' />
                    Đang tải giá vận chuyển...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    Chưa có giá vận chuyển
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const rowDirty = !!dirtyMap[row.original.id];
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-border transition-colors hover:bg-primary/5',
                        rowDirty
                          ? 'bg-amber-50/50'
                          : i % 2 === 0
                            ? 'bg-background'
                            : 'bg-muted/10'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='px-3 py-0.5 align-middle'>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Upload Excel giá modal ── */}
      {showUpload && (
        <UploadRateModal
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
        </>
      )}
    </div>
  );
};

export default withPrivateRouteSupplier(ShippingRateContainer);
