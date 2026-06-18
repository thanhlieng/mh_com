/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification, Tooltip } from 'antd';
import { format, parseISO, startOfMonth } from 'date-fns';
import {
  CheckCircleIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SearchIcon,
  UploadCloudIcon,
} from 'lucide-react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { cn } from '@/lib/utils';

import { DateRangePicker } from '@/components/DateRangePicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  createChangeRequest,
  exportKeCuocChiHoReport,
  getSupplierKeCuocChiHo,
  type KeCuocChiHoRow,
} from '@/services/supplier.services';

import { ChiHoUploadModal } from './ChiHoUploadModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatVND = (n: number) => (n || 0).toLocaleString('vi-VN');

/** Ngày container: 'yyyy-MM-dd' → 'dd/MM' (ngày/tháng). */
const formatNgay = (iso: string) => {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'dd/MM');
  } catch {
    return iso;
  }
};

/** Các cột tiền nhóm "Cước" có thể sửa (gửi đề nghị thay đổi). "Phát sinh" KHÔNG sửa. */
const CUOC_FIELDS = [
  { key: 'cuoc', idsKey: 'cuoc_pnl_ids', label: 'Cước' },
  { key: 'ky_gs', idsKey: 'ky_gs_pnl_ids', label: 'Ký GS' },
  { key: 'luu_ca_xe', idsKey: 'luu_ca_xe_pnl_ids', label: 'Lưu ca xe' },
  { key: 'lach_huyen', idsKey: 'lach_huyen_pnl_ids', label: 'Lạch Huyện, HATECO' },
] as const;

type CuocField = (typeof CUOC_FIELDS)[number]['key'];

/** Tất cả cột tiền (để cộng tổng cuối bảng). */
const MONEY_COLUMNS: (keyof KeCuocChiHoRow)[] = [
  'cuoc', 'ky_gs', 'luu_ca_xe', 'lach_huyen', 'phat_sinh', 'tong',
  'so_tien_nang_cont_mh', 'so_tien_ha_cont_mh', 'so_tien_luu_cont_mh',
  'so_tien_phat_sinh_mh', 'tong_chi_ho_mh',
  'so_tien_csht_kh', 'so_tien_nang_cont_kh', 'so_tien_ha_cont_kh',
  'so_tien_luu_cont_kh', 'tong_chi_ho_kh',
];

/**
 * Cấu hình các cột lá (leaf) theo đúng thứ tự render — id + width mặc định.
 * Dùng cho <colgroup> + table-layout:fixed để cột co giãn được, độc lập với
 * header gộp (rowSpan/colSpan).
 */
const LEAF_COLS: { id: string; w: number }[] = [
  { id: 'tt', w: 44 },
  { id: 'ngay', w: 56 },
  { id: 'ma_don_hang', w: 120 },
  { id: 'so_bill_booking', w: 120 },
  { id: 'tuyen', w: 280 },
  { id: 'so_cont', w: 120 },
  { id: 'loai_cont', w: 80 },
  { id: 'loai_hang', w: 90 },
  { id: 'so_to_khai', w: 70 },
  { id: 'bien_so_xe', w: 90 },
  { id: 'cuoc', w: 95 },
  { id: 'ky_gs', w: 80 },
  { id: 'luu_ca_xe', w: 90 },
  { id: 'lach_huyen', w: 110 },
  { id: 'phat_sinh', w: 90 },
  { id: 'tong', w: 100 },
  { id: 'mh_nang', w: 90 },
  { id: 'mh_ha', w: 90 },
  { id: 'mh_luu', w: 110 },
  { id: 'mh_phat_sinh', w: 90 },
  { id: 'tong_chi_ho_mh', w: 110 },
  { id: 'kh_csht', w: 90 },
  { id: 'kh_nang', w: 90 },
  { id: 'kh_ha', w: 90 },
  { id: 'kh_luu', w: 110 },
  { id: 'tong_chi_ho_kh', w: 110 },
  { id: 'upload', w: 140 },
];

