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
import { format } from 'date-fns';
import {
  ArrowUpDownIcon,
  CheckCircleIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ListChecksIcon,
  Loader2Icon,
  PencilIcon,
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
import { exportCostStatement, getSupplierTransactions } from '@/services/supplier.services';
import type { SupplierTransactionsParams, SupplierTransaction } from '@/services/supplier.services';
import { useQuery } from 'react-query';

import { FAKE_CHANGE_REQUESTS } from './changeRequestData';
import { ChangeRequestList } from './ChangeRequestList';
import {
  type ChangeRequest,
  type ChangeRequestItem,
  type CostStatementRow,
  type CostStatus,
  type EditableField,
  FIELD_LABELS,
} from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const formatVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Định dạng giá trị một trường để hiển thị trong đề nghị thay đổi
const formatFieldValue = (field: EditableField, value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';
  if (field === 'freightCost' || field === 'surcharge') return formatVND(Number(value));
  if (field === 'quantity') return Number(value).toLocaleString('vi-VN');
  return String(value);
};

const STATUS_BADGE: Record<
  CostStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  'Chờ xử lý':       'warning',
  'Đã thanh toán':   'success',
  'Chưa thanh toán': 'outline',
  'Đã hủy':          'destructive',
};

// ─── Map API transaction to CostStatementRow ──────────────────────────────────

function mapTransactionToRow(t: SupplierTransaction): CostStatementRow {
  const base = {
    id: `${t.type}-${t.id}`,
    billCode: t.order_code ?? t.booking_bill_number ?? '',
    createdDate: t.created_at?.slice(0, 10) ?? '',
    customer: t.customer_name ?? '',
    surcharge: 0,
    quantity: 0,
    total: t.amount_after_vat ?? 0,
    status: 'Chưa thanh toán' as CostStatus,
    note: t.invoice_exporter ?? '',
  };
  if (t.type === 'pnl') {
    return {
      ...base,
      route: t.service_name,
      cargoType: t.service_type ?? '',
      freightCost: t.cost ?? 0,
    };
  }
  return {
    ...base,
    route: t.services?.join(', ') ?? '',
    cargoType: 'Chi hộ',
    freightCost: t.amount ?? 0,
  };
}

// ─── Editable text cell ───────────────────────────────────────────────────────

