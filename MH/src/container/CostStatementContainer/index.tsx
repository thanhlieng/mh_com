/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { notification } from 'antd';
import { format } from 'date-fns';
import {
  ArrowUpDownIcon,
  CheckCircleIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ListChecksIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SearchIcon,
  TableIcon,
  XCircleIcon,
} from 'lucide-react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';

import { DateRangePicker } from '@/components/DateRangePicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';
import { exportCostStatement, getSupplierTransactions, getChangeRequests, createChangeRequest } from '@/services/supplier.services';
import type { SupplierTransactionsParams, SupplierTransaction } from '@/services/supplier.services';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { ChangeRequestList } from './ChangeRequestList';
import {
  type ChangeRequest,
  type CostCategory,
  type CostStatementRow,
  type EditableField,
  mapApiResponseToChangeRequest,
} from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const formatVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

/** Nhãn + variant Badge cho cột "Loại" */
const CATEGORY_META: Record<
  CostCategory,
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  cost:       { label: 'Chi phí',    variant: 'default' },
  invoice_mh: { label: 'Chi hộ MH',  variant: 'warning' },
  chi_ho:     { label: 'Chi hộ',     variant: 'secondary' },
};

// ─── Map API transaction to CostStatementRow ──────────────────────────────────

function mapTransactionToRow(t: SupplierTransaction): CostStatementRow {
  return {
    id: `${t.type}-${t.id}`,
    orderCode: t.order_code ?? '',
    bookingBillNumber: t.booking_bill_number ?? '',
    containerNo: t.container_no ?? '',
    containerType: t.container_type ?? '',
    route: t.route ?? '',
    serviceName: t.service_name ?? '',
    contractNumber: t.contract_number ?? '',
    amount: t.amount ?? 0,
    category: t.category,
    editable: t.editable,
    pnlId: t.type === 'pnl' ? t.id : undefined,
    orderId: t.order_id ?? undefined,
    type: t.type,
  };
}

// ─── Editable numeric cell (chỉ dùng cho cột Tiền khi editable) ────────────────

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

  React.useEffect(() => { if (editing) ref.current?.select(); }, [editing]);
  React.useEffect(() => { setDraft(String(value)); }, [value]);

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
          if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); }
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
      title={isDirty ? 'Đã chỉnh sửa — Click để tiếp tục chỉnh sửa' : 'Click để chỉnh sửa'}
    >
      {formatted}
    </div>
  );
}

// ─── Cột Tiền: editable hay read-only tuỳ row.editable ─────────────────────────

function AmountCell({
  row,
  isDirty,
  onCommit,
}: {
  row: CostStatementRow;
  isDirty: boolean;
  onCommit: (v: number) => void;
}) {
  if (!row.editable) {
    return (
      <div className='px-1 py-1 text-right text-xs tabular-nums text-foreground'>
        {formatVND(row.amount)}
      </div>
    );
  }
  return (
    <EditableNumericCell
      value={row.amount}
      formatted={formatVND(row.amount)}
      isDirty={isDirty}
      onCommit={onCommit}
    />
  );
}

// ─── Filterable column header ─────────────────────────────────────────────────