const getDefaultDateRange = (): DateRange => {
  const now = new Date();
  return { from: startOfMonth(now), to: now };
};

// ─── Editable money cell ──────────────────────────────────────────────────────

function EditableMoneyCell({
  value,
  editable,
  isDirty,
  onCommit,
}: {
  value: number;
  editable: boolean;
  isDirty: boolean;
  onCommit: (v: number) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { if (editing) ref.current?.select(); }, [editing]);
  React.useEffect(() => { setDraft(String(value)); }, [value]);

  if (!editable) {
    return (
      <Tooltip title='Đã khoá — chỉ sửa được ô có đúng 1 dòng chi phí, đơn chưa hoàn tất. Liên hệ MH để thay đổi.'>
        <div className='cursor-not-allowed px-1 py-1 text-right text-xs tabular-nums text-muted-foreground'>
          {formatVND(value)}
        </div>
      </Tooltip>
    );
  }

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
          isDirty && 'border-amber-400 focus-visible:ring-amber-300',
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'min-h-[26px] cursor-pointer rounded px-1 py-1 text-right text-xs tabular-nums hover:bg-accent',
        isDirty && 'border-l-2 border-amber-400 bg-amber-50 text-amber-900',
      )}
      onClick={() => setEditing(true)}
      title={isDirty ? 'Đã chỉnh sửa' : 'Click để chỉnh sửa'}
    >
      {formatVND(value)}
    </div>
  );
}

// ─── Read-only cells ──────────────────────────────────────────────────────────

const Money = ({ v }: { v: number }) => (
  <div className='truncate px-2 py-1 text-right text-xs tabular-nums'>{formatVND(v)}</div>
);
const Text = ({ v }: { v: string }) => (
  <div className='truncate px-2 py-1 text-xs'>
    {v || <span className='italic text-muted-foreground'>—</span>}
  </div>
);

// ─── Column resize handle ─────────────────────────────────────────────────────

function Resizer({
  colId,
  width,
  onResize,
}: {
  colId: string;
  width: number;
  onResize: (id: string, w: number) => void;
}) {
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev: MouseEvent) => {
      onResize(colId, Math.max(40, startW + ev.clientX - startX));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
      className='absolute -right-px top-0 z-10 h-full w-1.5 cursor-col-resize select-none hover:bg-primary/50'
    />
  );
}

// ─── Searchable column header (real-time filter) ──────────────────────────────

function SearchHeader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span>{label}</span>
      <div className='relative'>
        <SearchIcon className='absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Lọc...'
          className='h-6 pl-5 text-[10px] font-normal'
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const TH =
  'border border-border bg-muted/50 px-2 py-1 text-center text-[11px] font-semibold align-middle';

/** Header của một cột lá: kèm tay cầm kéo giãn (Resizer). */
function LeafTh({
  id,
  rowSpan,
  width,
  onResize,
  children,
}: {
  id: string;
  rowSpan?: number;
  width: number;
  onResize: (id: string, w: number) => void;
  children: React.ReactNode;
}) {
  return (
    <th className={cn(TH, 'relative')} rowSpan={rowSpan}>
      {children}
      <Resizer colId={id} width={width} onResize={onResize} />
    </th>
  );
}