function EditableTextCell({
  value,
  isDirty = false,
  onCommit,
}: {
  value: string;
  isDirty?: boolean;
  onCommit: (v: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { if (editing) ref.current?.select(); }, [editing]);
  React.useEffect(() => { setDraft(value); }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
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
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className={cn(
          'h-7 w-full px-2 py-0 text-xs',
          isDirty && 'border-amber-400 focus-visible:ring-amber-300'
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        'min-h-[28px] cursor-pointer rounded px-1 py-1 text-xs hover:bg-accent',
        isDirty && 'border-l-2 border-amber-400 bg-amber-50 pl-[3px] text-amber-900'
      )}
      onClick={() => setEditing(true)}
      title={isDirty ? 'Đã chỉnh sửa — Click để tiếp tục chỉnh sửa' : 'Click để chỉnh sửa'}
    >
      {value || <span className='italic text-muted-foreground'>—</span>}
    </div>
  );
}

// ─── Editable numeric cell ────────────────────────────────────────────────────

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

// ─── Filterable column header ─────────────────────────────────────────────────

function FilterableHeader({
  label,
  column,
  sortable = false,
  align = 'left',
}: {
  label: string;
  column: any;
  sortable?: boolean;
  align?: 'left' | 'right';
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
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

type DirtyMap = Record<string, Set<EditableField>>;

// ─── Mobile card (giữ nguyên khả năng chỉnh sửa inline) ───────────────────────

function CostCard({
  row,
  onUpdate,
  dirtyMap,
}: {
  row: CostStatementRow;
  onUpdate: (id: string, field: EditableField, value: string | number) => void;
  dirtyMap: DirtyMap;
}) {
  const isDirty = (f: EditableField) => dirtyMap[row.id]?.has(f) ?? false;
  const rowHasDirty = !!dirtyMap[row.id];

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className='flex items-center justify-between gap-2'>
      <span className='shrink-0 text-[11px] text-muted-foreground'>{label}</span>
      <div className='min-w-0 flex-1'>{children}</div>
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
        <div className='min-w-0 flex-1 text-sm font-semibold'>
          <EditableTextCell
            value={row.billCode}
            isDirty={isDirty('billCode')}
            onCommit={(v) => onUpdate(row.id, 'billCode', v)}
          />
        </div>
        <Badge variant={STATUS_BADGE[row.status]}>{row.status}</Badge>
      </div>

      <Field label='Ngày tạo'>
        <EditableTextCell
          value={row.createdDate}
          isDirty={isDirty('createdDate')}
          onCommit={(v) => onUpdate(row.id, 'createdDate', v)}
        />
      </Field>
      <Field label='Khách hàng'>
        <EditableTextCell
          value={row.customer}
          isDirty={isDirty('customer')}
          onCommit={(v) => onUpdate(row.id, 'customer', v)}
        />
      </Field>
      <Field label='Tuyến đường'>
        <EditableTextCell
          value={row.route}
          isDirty={isDirty('route')}
          onCommit={(v) => onUpdate(row.id, 'route', v)}
        />
      </Field>
      <Field label='Loại hàng'>
        <EditableTextCell
          value={row.cargoType}
          isDirty={isDirty('cargoType')}
          onCommit={(v) => onUpdate(row.id, 'cargoType', v)}
        />
      </Field>
      <Field label='Số lượng'>
        <EditableNumericCell
          value={row.quantity}
          formatted={row.quantity.toLocaleString('vi-VN')}
          isDirty={isDirty('quantity')}
          onCommit={(v) => onUpdate(row.id, 'quantity', v)}
        />
      </Field>
      <Field label='Cước phí'>
        <EditableNumericCell
          value={row.freightCost}
          formatted={formatVND(row.freightCost)}
          isDirty={isDirty('freightCost')}
          onCommit={(v) => onUpdate(row.id, 'freightCost', v)}
        />
      </Field>
      <Field label='Phụ phí'>
        <EditableNumericCell
          value={row.surcharge}
          formatted={formatVND(row.surcharge)}
          isDirty={isDirty('surcharge')}
          onCommit={(v) => onUpdate(row.id, 'surcharge', v)}
        />
      </Field>

      <div className='flex items-center justify-between border-t border-border pt-1.5'>
        <span className='text-[11px] font-medium text-muted-foreground'>Tổng cộng</span>
        <span className='text-sm font-bold tabular-nums text-primary'>
          {formatVND(row.total)}
        </span>
      </div>

      <Field label='Ghi chú'>
        <EditableTextCell
          value={row.note}
          isDirty={isDirty('note')}
          onCommit={(v) => onUpdate(row.id, 'note', v)}
        />
      </Field>
    </div>
  );
}

function buildColumns(
  onUpdate: (id: string, field: EditableField, value: string | number) => void,
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
      accessorKey: 'billCode',
      filterFn: 'includesString',
      size: 130,
      header: ({ column }) => (
        <FilterableHeader label='Mã bill' column={column} sortable />
      ),
      cell: ({ row }) => (
        <EditableTextCell
          value={row.original.billCode}
          isDirty={isDirty(row.original.id, 'billCode')}
          onCommit={(v) => onUpdate(row.original.id, 'billCode', v)}
        />
      ),
    },
    {
      accessorKey: 'createdDate',
      filterFn: 'includesString',
      size: 100,
      header: ({ column }) => (
        <FilterableHeader label='Ngày tạo' column={column} sortable />
      ),
      cell: ({ row }) => (
        <EditableTextCell
          value={row.original.createdDate}
          isDirty={isDirty(row.original.id, 'createdDate')}
          onCommit={(v) => onUpdate(row.original.id, 'createdDate', v)}
        />
      ),
    },
    {
      accessorKey: 'customer',
      filterFn: 'includesString',
      size: 170,
      header: ({ column }) => (
        <FilterableHeader label='Khách hàng' column={column} sortable />
      ),
      cell: ({ row }) => (
        <EditableTextCell
          value={row.original.customer}
          isDirty={isDirty(row.original.id, 'customer')}
          onCommit={(v) => onUpdate(row.original.id, 'customer', v)}
        />
      ),
    },
    {
      accessorKey: 'route',
      filterFn: 'includesString',
      size: 110,
      header: ({ column }) => (
        <FilterableHeader label='Tuyến đường' column={column} sortable />
      ),
      cell: ({ row }) => (
        <EditableTextCell
          value={row.original.route}
          isDirty={isDirty(row.original.id, 'route')}
          onCommit={(v) => onUpdate(row.original.id, 'route', v)}
        />
      ),
    },
    {
      accessorKey: 'cargoType',
      filterFn: 'includesString',
      size: 140,
      header: ({ column }) => (
        <FilterableHeader label='Loại hàng' column={column} />
      ),
      cell: ({ row }) => (
        <EditableTextCell
          value={row.original.cargoType}
          isDirty={isDirty(row.original.id, 'cargoType')}
          onCommit={(v) => onUpdate(row.original.id, 'cargoType', v)}
        />
      ),
    },
    {
      accessorKey: 'quantity',
      size: 70,
      header: ({ column }) => (
        <FilterableHeader label='SL' column={column} sortable align='right' />
      ),
      cell: ({ row }) => (
        <EditableNumericCell
          value={row.original.quantity}
          formatted={row.original.quantity.toLocaleString('vi-VN')}
          isDirty={isDirty(row.original.id, 'quantity')}
          onCommit={(v) => onUpdate(row.original.id, 'quantity', v)}
        />
      ),
      filterFn: (row, _id, fv: string) =>
        String(row.original.quantity).includes(fv),
    },
    {
      accessorKey: 'freightCost',
      size: 120,
      header: ({ column }) => (
        <FilterableHeader label='Cước phí' column={column} sortable align='right' />
      ),
      cell: ({ row }) => (
        <EditableNumericCell
          value={row.original.freightCost}
          formatted={formatVND(row.original.freightCost)}
          isDirty={isDirty(row.original.id, 'freightCost')}
          onCommit={(v) => onUpdate(row.original.id, 'freightCost', v)}
        />
      ),
      filterFn: (row, _id, fv: string) =>
        String(row.original.freightCost).includes(fv),
    },
    {
      accessorKey: 'surcharge',
      size: 110,
      header: ({ column }) => (
        <FilterableHeader label='Phụ phí' column={column} sortable align='right' />
      ),
      cell: ({ row }) => (
        <EditableNumericCell
          value={row.original.surcharge}
          formatted={formatVND(row.original.surcharge)}
          isDirty={isDirty(row.original.id, 'surcharge')}
          onCommit={(v) => onUpdate(row.original.id, 'surcharge', v)}
        />
      ),
      filterFn: (row, _id, fv: string) =>
        String(row.original.surcharge).includes(fv),
    },
    {
      accessorKey: 'total',
      size: 120,
      enableColumnFilter: false,
      header: () => (
        <div className='py-1 text-right text-xs font-semibold text-foreground'>
          Tổng cộng
        </div>
      ),
      cell: ({ row }) => (
        <div className='py-1 text-right text-xs font-semibold tabular-nums text-foreground'>
          {formatVND(row.original.total)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      size: 130,
      header: ({ column }) => (
        <FilterableHeader label='Trạng thái' column={column} sortable />
      ),
      cell: ({ row }) => (
        <Badge variant={STATUS_BADGE[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
      filterFn: (row, _id, fv: string) =>
        row.original.status.toLowerCase().includes(fv.toLowerCase()),
    },
    {
      accessorKey: 'note',
      size: 180,
      header: ({ column }) => (
        <FilterableHeader label='Ghi chú' column={column} />
      ),
      cell: ({ row }) => (
        <EditableTextCell
          value={row.original.note}
          isDirty={isDirty(row.original.id, 'note')}
          onCommit={(v) => onUpdate(row.original.id, 'note', v)}
        />
      ),
      filterFn: 'includesString',
    },
  ];
}

// ─── DB filter state ──────────────────────────────────────────────────────────

interface DbFilters {
  billCode: string;
  customer: string;
  route: string;
}

const INITIAL_DB: DbFilters = { billCode: '', customer: '', route: '' };

// ─── Main component ───────────────────────────────────────────────────────────

const CostStatementContainer = () => {
  const [queryParams, setQueryParams] = React.useState<SupplierTransactionsParams>({
    page: 1,
    page_size: 200,
  });
  const apiQuery = useQuery(
    ['supplier-transactions', queryParams],
    () => getSupplierTransactions(queryParams),
    { keepPreviousData: true, retry: false }
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
  const [dbFilters, setDbFilters] = React.useState<DbFilters>(INITIAL_DB);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isExporting, setIsExporting] = React.useState(false);

  // View con: 'statement' = bảng kê | 'requests' = danh sách đề nghị thay đổi
  const [view, setView] = React.useState<'statement' | 'requests'>('statement');
  const [changeRequests, setChangeRequests] = React.useState<ChangeRequest[]>(
    () => FAKE_CHANGE_REQUESTS.map((r) => ({ ...r }))
  );

  // Dirty stats
  const dirtyRowCount = Object.keys(dirtyMap).length;
  const dirtyCellCount = Object.values(dirtyMap).reduce((s, set) => s + set.size, 0);

  // Update a single field; recompute total when freightCost/surcharge changes; mark dirty
  const handleUpdate = React.useCallback(
    (id: string, field: EditableField, value: string | number) => {
      setData((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          const updated = { ...row, [field]: value };
          if (field === 'freightCost' || field === 'surcharge') {
            updated.total =
              (field === 'freightCost' ? (value as number) : row.freightCost) +
              (field === 'surcharge' ? (value as number) : row.surcharge);
          }
          return updated;
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

  // Tạo một đề nghị thay đổi từ các ô đã chỉnh sửa, gửi sang hệ thống khác
  const handleConfirm = () => {
    const items: ChangeRequestItem[] = [];
    for (const [rowId, fields] of Object.entries(dirtyMap)) {
      const current = data.find((r) => r.id === rowId);
      const original = originalDataRef.current.find((r) => r.id === rowId);
      if (!current || !original) continue;
      fields.forEach((field) => {
        items.push({
          rowId,
          billCode: current.billCode,
          field,
          fieldLabel: FIELD_LABELS[field],
          oldValue: formatFieldValue(field, (original as any)[field]),
          newValue: formatFieldValue(field, (current as any)[field]),
        });
      });
    }
    if (items.length === 0) return;

    const now = new Date();
    const seq = String(changeRequests.length + 1).padStart(4, '0');
    const request: ChangeRequest = {
      id: `cr-${now.getTime()}`,
      code: `DNTD-${now.getFullYear()}-${seq}`,
      submittedAt: now.toISOString(),
      status: 'Chờ duyệt',
      items,
    };

    // TODO: thay bằng API gửi đề nghị sang hệ thống khác
    setChangeRequests((prev) => [request, ...prev]);
    originalDataRef.current = data.map((r) => ({ ...r }));
    setDirtyMap({});
    setView('requests'); // chuyển sang xem danh sách đề nghị vừa gửi
  };

  // Hủy một đề nghị đang chờ duyệt (chỉ áp dụng cho trạng thái "Chờ duyệt")
  const handleCancelRequest = (id: string) => {
    setChangeRequests((prev) =>
      prev.filter((r) => !(r.id === id && r.status === 'Chờ duyệt'))
    );
    // TODO: gọi API hủy đề nghị trên hệ thống duyệt
  };

  // Export to Excel via API (backend generates the file)
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params: Parameters<typeof exportCostStatement>[0] = {};
      if (dateRange?.from) params.from = format(dateRange.from, 'yyyy-MM-dd');
      if (dateRange?.to)   params.to   = format(dateRange.to,   'yyyy-MM-dd');
      if (dbFilters.billCode) params.billCode = dbFilters.billCode;
      if (dbFilters.customer) params.customer = dbFilters.customer;
      if (dbFilters.route)    params.route    = dbFilters.route;

      const blob = await exportCostStatement(params);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `bang-ke-chi-phi-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[CostStatement] Export failed:', err);
      // TODO: show error notification when UI toast is available
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
    Object.values(dbFilters).some(Boolean) ||
    columnFilters.length > 0;

  const handleApplyFilters = () => {
    const params: SupplierTransactionsParams = { page: 1, page_size: 200 };
    if (dateRange?.from) params.start_date = format(dateRange.from, 'yyyy-MM-dd');
    if (dateRange?.to) params.end_date = format(dateRange.to, 'yyyy-MM-dd');
    const qParts: string[] = [];
    if (dbFilters.billCode) qParts.push(dbFilters.billCode);
    if (dbFilters.customer) qParts.push(dbFilters.customer);
    if (dbFilters.route) qParts.push(dbFilters.route);
    if (qParts.length > 0) params.q = qParts.join(' ');
    setQueryParams(params);
  };

  const clearAllFilters = () => {
    setDateRange(undefined);
    setDbFilters(INITIAL_DB);
    setColumnFilters([]);
    setQueryParams({ page: 1, page_size: 200 });
  };

  const visibleRows = table.getFilteredRowModel().rows;
  const totalFreight = visibleRows.reduce((s, r) => s + r.original.freightCost, 0);
  const totalSurcharge = visibleRows.reduce((s, r) => s + r.original.surcharge, 0);
  const grandTotal = visibleRows.reduce((s, r) => s + r.original.total, 0);

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
        {view === 'statement' && (
          <div className='flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-xs md:ml-auto md:w-auto'>
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
            <span className='text-muted-foreground'>
              Cước: <span className='font-medium text-foreground'>{formatVND(totalFreight)}</span>
            </span>
            <span className='text-muted-foreground'>
              Phụ phí: <span className='font-medium text-foreground'>{formatVND(totalSurcharge)}</span>
            </span>
            <span className='rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary'>
              Tổng: {formatVND(grandTotal)}
            </span>
          </div>
        )}
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
            <Label>Mã bill</Label>
            <Input
              value={dbFilters.billCode}
              onChange={(e) => setDbFilters((p) => ({ ...p, billCode: e.target.value }))}
              placeholder='MH-2024-...'
              className='h-8 w-36 text-xs'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <Label>Khách hàng</Label>
            <Input
              value={dbFilters.customer}
              onChange={(e) => setDbFilters((p) => ({ ...p, customer: e.target.value }))}
              placeholder='Tên công ty...'
              className='h-8 w-40 text-xs'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <Label>Tuyến đường</Label>
            <Input
              value={dbFilters.route}
              onChange={(e) => setDbFilters((p) => ({ ...p, route: e.target.value }))}
              placeholder='HCM → HN...'
              className='h-8 w-32 text-xs'
            />
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
            <span className='font-semibold'>{dirtyCellCount} ô</span>
            {' '}trong{' '}
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
        {/* Card list — mobile: thông tin chính, vẫn chỉnh sửa inline được */}
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
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Cước phí</span>
                  <span className='tabular-nums'>{formatVND(totalFreight)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Phụ phí</span>
                  <span className='tabular-nums'>{formatVND(totalSurcharge)}</span>
                </div>
                <div className='flex justify-between border-t border-border pt-1 font-semibold'>
                  <span>Tổng cộng ({visibleRows.length} bản ghi)</span>
                  <span className='tabular-nums text-primary'>{formatVND(grandTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Table — từ sm trở lên, scroll ngang khi nhiều cột */}
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
                  {/* STT + billCode + createdDate + customer + route + cargoType + quantity */}
                  <td colSpan={7} className='px-3 py-2 text-xs text-muted-foreground'>
                    Tổng ({visibleRows.length} bản ghi)
                  </td>
                  <td className='px-3 py-2 text-right text-xs tabular-nums'>
                    {formatVND(totalFreight)}
                  </td>
                  <td className='px-3 py-2 text-right text-xs tabular-nums'>
                    {formatVND(totalSurcharge)}
                  </td>
                  <td className='px-3 py-2 text-right text-xs font-bold tabular-nums text-primary'>
                    {formatVND(grandTotal)}
                  </td>
                  <td colSpan={2} />
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