function FilterableHeader({
  label,
  column,
  sortable = false,
  align = 'left',
  filterable = true,
}: {
  label: string;
  column: any;
  sortable?: boolean;
  align?: 'left' | 'right';
  filterable?: boolean;
}) {
  const filterValue = (column.getFilterValue() as string) ?? '';
  return (
    <div className='flex flex-col gap-1 py-1'>
      <div className={cn('flex items-center gap-1', align === 'right' && 'flex-row-reverse')}>
        <span className='text-xs font-semibold text-foreground'>{label}</span>
        {sortable && (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='ml-auto opacity-40 hover:opacity-100'
          >
            <ArrowUpDownIcon className='h-3 w-3' />
          </button>
        )}
      </div>
      {filterable && (
        <div className='relative'>
          <SearchIcon className='absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={filterValue}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder='Lọc...'
            className='h-6 pl-5 text-[10px]'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

type DirtyMap = Record<string, Set<EditableField>>;

// ─── Read-only text cell ──────────────────────────────────────────────────────

function TextCell({ value, align = 'left' }: { value: string; align?: 'left' | 'right' }) {
  return (
    <div className={cn('px-1 py-1 text-xs text-foreground', align === 'right' && 'text-right')}>
      {value || <span className='italic text-muted-foreground'>—</span>}
    </div>
  );
}

// ─── Mobile card ───────────────────────────────────────────────────────────────

function CostCard({
  row,
  onUpdate,
  dirtyMap,
}: {
  row: CostStatementRow;
  onUpdate: (id: string, field: EditableField, value: number) => void;
  dirtyMap: DirtyMap;
}) {
  const rowHasDirty = !!dirtyMap[row.id];
  const isAmountDirty = dirtyMap[row.id]?.has('amount') ?? false;
  const cat = CATEGORY_META[row.category];

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className='flex items-center justify-between gap-2'>
      <span className='shrink-0 text-[11px] text-muted-foreground'>{label}</span>
      <span className='min-w-0 flex-1 truncate text-right text-xs'>
        {value || <span className='italic text-muted-foreground'>—</span>}
      </span>
    </div>
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-md border p-3',
        rowHasDirty ? 'border-amber-300 bg-amber-50/40' : 'border-border bg-background'
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='min-w-0 flex-1 text-sm font-semibold truncate'>
          {row.orderCode || <span className='italic text-muted-foreground'>—</span>}
        </div>
        <Badge variant={cat.variant}>{cat.label}</Badge>
      </div>

      <Field label='Mã booking' value={row.bookingBillNumber} />
      <Field label='Số container' value={row.containerNo} />
      <Field label='Loại cont' value={row.containerType} />
      <Field label='Tuyến đường' value={row.route} />
      <Field label='Dịch vụ' value={row.serviceName} />
      <Field label='Số hoá đơn' value={row.contractNumber} />

      <div className='flex items-center justify-between border-t border-border pt-1.5'>
        <span className='text-[11px] font-medium text-muted-foreground'>Tiền</span>
        <div className='min-w-[120px]'>
          <AmountCell
            row={row}
            isDirty={isAmountDirty}
            onCommit={(v) => onUpdate(row.id, 'amount', v)}
          />
        </div>
      </div>
    </div>
  );
}

function buildColumns(
  onUpdate: (id: string, field: EditableField, value: number) => void,
  dirtyMap: DirtyMap,
): ColumnDef<CostStatementRow>[] {
  const isDirty = (id: string, field: EditableField) =>
    dirtyMap[id]?.has(field) ?? false;

  return [
    {
      id: 'index',
      enableColumnFilter: false,
      size: 44,
      header: () => <span className='text-xs font-semibold'>STT</span>,
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground'>{row.index + 1}</span>
      ),
    },
    {
      accessorKey: 'orderCode',
      filterFn: 'includesString',
      size: 130,
      header: ({ column }) => (
        <FilterableHeader label='Mã đơn' column={column} sortable />
      ),
      cell: ({ row }) => <TextCell value={row.original.orderCode} />,
    },
    {
      accessorKey: 'bookingBillNumber',
      filterFn: 'includesString',
      size: 130,
      header: ({ column }) => (
        <FilterableHeader label='Mã booking' column={column} sortable />
      ),
      cell: ({ row }) => <TextCell value={row.original.bookingBillNumber} />,
    },
    {
      accessorKey: 'containerNo',
      filterFn: 'includesString',
      size: 140,
      header: ({ column }) => (
        <FilterableHeader label='Số container' column={column} />
      ),
      cell: ({ row }) => <TextCell value={row.original.containerNo} />,
    },
    {
      accessorKey: 'containerType',
      filterFn: 'includesString',
      size: 100,
      header: ({ column }) => (
        <FilterableHeader label='Loại cont' column={column} />
      ),
      cell: ({ row }) => <TextCell value={row.original.containerType} />,
    },
    {
      accessorKey: 'route',
      filterFn: 'includesString',
      size: 140,
      header: ({ column }) => (
        <FilterableHeader label='Tuyến đường' column={column} />
      ),
      cell: ({ row }) => <TextCell value={row.original.route} />,
    },
    {
      accessorKey: 'serviceName',
      filterFn: 'includesString',
      size: 160,
      header: ({ column }) => (
        <FilterableHeader label='Dịch vụ' column={column} />
      ),
      cell: ({ row }) => <TextCell value={row.original.serviceName} />,
    },
    {
      accessorKey: 'contractNumber',
      filterFn: 'includesString',
      size: 130,
      header: ({ column }) => (
        <FilterableHeader label='Số hoá đơn' column={column} />
      ),
      cell: ({ row }) => <TextCell value={row.original.contractNumber} />,
    },
    {
      accessorKey: 'amount',
      size: 140,
      header: ({ column }) => (
        <FilterableHeader label='Tiền' column={column} sortable align='right' filterable={false} />
      ),
      cell: ({ row }) => (
        <AmountCell
          row={row.original}
          isDirty={isDirty(row.original.id, 'amount')}
          onCommit={(v) => onUpdate(row.original.id, 'amount', v)}
        />
      ),
    },
    {
      accessorKey: 'category',
      size: 110,
      enableColumnFilter: false,
      header: () => (
        <div className='py-1 text-xs font-semibold text-foreground'>Loại</div>
      ),
      cell: ({ row }) => {
        const cat = CATEGORY_META[row.original.category];
        return <Badge variant={cat.variant}>{cat.label}</Badge>;
      },
    },
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────

const CostStatementContainer = () => {
  const [queryParams, setQueryParams] = React.useState<SupplierTransactionsParams>({
    page: 1,
    page_size: 200,
  });
  const apiQuery = useQuery(
    ['supplier-transactions', queryParams],
    () => getSupplierTransactions(queryParams),
    {
      keepPreviousData: true,
      retry: false,
      onError: (e: any) => {
        notification.error({
          message: e?.response?.data?.message
            ? `${e.response.data.message}`
            : 'Tải bảng kê chi phí thất bại',
          placement: 'top',
        });
      },
    }
  );

  const [data, setData] = React.useState<CostStatementRow[]>([]);
  const [dirtyMap, setDirtyMap] = React.useState<DirtyMap>({});
  const originalDataRef = React.useRef<CostStatementRow[]>([]);

  // Reset data khi API trả về
  React.useEffect(() => {
    if (apiQuery.data) {
      const mapped = apiQuery.data.results.map(mapTransactionToRow);
      setData(mapped);
      originalDataRef.current = mapped;
      setDirtyMap({});
    }
  }, [apiQuery.data]);

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [searchText, setSearchText] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isExporting, setIsExporting] = React.useState(false);

  // View con: 'statement' = bảng kê | 'requests' = danh sách đề nghị thay đổi
  const [view, setView] = React.useState<'statement' | 'requests'>('statement');

  // Fetch change requests list từ API
  const queryClient = useQueryClient();
  const changeRequestsQuery = useQuery(
    ['supplier-change-requests'],
    () => getChangeRequests(),
    {
      enabled: view === 'requests',
      retry: false,
      onError: (e: any) => {
        notification.error({
          message: e?.response?.data?.message
            ? `${e.response.data.message}`
            : 'Tải danh sách đề nghị thay đổi thất bại',
          placement: 'top',
        });
      },
    },
  );

  const changeRequests: ChangeRequest[] = React.useMemo(() => {
    if (!changeRequestsQuery.data) return [];
    return changeRequestsQuery.data.map(mapApiResponseToChangeRequest);
  }, [changeRequestsQuery.data]);

  // Mutation: tạo đề nghị thay đổi cost
  const createMutation = useMutation(createChangeRequest, {
    onSuccess: (res) => {
      queryClient.invalidateQueries('supplier-change-requests');
      notification.success({
        message: `Đã gửi ${res?.length ?? ''} đề nghị thay đổi thành công`,
        placement: 'top',
      });
    },
    onError: (e: any) => {
      notification.error({
        message: e?.response?.data?.message
          ? `${e.response.data.message}`
          : 'Gửi đề nghị thay đổi thất bại',
        placement: 'top',
      });
    },
  });

  // Dirty stats
  const dirtyRowCount = Object.keys(dirtyMap).length;
  const dirtyCellCount = Object.values(dirtyMap).reduce((s, set) => s + set.size, 0);

  // Update Tiền của một dòng (chỉ với dòng editable); đánh dấu dirty
  const handleUpdate = React.useCallback(
    (id: string, field: EditableField, value: number) => {
      setData((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          return { ...row, [field]: value };
        })
      );
      setDirtyMap((prev) => {
        const rowSet = new Set<EditableField>(prev[id] ?? []);
        rowSet.add(field);
        return { ...prev, [id]: rowSet };
      });
    },
    []
  );

  // Revert all changes to original snapshot
  const handleClear = () => {
    setData(originalDataRef.current.map((r) => ({ ...r })));
    setDirtyMap({});
  };

  // Gom tất cả thay đổi Tiền thành 1 API call duy nhất
  const handleConfirm = async () => {
    const payload: { pnl: number; order: number; requested_cost: number }[] = [];

    for (const [rowId, fields] of Object.entries(dirtyMap)) {
      const current = data.find((r) => r.id === rowId);
      if (!current) continue;
      if (!fields.has('amount')) continue;
      if (!current.editable) continue;
      if (!current.pnlId || !current.orderId) continue;

      payload.push({
        pnl: current.pnlId,
        order: current.orderId,
        requested_cost: current.amount,
      });
    }

    if (payload.length === 0) return;

    try {
      await createMutation.mutateAsync(payload);
      originalDataRef.current = data.map((r) => ({ ...r }));
      setDirtyMap({});
      setView('requests');
    } catch {
      // error handled by react-query onError / console
    }
  };

  // Hủy một đề nghị đang chờ duyệt (chỉ áp dụng cho trạng thái "Chờ duyệt")
  const handleCancelRequest = (id: string) => {
    // TODO: gọi API hủy đề nghị khi có endpoint (hiện tại API hệ thống A chưa hỗ trợ cancel)
    queryClient.invalidateQueries('supplier-change-requests');
  };

  // Export to Excel via API (backend generates the file)
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params: Parameters<typeof exportCostStatement>[0] = {};
      if (dateRange?.from) params.from = format(dateRange.from, 'yyyy-MM-dd');
      if (dateRange?.to)   params.to   = format(dateRange.to,   'yyyy-MM-dd');
      if (searchText.trim()) params.q = searchText.trim();

      const blob = await exportCostStatement(params);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `bang-ke-chi-phi-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      notification.success({
        message: 'Xuất Excel thành công',
        placement: 'top',
      });
    } catch (err: any) {
      console.error('[CostStatement] Export failed:', err);
      notification.error({
        message: err?.response?.data?.message
          ? `${err.response.data.message}`
          : 'Xuất Excel thất bại',
        placement: 'top',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const columns = React.useMemo(
    () => buildColumns(handleUpdate, dirtyMap),
    [handleUpdate, dirtyMap]
  );

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const hasActiveFilters =
    !!dateRange?.from ||
    !!searchText ||
    columnFilters.length > 0;

  const handleApplyFilters = () => {
    const params: SupplierTransactionsParams = { page: 1, page_size: 200 };
    if (searchText.trim()) params.q = searchText.trim();
    if (dateRange?.from) params.start_date = format(dateRange.from, 'yyyy-MM-dd');
    if (dateRange?.to) params.end_date = format(dateRange.to, 'yyyy-MM-dd');
    setQueryParams(params);
  };

  const clearAllFilters = () => {
    setDateRange(undefined);
    setSearchText('');
    setColumnFilters([]);
    setQueryParams({ page: 1, page_size: 200 });
  };

  const visibleRows = table.getFilteredRowModel().rows;
  const totalAmount = visibleRows.reduce((s, r) => s + r.original.amount, 0);

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* ── Page header ── */}
      <div className='flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-2 md:h-14 md:flex-nowrap md:px-6 md:py-0'>
        <FileTextIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
        <h1 className='text-sm font-semibold'>Bảng kê chi phí</h1>
        {view === 'statement' && dirtyCellCount > 0 && (
          <Badge variant='warning' className='gap-1'>
            <PencilIcon className='h-3 w-3' />
            {dirtyCellCount} thay đổi
          </Badge>
        )}
        <div className='flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-xs md:ml-auto md:w-auto'>
          {view === 'statement' && (
            <>
              <span className='text-muted-foreground'>
                {apiQuery.isFetching && (
                  <Loader2Icon className='mr-1 inline h-3 w-3 animate-spin' />
                )}
                {visibleRows.length} bản ghi
                {apiQuery.data && (
                  <span className='text-[10px] text-muted-foreground/60'>
                    {' '}/ {apiQuery.data.total}
                  </span>
                )}
              </span>
              <span className='rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary'>
                Tổng tiền: {formatVND(totalAmount)}
              </span>
            </>
          )}
          <Button
            variant='outline'
            size='sm'
            className='h-8 shrink-0 gap-1.5 text-xs'
            onClick={() =>
              view === 'statement'
                ? apiQuery.refetch()
                : changeRequestsQuery.refetch()
            }
            disabled={
              view === 'statement'
                ? apiQuery.isFetching
                : changeRequestsQuery.isFetching
            }
            title='Tải lại dữ liệu'
          >
            <RefreshCwIcon
              className={cn(
                'h-3.5 w-3.5',
                (view === 'statement'
                  ? apiQuery.isFetching
                  : changeRequestsQuery.isFetching) && 'animate-spin'
              )}
            />
            Tải lại
          </Button>
        </div>
      </div>

      {/* ── Tab bar (view con) ── */}
      <div className='flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-4 md:px-6'>
        <button
          onClick={() => setView('statement')}
          className={cn(
            'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors',
            view === 'statement'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <TableIcon className='h-3.5 w-3.5' />
          Bảng kê chi phí
        </button>
        <button
          onClick={() => setView('requests')}
          className={cn(
            'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors',
            view === 'requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <ListChecksIcon className='h-3.5 w-3.5' />
          Đề nghị thay đổi
          {changeRequests.length > 0 && (
            <span className='rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground'>
              {changeRequests.length}
            </span>
          )}
        </button>
      </div>

      {view === 'requests' && (
        <ChangeRequestList
          requests={changeRequests}
          onCancel={handleCancelRequest}
        />
      )}

      {view === 'statement' && (
      <>
      {/* statement-view-wrapper */}

      {/* ── Filter bar ── */}
      <div className='shrink-0 border-b border-border bg-muted/20 px-4 py-3 md:px-6'>
        <div className='flex flex-wrap items-end gap-3'>
          <DateRangePicker
            label='Khoảng thời gian'
            value={dateRange}
            onChange={setDateRange}
            className='w-full md:w-60'
          />

          <div className='flex flex-col gap-1'>
            <Label>Tìm kiếm</Label>
            <div className='relative'>
              <SearchIcon className='absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                placeholder='Mã đơn, booking, container, tuyến, dịch vụ, hoá đơn...'
                className='h-8 w-full pl-7 text-xs md:w-80'
              />
            </div>
          </div>

          <div className='flex items-end gap-2'>
            <Button size='sm' className='h-8 text-xs' onClick={handleApplyFilters}>
              Áp dụng
            </Button>
            {hasActiveFilters && (
              <Button
                variant='ghost'
                size='sm'
                className='h-8 gap-1 text-xs text-muted-foreground hover:text-foreground'
                onClick={clearAllFilters}
              >
                <XCircleIcon className='h-3.5 w-3.5' />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Export button — pushed to far right (trên desktop) */}
          <div className='flex items-end md:ml-auto'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <FileSpreadsheetIcon className='h-3.5 w-3.5 text-green-600' />
              )}
              {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Dirty action bar (shown when there are unsaved changes) ── */}
      {dirtyCellCount > 0 && (
        <div className='flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-amber-200 bg-amber-50 px-4 py-2 md:px-6'>
          <PencilIcon className='h-3.5 w-3.5 shrink-0 text-amber-600' />
          <span className='text-xs text-amber-700'>
            <span className='font-semibold'>{dirtyRowCount} dòng</span>
            {' '}đã được chỉnh sửa, chưa lưu.
          </span>
          <div className='ml-auto flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-7 gap-1.5 border-amber-300 text-xs text-amber-700 hover:bg-amber-100 hover:text-amber-800'
              onClick={handleClear}
            >
              <RotateCcwIcon className='h-3 w-3' />
              Hoàn tác
            </Button>
            <Button
              size='sm'
              className='h-7 gap-1.5 text-xs'
              onClick={handleConfirm}
            >
              <CheckCircleIcon className='h-3 w-3' />
              Xác nhận ({dirtyRowCount} dòng)
            </Button>
          </div>
        </div>
      )}

      {/* ── Table (desktop) / Card list (mobile) ── */}
      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        {/* Card list — mobile */}
        <div className='flex flex-col gap-2 md:hidden'>
          {table.getRowModel().rows.length === 0 ? (
            <div className='py-16 text-center text-xs text-muted-foreground'>
              Không tìm thấy bản ghi phù hợp
            </div>
          ) : (
            <>
              {table.getRowModel().rows.map((row) => (
                <CostCard
                  key={row.id}
                  row={row.original}
                  onUpdate={handleUpdate}
                  dirtyMap={dirtyMap}
                />
              ))}
              {/* Tóm tắt tổng */}
              <div className='mt-1 flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-3 text-xs'>
                <div className='flex justify-between border-t border-border pt-1 font-semibold'>
                  <span>Tổng tiền ({visibleRows.length} bản ghi)</span>
                  <span className='tabular-nums text-primary'>{formatVND(totalAmount)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Table — từ md trở lên, scroll ngang khi nhiều cột */}
        <div className='hidden w-full min-w-max rounded-md border border-border md:block'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className='border-b border-border bg-muted/40'>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className='px-3 text-left align-top font-normal'
                      style={{ width: h.getSize(), minWidth: h.getSize() }}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    Không tìm thấy bản ghi phù hợp
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, i) => {
                  const rowHasDirty = !!dirtyMap[row.original.id];
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-border transition-colors hover:bg-primary/5',
                        rowHasDirty
                          ? 'bg-amber-50/50'
                          : i % 2 === 0
                            ? 'bg-background'
                            : 'bg-muted/10'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className='px-3 py-0.5 align-middle'
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Summary footer */}
            {table.getRowModel().rows.length > 0 && (
              <tfoot>
                <tr className='border-t-2 border-border bg-muted/30 font-semibold'>
                  {/* STT + Mã đơn + Mã booking + Số container + Loại cont + Tuyến + Dịch vụ + Số hoá đơn */}
                  <td colSpan={8} className='px-3 py-2 text-xs text-muted-foreground'>
                    Tổng ({visibleRows.length} bản ghi)
                  </td>
                  <td className='px-3 py-2 text-right text-xs font-bold tabular-nums text-primary'>
                    {formatVND(totalAmount)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default withPrivateRouteSupplier(CostStatementContainer);