const KeCuocChiHoTable = () => {
  const defaultRange = React.useRef<DateRange>(getDefaultDateRange()).current;
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(defaultRange);
  const [params, setParams] = React.useState<{ from?: string; to?: string }>(() => ({
    from: format(defaultRange.from as Date, 'yyyy-MM-dd'),
    to: format(defaultRange.to as Date, 'yyyy-MM-dd'),
  }));
  const [isExporting, setIsExporting] = React.useState(false);

  // Upload file chi hộ: đơn đang mở modal + số file đã upload theo từng đơn.
  const [uploadRow, setUploadRow] = React.useState<KeCuocChiHoRow | null>(null);
  const [uploadedCounts, setUploadedCounts] = React.useState<Record<number, number>>({});

  // Lọc real-time theo cột (client-side).
  const [filters, setFilters] = React.useState({
    ma_don_hang: '',
    so_bill_booking: '',
    so_cont: '',
    tuyen: '',
  });
  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Độ rộng cột (resizable) — khởi tạo từ LEAF_COLS.
  const [colWidths, setColWidths] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(LEAF_COLS.map((c) => [c.id, c.w])),
  );
  const onResize = (id: string, w: number) =>
    setColWidths((prev) => ({ ...prev, [id]: w }));

  // Phần hiển thị: cả hai | chỉ Cước | chỉ Chi hộ.
  const [section, setSection] = React.useState<'both' | 'cuoc' | 'chiho'>('both');
  const showCuoc = section !== 'chiho';
  const showChiHo = section !== 'cuoc';
  const headerRowSpan = showChiHo ? 2 : 1;

  const CUOC_COL_IDS = ['cuoc', 'ky_gs', 'luu_ca_xe', 'lach_huyen', 'phat_sinh', 'tong'];
  const visibleLeafCols = LEAF_COLS.filter((c) => {
    if (CUOC_COL_IDS.includes(c.id)) return showCuoc;
    if (
      c.id === 'upload' ||
      c.id.startsWith('mh_') ||
      c.id.startsWith('kh_') ||
      c.id.startsWith('tong_chi_ho')
    ) {
      return showChiHo;
    }
    return true; // cột thông tin: luôn hiển thị
  });
  const tableWidth = visibleLeafCols.reduce((s, c) => s + (colWidths[c.id] ?? c.w), 0);

  // Cột tiền hiển thị ở dòng tổng (theo phần đang chọn).
  const visibleMoneyCols = MONEY_COLUMNS.filter((c) =>
    CUOC_COL_IDS.includes(c as string) ? showCuoc : showChiHo,
  );
  // Tổng số cột hiển thị (10 cột thông tin + cột tiền + cột Tải file khi hiện Chi hộ).
  const totalVisibleCols = 10 + visibleMoneyCols.length + (showChiHo ? 1 : 0);

  const queryClient = useQueryClient();

  const apiQuery = useQuery(
    ['supplier-ke-cuoc-chi-ho', params],
    () => getSupplierKeCuocChiHo(params),
    {
      keepPreviousData: true,
      retry: false,
      onError: (e: any) => {
        notification.error({
          message: e?.response?.data?.message ?? 'Tải dữ liệu kê cước & chi hộ thất bại',
          placement: 'top',
        });
      },
    },
  );

  // Bản sao dữ liệu để chỉnh sửa cục bộ + theo dõi ô dirty (key: `${tt}-${field}`).
  const [rows, setRows] = React.useState<KeCuocChiHoRow[]>([]);
  const originalRef = React.useRef<KeCuocChiHoRow[]>([]);
  const [dirty, setDirty] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (apiQuery.data) {
      const data = apiQuery.data.results.map((r) => ({ ...r }));
      setRows(data);
      originalRef.current = apiQuery.data.results.map((r) => ({ ...r }));
      setDirty(new Set());
    }
  }, [apiQuery.data]);

  /** Một ô Cước sửa được khi: đơn chưa hoàn tất & ô có đúng 1 pnl id. */
  const isCellEditable = (row: KeCuocChiHoRow, field: CuocField, idsKey: string) => {
    if (row.order_completed) return false;
    const ids = (row[idsKey as keyof KeCuocChiHoRow] as number[]) ?? [];
    return ids.length === 1 && row.order_id != null;
  };

  const handleEdit = (tt: number, field: CuocField, value: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.tt !== tt) return r;
        const next = { ...r, [field]: value };
        // cập nhật cột Tổng (cước) theo các ô nhóm Cước.
        next.tong =
          next.cuoc + next.ky_gs + next.luu_ca_xe + next.lach_huyen + next.phat_sinh;
        return next;
      }),
    );
    setDirty((prev) => new Set(prev).add(`${tt}-${field}`));
  };

  const handleClear = () => {
    setRows(originalRef.current.map((r) => ({ ...r })));
    setDirty(new Set());
  };

  const createMutation = useMutation(createChangeRequest, {
    onSuccess: (res) => {
      queryClient.invalidateQueries('supplier-change-requests');
      notification.success({
        message: `Đã gửi ${res?.length ?? ''} đề nghị thay đổi thành công`,
        placement: 'top',
      });
      originalRef.current = rows.map((r) => ({ ...r }));
      setDirty(new Set());
    },
    onError: (e: any) => {
      notification.error({
        message: e?.response?.data?.message ?? 'Gửi đề nghị thay đổi thất bại',
        placement: 'top',
      });
    },
  });

  const handleConfirm = () => {
    const payload: { pnl: number; order: number; requested_cost: number }[] = [];
    for (const key of Array.from(dirty)) {
      const [ttStr, field] = key.split('-');
      const tt = Number(ttStr);
      const row = rows.find((r) => r.tt === tt);
      if (!row || row.order_id == null) continue;
      const idsKey = `${field}_pnl_ids` as keyof KeCuocChiHoRow;
      const ids = (row[idsKey] as number[]) ?? [];
      if (ids.length !== 1) continue;
      payload.push({
        pnl: ids[0],
        order: row.order_id,
        requested_cost: row[field as CuocField] as number,
      });
    }
    if (payload.length === 0) return;
    createMutation.mutate(payload);
  };

  const handleApply = () => {
    setParams({
      from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportKeCuocChiHoReport({
        from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-ke-cuoc-chi-ho-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notification.success({ message: 'Xuất báo cáo thành công', placement: 'top' });
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Xuất báo cáo thất bại',
        placement: 'top',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const filteredRows = React.useMemo(() => {
    const match = (v: string, q: string) =>
      !q || (v ?? '').toLowerCase().includes(q.toLowerCase());
    return rows.filter(
      (r) =>
        match(r.ma_don_hang, filters.ma_don_hang) &&
        match(r.so_bill_booking, filters.so_bill_booking) &&
        match(r.so_cont, filters.so_cont) &&
        match(r.tuyen, filters.tuyen),
    );
  }, [rows, filters]);

  const totals = React.useMemo(() => {
    const t: Record<string, number> = {};
    for (const col of MONEY_COLUMNS) {
      t[col as string] = filteredRows.reduce((s, r) => s + ((r[col] as number) || 0), 0);
    }
    return t;
  }, [filteredRows]);

  const dirtyCount = dirty.size;

  return (
    <>
      {/* ── Filter bar ── */}
      <div className='shrink-0 border-b border-border bg-muted/20 px-4 py-3 md:px-6'>
        <div className='flex flex-wrap items-end gap-3'>
          <DateRangePicker
            label='Khoảng thời gian (theo ngày container)'
            value={dateRange}
            allowClear={false}
            onChange={(r) => { if (r?.from) setDateRange(r); }}
            className='w-full md:w-72'
          />
          <Button size='sm' className='h-8 text-xs' onClick={handleApply}>
            Áp dụng
          </Button>

          {/* Chọn phần hiển thị: cả hai / Cước / Chi hộ */}
          <div className='flex items-end'>
            <div className='inline-flex overflow-hidden rounded-md border border-border'>
              {([
                ['both', 'Cả hai'],
                ['cuoc', 'Cước'],
                ['chiho', 'Chi hộ'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSection(key)}
                  className={cn(
                    'h-8 px-3 text-xs font-medium transition-colors',
                    section === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-3 md:ml-auto'>
            <span className='text-xs text-muted-foreground'>
              {apiQuery.isFetching && (
                <Loader2Icon className='mr-1 inline h-3 w-3 animate-spin' />
              )}
              {filteredRows.length} container
              {filteredRows.length !== rows.length && (
                <span className='text-[10px] text-muted-foreground/60'> / {rows.length}</span>
              )}
            </span>
            <Button
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={() => apiQuery.refetch()}
              disabled={apiQuery.isFetching}
            >
              <RefreshCwIcon className={cn('h-3.5 w-3.5', apiQuery.isFetching && 'animate-spin')} />
              Tải lại
            </Button>
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
                <FileSpreadsheetIcon className='h-3.5 w-3.5 text-blue-600' />
              )}
              {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Dirty action bar ── */}
      {dirtyCount > 0 && (
        <div className='flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-amber-200 bg-amber-50 px-4 py-2 md:px-6'>
          <PencilIcon className='h-3.5 w-3.5 shrink-0 text-amber-600' />
          <span className='text-xs text-amber-700'>
            <span className='font-semibold'>{dirtyCount} ô</span> đã chỉnh sửa, chưa gửi.
          </span>
          <div className='ml-auto flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-7 gap-1.5 border-amber-300 text-xs text-amber-700 hover:bg-amber-100'
              onClick={handleClear}
            >
              <RotateCcwIcon className='h-3 w-3' /> Hoàn tác
            </Button>
            <Button
              size='sm'
              className='h-7 gap-1.5 text-xs'
              onClick={handleConfirm}
              disabled={createMutation.isLoading}
            >
              <CheckCircleIcon className='h-3 w-3' /> Gửi đề nghị ({dirtyCount})
            </Button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        {apiQuery.isLoading ? (
          <div className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/10 text-muted-foreground'>
            <Loader2Icon className='h-9 w-9 animate-spin text-primary' />
            <p className='text-sm font-medium'>Đang tải dữ liệu kê cước &amp; chi hộ...</p>
            <p className='text-xs text-muted-foreground/70'>Quá trình này có thể mất một lúc, vui lòng đợi.</p>
          </div>
        ) : (
        <div className='relative w-full overflow-x-auto rounded-md border border-border'>
          {/* Overlay loading khi tải lại (đã có dữ liệu cũ) */}
          {apiQuery.isFetching && (
            <div className='absolute inset-0 z-20 flex items-start justify-center bg-background/50 pt-24 backdrop-blur-[1px]'>
              <div className='flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 shadow-md'>
                <Loader2Icon className='h-4 w-4 animate-spin text-primary' />
                <span className='text-xs font-medium'>Đang tải dữ liệu...</span>
              </div>
            </div>
          )}
          <table className='text-sm' style={{ tableLayout: 'fixed', width: tableWidth }}>
            <colgroup>
              {visibleLeafCols.map((c) => (
                <col key={c.id} style={{ width: colWidths[c.id] ?? c.w }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <LeafTh id='tt' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.tt}>TT</LeafTh>
                <LeafTh id='ngay' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.ngay}>Ngày</LeafTh>
                <LeafTh id='ma_don_hang' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.ma_don_hang}>
                  <SearchHeader label='Mã ĐH' value={filters.ma_don_hang} onChange={(v) => setFilter('ma_don_hang', v)} />
                </LeafTh>
                <LeafTh id='so_bill_booking' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.so_bill_booking}>
                  <SearchHeader label='Số book/Bill' value={filters.so_bill_booking} onChange={(v) => setFilter('so_bill_booking', v)} />
                </LeafTh>
                <LeafTh id='tuyen' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.tuyen}>
                  <SearchHeader label='Tuyến' value={filters.tuyen} onChange={(v) => setFilter('tuyen', v)} />
                </LeafTh>
                <LeafTh id='so_cont' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.so_cont}>
                  <SearchHeader label='Số cont' value={filters.so_cont} onChange={(v) => setFilter('so_cont', v)} />
                </LeafTh>
                <LeafTh id='loai_cont' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.loai_cont}>Loại cont</LeafTh>
                <LeafTh id='loai_hang' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.loai_hang}>Loại hàng</LeafTh>
                <LeafTh id='so_to_khai' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.so_to_khai}>Số tờ khai</LeafTh>
                <LeafTh id='bien_so_xe' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.bien_so_xe}>Biển số xe</LeafTh>

                {showCuoc && (
                  <>
                    <LeafTh id='cuoc' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.cuoc}>Cước</LeafTh>
                    <LeafTh id='ky_gs' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.ky_gs}>Ký GS</LeafTh>
                    <LeafTh id='luu_ca_xe' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.luu_ca_xe}>Lưu ca xe</LeafTh>
                    <LeafTh id='lach_huyen' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.lach_huyen}>Lạch Huyện, HATECO</LeafTh>
                    <LeafTh id='phat_sinh' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.phat_sinh}>Phát sinh</LeafTh>
                    <LeafTh id='tong' rowSpan={headerRowSpan} onResize={onResize} width={colWidths.tong}>Tổng</LeafTh>
                  </>
                )}

                {showChiHo && (
                  <>
                    <th className={TH} colSpan={4}>CHI HỘ XUẤT về MH (có VAT)</th>
                    <LeafTh id='tong_chi_ho_mh' rowSpan={2} onResize={onResize} width={colWidths.tong_chi_ho_mh}>Tổng chi hộ về MH</LeafTh>
                    <th className={TH} colSpan={4}>CHI HỘ XUẤT KHÁCH HÀNG (có VAT)</th>
                    <LeafTh id='tong_chi_ho_kh' rowSpan={2} onResize={onResize} width={colWidths.tong_chi_ho_kh}>Tổng chi hộ về KH</LeafTh>
                    <LeafTh id='upload' rowSpan={2} onResize={onResize} width={colWidths.upload}>Tải file chi hộ</LeafTh>
                  </>
                )}
              </tr>
              {showChiHo && (
                <tr>
                  {/* CHI HỘ về MH */}
                  <LeafTh id='mh_nang' onResize={onResize} width={colWidths.mh_nang}>Nâng cont</LeafTh>
                  <LeafTh id='mh_ha' onResize={onResize} width={colWidths.mh_ha}>Hạ cont</LeafTh>
                  <LeafTh id='mh_luu' onResize={onResize} width={colWidths.mh_luu}>Lưu cont/bãi/VS, SC</LeafTh>
                  <LeafTh id='mh_phat_sinh' onResize={onResize} width={colWidths.mh_phat_sinh}>Phát sinh</LeafTh>
                  {/* CHI HỘ về KH */}
                  <LeafTh id='kh_csht' onResize={onResize} width={colWidths.kh_csht}>CSHT</LeafTh>
                  <LeafTh id='kh_nang' onResize={onResize} width={colWidths.kh_nang}>Nâng cont</LeafTh>
                  <LeafTh id='kh_ha' onResize={onResize} width={colWidths.kh_ha}>Hạ cont</LeafTh>
                  <LeafTh id='kh_luu' onResize={onResize} width={colWidths.kh_luu}>Lưu cont/bãi/VS, SC</LeafTh>
                </tr>
              )}
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={totalVisibleCols} className='py-16 text-center text-xs text-muted-foreground'>
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, i) => (
                  <tr
                    key={row.tt}
                    className={cn(
                      'border-b border-border hover:bg-primary/5',
                      i % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                    )}
                  >
                    <td className='border-x border-border px-2 py-1 text-center text-xs text-muted-foreground'>
                      {row.tt}
                    </td>
                    <td className='border-r border-border'><Text v={formatNgay(row.ngay)} /></td>
                    <td className='border-r border-border'>
                      <div className='flex items-center gap-1 px-2 py-1'>
                        <span className='text-xs'>{row.ma_don_hang || '—'}</span>
                        {row.order_completed && (
                          <Badge variant='secondary' className='px-1 text-[9px]'>Hoàn tất</Badge>
                        )}
                      </div>
                    </td>
                    <td className='border-r border-border'><Text v={row.so_bill_booking} /></td>
                    <td className='border-r border-border'><Text v={row.tuyen} /></td>
                    <td className='border-r border-border'><Text v={row.so_cont} /></td>
                    <td className='border-r border-border'><Text v={row.loai_cont} /></td>
                    <td className='border-r border-border'><Text v={row.loai_hang} /></td>
                    <td className='border-r border-border'><Text v={row.so_to_khai} /></td>
                    <td className='border-r border-border'><Text v={row.bien_so_xe} /></td>

                    {/* nhóm Cước — editable (trừ Phát sinh) */}
                    {showCuoc && (
                      <>
                        {CUOC_FIELDS.map((f) => (
                          <td key={f.key} className='border-r border-border'>
                            <EditableMoneyCell
                              value={row[f.key] as number}
                              editable={isCellEditable(row, f.key, f.idsKey)}
                              isDirty={dirty.has(`${row.tt}-${f.key}`)}
                              onCommit={(v) => handleEdit(row.tt, f.key, v)}
                            />
                          </td>
                        ))}
                        <td className='border-r border-border'><Money v={row.phat_sinh} /></td>
                        <td className='border-r border-border bg-muted/20'><Money v={row.tong} /></td>
                      </>
                    )}

                    {showChiHo && (
                      <>
                        {/* Chi hộ về MH */}
                        <td className='border-r border-border'><Money v={row.so_tien_nang_cont_mh} /></td>
                        <td className='border-r border-border'><Money v={row.so_tien_ha_cont_mh} /></td>
                        <td className='border-r border-border'><Money v={row.so_tien_luu_cont_mh} /></td>
                        <td className='border-r border-border'><Money v={row.so_tien_phat_sinh_mh} /></td>
                        <td className='border-r border-border bg-muted/20'><Money v={row.tong_chi_ho_mh} /></td>

                        {/* Chi hộ về KH */}
                        <td className='border-r border-border'><Money v={row.so_tien_csht_kh} /></td>
                        <td className='border-r border-border'><Money v={row.so_tien_nang_cont_kh} /></td>
                        <td className='border-r border-border'><Money v={row.so_tien_ha_cont_kh} /></td>
                        <td className='border-r border-border'><Money v={row.so_tien_luu_cont_kh} /></td>
                        <td className='border-r border-border bg-muted/20'><Money v={row.tong_chi_ho_kh} /></td>

                        {/* Tải file chi hộ */}
                        <td className='border-r border-border px-2 py-1 text-center'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 w-full gap-1.5 text-[11px]'
                            disabled={row.order_id == null}
                            onClick={() => setUploadRow(row)}
                          >
                            <UploadCloudIcon className='h-3.5 w-3.5' />
                            Tải lên
                            {row.order_container_id != null && uploadedCounts[row.order_container_id] > 0 && (
                              <Badge variant='success' className='ml-0.5 px-1 text-[9px]'>
                                {uploadedCounts[row.order_container_id]}
                              </Badge>
                            )}
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>

            {filteredRows.length > 0 && (
              <tfoot>
                <tr className='border-t-2 border-border bg-muted/40 font-semibold'>
                  <td colSpan={10} className='border-x border-border px-2 py-2 text-xs'>
                    Tổng ({filteredRows.length} container)
                  </td>
                  {visibleMoneyCols.map((col) => (
                    <td key={col as string} className='border-r border-border px-2 py-2 text-right text-xs tabular-nums text-primary'>
                      {formatVND(totals[col as string])}
                    </td>
                  ))}
                  {showChiHo && <td className='border-r border-border' />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        )}
      </div>

      {uploadRow && uploadRow.order_id != null && uploadRow.order_container_id != null && (
        <ChiHoUploadModal
          orderId={uploadRow.order_id}
          orderCode={uploadRow.ma_don_hang}
          containerNo={uploadRow.so_cont}
          bookingBillNumber={uploadRow.so_bill_booking}
          initialUploadedCount={uploadedCounts[uploadRow.order_container_id] ?? 0}
          onClose={() => setUploadRow(null)}
          onUploaded={(total) =>
            setUploadedCounts((prev) => ({
              ...prev,
              [uploadRow.order_container_id as number]: total,
            }))
          }
        />
      )}
    </>
  );
};

export default KeCuocChiHoTable;
