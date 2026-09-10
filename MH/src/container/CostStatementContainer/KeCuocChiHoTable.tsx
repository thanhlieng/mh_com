/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification, Select, Tooltip } from 'antd';
import { format, parseISO, startOfMonth } from 'date-fns';
import {
  CheckCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SearchIcon,
  UploadCloudIcon,
  XCircleIcon,
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
  exportCostStatement,
  exportKeCuocChiHoReport,
  getSupplierKeCuocChiHo,
  type KeCuocChiHoRow,
} from '@/services/supplier.services';

import { ChiHoUploadModal } from './ChiHoUploadModal';
import { ConfirmChangesModal, type DirtyRowChange } from './ConfirmChangesModal';
import { DEFAULT_EDIT_REASON } from './types';
import { Label } from '@/components/ui/label';

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

/** Tháng công nợ: 'yyyy-MM-dd' → 'MM/yyyy' (tháng/năm). */
const formatThangCongNo = (iso: string | null) => {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'MM/yyyy');
  } catch {
    return iso;
  }
};

/** Các cột tiền nhóm "Cước" có thể sửa (gửi đề nghị thay đổi). "Phát sinh" KHÔNG sửa. */
const CUOC_FIELDS = [
  { key: 'cuoc', idsKey: 'cuoc_pnl_ids', label: 'Cước' },
  { key: 'ky_gs', idsKey: 'ky_gs_pnl_ids', label: 'Ký GS' },
  { key: 'luu_ca_xe', idsKey: 'luu_ca_xe_pnl_ids', label: 'Lưu ca xe' },
  {
    key: 'lach_huyen',
    idsKey: 'lach_huyen_pnl_ids',
    label: 'Lạch Huyện, HATECO',
  },
] as const;

type CuocField = (typeof CUOC_FIELDS)[number]['key'];

/** Tất cả cột tiền (để cộng tổng cuối bảng). */
const MONEY_COLUMNS: (keyof KeCuocChiHoRow)[] = [
  'cuoc',
  'ky_gs',
  'luu_ca_xe',
  'lach_huyen',
  'phat_sinh',
  'tong',
  'so_tien_nang_cont_mh',
  'so_tien_ha_cont_mh',
  'so_tien_luu_cont_mh',
  'so_tien_phat_sinh_mh',
  'tong_chi_ho_mh',
  'so_tien_csht_kh',
  'so_tien_nang_cont_kh',
  'so_tien_ha_cont_kh',
  'so_tien_luu_cont_kh',
  'tong_chi_ho_kh',
];

/**
 * Cấu hình các cột lá (leaf) theo đúng thứ tự render — id + width mặc định.
 * Dùng cho <colgroup> + table-layout:fixed để cột co giãn được, độc lập với
 * header gộp (rowSpan/colSpan).
 */
const LEAF_COLS: { id: string; w: number }[] = [
  { id: 'tt', w: 44 },
  { id: 'ngay', w: 56 },
  // { id: 'ma_don_hang', w: 120 },
  { id: 'so_bill_booking', w: 120 },
  { id: 'tuyen', w: 280 },
  { id: 'loai_don_hang', w: 90 },
  { id: 'so_cont', w: 120 },
  { id: 'loai_cont', w: 80 },
  { id: 'loai_hang', w: 90 },
  { id: 'cang_ha', w: 110 },
  { id: 'cang_nang', w: 110 },
  { id: 'so_xe', w: 100 },
  { id: 'thang_cong_no', w: 90 },
  // { id: 'so_to_khai', w: 70 },
  // { id: 'bien_so_xe', w: 90 },
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
  { id: 'chi_ho_ve', w: 240 },
  { id: 'upload', w: 140 },
];

/**
 * Các cột "đóng băng" (freeze) bên trái — từ cột đầu đến "Tháng công nợ".
 * Đây cũng đúng là nhóm cột thông tin luôn hiển thị (không phụ thuộc section),
 * nên `FROZEN_COL_IDS.length` = số cột thông tin (dùng cho colSpan dòng tổng).
 */
const FROZEN_COL_IDS = [
  'tt',
  'ngay',
  'so_bill_booking',
  'tuyen',
  'loai_don_hang',
  'so_cont',
  
] as const;
const INFO_COL_COUNT = FROZEN_COL_IDS.length;

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
  lockedTooltip = 'Đã khoá — Liên hệ MH để thay đổi.',
}: {
  value: number;
  editable: boolean;
  isDirty: boolean;
  onCommit: (v: number) => void;
  /** Tooltip text khi cell read-only (value > 0). */
  lockedTooltip?: string;
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

  if (!editable) {
    return (
      <Tooltip title={value > 0 ? lockedTooltip : ''}>
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
        'min-h-[26px] cursor-pointer rounded px-1 py-1 text-right text-xs tabular-nums hover:bg-accent',
        isDirty && 'border-l-2 border-amber-400 bg-amber-50 text-amber-900'
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
  <div className='truncate px-2 py-1 text-right text-xs tabular-nums'>
    {formatVND(v)}
  </div>
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

// Nền header phải đục (bg-muted, không phải /50) để khi sticky không bị lộ nội
// dung cuộn phía sau. Sticky-top được đặt ở `<thead>` (xem block tag), không
// đặt ở từng `<th>` để 2 dòng header (group + leaf) không cùng pin về top:0
// và đè lên nhau.
const TH =
  'border border-border bg-muted px-2 py-1 text-center text-[11px] font-semibold align-middle';

/** Header của một cột lá: kèm tay cầm kéo giãn (Resizer).
 *
 *  `relative` được giữ làm containing block mặc định cho Resizer absolute.
 *  Với cột frozen-left, className override sang `sticky` (twMerge loại
 *  `relative`) để pin theo trục ngang.
 */
function LeafTh({
  id,
  rowSpan,
  width,
  onResize,
  children,
  style,
  className,
}: {
  id: string;
  rowSpan?: number;
  width: number;
  onResize: (id: string, w: number) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <th className={cn(TH, 'relative', className)} rowSpan={rowSpan} style={style}>
      {children}
      <Resizer colId={id} width={width} onResize={onResize} />
    </th>
  );
}

interface KeCuocChiHoTableProps {
  /**
   * `true` → tab "Chi phí đã chốt": fetch chỉ rows có PNL đã nằm trong request,
   * mọi cell tiền nhóm Cước trở thành read-only, ẩn nút "Gửi đề nghị" + "Hoàn tác",
   * tooltip "Đã chốt — không thể sửa".
   *
   * Giữ nguyên logic tab "Chi phí đã chốt" — hiện đã ẩn ở UI nhưng không xoá.
   */
  locked?: boolean;
  /**
   * `true` → tab HỢP NHẤT: fetch cả PNL đã chốt lẫn chưa chốt (`locked='all'`),
   * hiển thị chung một bảng và khoá RIÊNG từng ô đã chốt (theo `row.locked_pnl_ids`)
   * thay vì khoá toàn bảng như `locked`.
   */
  consolidated?: boolean;
}

const KeCuocChiHoTable: React.FC<KeCuocChiHoTableProps> = ({
  locked = false,
  consolidated = false,
}) => {
  // Giá trị `locked` gửi lên API: 'all' khi hợp nhất, true/false theo tab cũ.
  const lockedParam: boolean | 'all' = consolidated ? 'all' : locked;
  const defaultRange = React.useRef<DateRange>(getDefaultDateRange()).current;
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    defaultRange
  );
  const [params, setParams] = React.useState<{ from?: string; to?: string }>(
    () => ({
      from: format(defaultRange.from as Date, 'yyyy-MM-dd'),
      to: format(defaultRange.to as Date, 'yyyy-MM-dd'),
    })
  );
  const [isExporting, setIsExporting] = React.useState(false);
  const [isExportingStatement, setIsExportingStatement] = React.useState(false);

  // Upload file chi hộ: đơn đang mở modal + số file vừa upload (chờ duyệt) theo
  // từng ĐƠN trong phiên (cộng vào số "Chờ duyệt" hiển thị, không cần refetch).
  const [uploadRow, setUploadRow] = React.useState<KeCuocChiHoRow | null>(null);
  const [pendingDelta, setPendingDelta] = React.useState<
    Record<number, number>
  >({});

  // Số file theo trạng thái duyệt của một dòng (gộp delta vừa upload trong phiên).
  const fileCountsOf = (row: KeCuocChiHoRow) => {
    const fc = row.file_counts ?? { approved: 0, pending: 0, rejected: 0 };
    const extra = row.order_id != null ? pendingDelta[row.order_id] ?? 0 : 0;
    return {
      approved: fc.approved,
      pending: fc.pending + extra,
      rejected: fc.rejected,
    };
  };

  // Thanh cuộn ngang đặt phía trên bảng — đồng bộ scrollLeft với vùng bảng.
  const bodyScrollRef = React.useRef<HTMLDivElement>(null);
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const onTopScroll = () => {
    if (bodyScrollRef.current && topScrollRef.current) {
      bodyScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };
  const onBodyScroll = () => {
    if (bodyScrollRef.current && topScrollRef.current) {
      topScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  };

  // Lọc real-time theo cột (client-side).
  const [filters, setFilters] = React.useState({
    ma_don_hang: '',
    so_bill_booking: '',
    so_cont: '',
    tuyen: '',
    cang_nang:"",
    cang_ha:"",
    so_xe:'',
    thang_cong_no:'',
    loai_don_hang:'',
    loai_cont:'',
    loai_hang: ''
  });
  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Độ rộng cột (resizable) — khởi tạo từ LEAF_COLS.
  const [colWidths, setColWidths] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(LEAF_COLS.map((c) => [c.id, c.w]))
  );
  const onResize = (id: string, w: number) =>
    setColWidths((prev) => ({ ...prev, [id]: w }));

  // Vị trí `left` của từng cột đóng băng = tổng độ rộng các cột đứng trước nó.
  const frozenLeft = React.useMemo(() => {
    const map: Record<string, number> = {};
    let acc = 0;
    for (const id of FROZEN_COL_IDS) {
      map[id] = acc;
      acc +=
        colWidths[id] ?? LEAF_COLS.find((c) => c.id === id)?.w ?? 0;
    }
    return map;
  }, [colWidths]);

  // Đóng băng theo trục NGANG cho các cột bên trái. Vì cell trong LeafTh mặc
  // định `relative`, cần class `sticky` (cùng !important — twMerge loại
  // `relative`) để pin theo trục ngang qua inline `left`. z-30 để corner
  // (top-left của thead) đè lên: header thường (parent thead pin top z-20) và
  // body cells frozen-left (z-10).
  const FROZEN_HEADER_CLASS = 'sticky z-30';
  const frozenHeaderStyle = (id: string): React.CSSProperties => ({
    left: frozenLeft[id],
  });
  const frozenBody = (id: string): React.CSSProperties => ({
    position: 'sticky',
    left: frozenLeft[id],
    zIndex: 10,
  });

  // Phần hiển thị: cả hai | chỉ Cước | chỉ Chi hộ.
  const [section, setSection] = React.useState<'both' | 'cuoc' | 'chiho'>(
    'chiho'
  );
  const showCuoc = section !== 'chiho';
  const showChiHo = section !== 'cuoc';
  const headerRowSpan = showChiHo ? 2 : 1;

  const CUOC_COL_IDS = [
    'cuoc',
    'ky_gs',
    'luu_ca_xe',
    'lach_huyen',
    'phat_sinh',
    'tong',
  ];
  const visibleLeafCols = LEAF_COLS.filter((c) => {
    if (CUOC_COL_IDS.includes(c.id)) return showCuoc;
    if (
      c.id === 'upload' ||
      c.id === 'chi_ho_ve' ||
      c.id.startsWith('mh_') ||
      c.id.startsWith('kh_') ||
      c.id.startsWith('tong_chi_ho')
    ) {
      return showChiHo;
    }
    return true; // cột thông tin: luôn hiển thị
  });
  const tableWidth = visibleLeafCols.reduce(
    (s, c) => s + (colWidths[c.id] ?? c.w),
    0
  );

  // Cột tiền hiển thị ở dòng tổng (theo phần đang chọn).
  const visibleMoneyCols = MONEY_COLUMNS.filter((c) =>
    CUOC_COL_IDS.includes(c as string) ? showCuoc : showChiHo
  );
  // Tổng số cột hiển thị (cột thông tin + cột tiền + cột "Chi hộ về" và "Tải file" khi hiện Chi hộ).
  const totalVisibleCols =
    INFO_COL_COUNT + visibleMoneyCols.length + (showChiHo ? 2 : 0);

  const queryClient = useQueryClient();

  const apiQuery = useQuery(
    ['supplier-ke-cuoc-chi-ho', { ...params, locked: lockedParam }],
    () => getSupplierKeCuocChiHo({ ...params, locked: lockedParam }),
    {
      keepPreviousData: true,
      retry: false,
      // Không tự tải lại khi chuyển tab / focus lại cửa sổ. Người dùng dùng nút
      // "Tải lại" hoặc đổi bộ lọc để làm mới.
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
      onError: (e: any) => {
        notification.error({
          message:
            e?.response?.data?.message ??
            'Tải dữ liệu kê cước & chi hộ thất bại',
          placement: 'top',
        });
      },
    }
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
      // Dữ liệu mới đã có file_counts cập nhật → bỏ delta cộng thêm trong phiên.
      setPendingDelta({});
    }
  }, [apiQuery.data]);

  /** Một ô Cước sửa được khi: đơn chưa hoàn tất & ô có đúng 1 pnl id. */
  const isCellEditable = (
    row: KeCuocChiHoRow,
    field: CuocField,
    idsKey: string
  ) => {
    // Tab "Chi phí đã chốt": tuyệt đối không sửa.
    if (locked) return false;
    if (row.order_completed) return false;
    const ids = (row[idsKey as keyof KeCuocChiHoRow] as number[]) ?? [];
    if (ids.length !== 1 || row.order_id == null) return false;
    // Tab hợp nhất: khoá riêng ô có pnl đã chốt (nằm trong request trucking).
    if (row.locked_pnl_ids?.includes(ids[0])) return false;
    return true;
  };

  /** Ô Cước bị khoá vì pnl của nó đã chốt (tab hợp nhất). */
  const isCellLocked = (row: KeCuocChiHoRow, idsKey: string) => {
    const ids = (row[idsKey as keyof KeCuocChiHoRow] as number[]) ?? [];
    return ids.length === 1 && !!row.locked_pnl_ids?.includes(ids[0]);
  };

  const handleEdit = (tt: number, field: CuocField, value: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.tt !== tt) return r;
        const next = { ...r, [field]: value };
        // cập nhật cột Tổng (cước) theo các ô nhóm Cước.
        next.tong =
          next.cuoc +
          next.ky_gs +
          next.luu_ca_xe +
          next.lach_huyen +
          next.phat_sinh;
        return next;
      })
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

  // Lý do thay đổi per dirty key (`${tt}-${field}`)
  const [reasonMap, setReasonMap] = React.useState<Record<string, string>>({});
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);

  /** Danh sách thay đổi hợp lệ (có pnl + order, ids.length===1). */
  const dirtyChanges: (DirtyRowChange & {
    pnlId: number;
    orderId: number;
  })[] = React.useMemo(() => {
    const out: (DirtyRowChange & { pnlId: number; orderId: number })[] = [];
    const origByTt = new Map(originalRef.current.map((r) => [r.tt, r]));
    for (const key of Array.from(dirty)) {
      const [ttStr, field] = key.split('-');
      const tt = Number(ttStr);
      const row = rows.find((r) => r.tt === tt);
      if (!row || row.order_id == null) continue;
      const idsKey = `${field}_pnl_ids` as keyof KeCuocChiHoRow;
      const ids = (row[idsKey] as number[]) ?? [];
      if (ids.length !== 1) continue;
      const meta = CUOC_FIELDS.find((f) => f.key === (field as CuocField));
      const orig = origByTt.get(tt);
      out.push({
        key,
        orderCode: row.ma_don_hang || row.so_bill_booking,
        containerNo: row.so_cont,
        serviceName: meta?.label,
        oldAmount: (orig?.[field as CuocField] as number) ?? 0,
        newAmount: row[field as CuocField] as number,
        pnlId: ids[0],
        orderId: row.order_id,
      });
    }
    return out;
  }, [dirty, rows]);

  const handleOpenConfirm = () => {
    if (dirtyChanges.length === 0) return;
    setReasonMap((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const c of dirtyChanges) {
        if (next[c.key] === undefined) next[c.key] = DEFAULT_EDIT_REASON;
      }
      return next;
    });
    setConfirmModalOpen(true);
  };

  const handleReasonChange = React.useCallback(
    (key: string, value: string) => {
      setReasonMap((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleResetReason = React.useCallback((key: string) => {
    setReasonMap((prev) => ({ ...prev, [key]: DEFAULT_EDIT_REASON }));
  }, []);

  const handleSubmitChanges = async () => {
    const payload = dirtyChanges.map((c) => ({
      pnl: c.pnlId,
      order: c.orderId,
      requested_cost: c.newAmount,
      reason: (reasonMap[c.key] ?? DEFAULT_EDIT_REASON).trim(),
    }));
    if (payload.length === 0) return;
    try {
      await createMutation.mutateAsync(payload);
      setReasonMap({});
      setConfirmModalOpen(false);
    } catch {
      // error toasted bởi react-query onError
    }
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
        from: dateRange?.from
          ? format(dateRange.from, 'yyyy-MM-dd')
          : undefined,
        to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-ke-cuoc-chi-ho-${format(
        new Date(),
        'yyyy-MM-dd'
      )}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notification.success({
        message: 'Xuất báo cáo thành công',
        placement: 'top',
      });
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Xuất báo cáo thất bại',
        placement: 'top',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Xuất "Bảng kê chi phí" (Excel) — dùng cùng khoảng thời gian của tab.
  const handleExportStatement = async () => {
    setIsExportingStatement(true);
    try {
      const params: Parameters<typeof exportCostStatement>[0] = {};
      if (dateRange?.from) params.from = format(dateRange.from, 'yyyy-MM-dd');
      if (dateRange?.to) params.to = format(dateRange.to, 'yyyy-MM-dd');

      const blob = await exportCostStatement(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bang-ke-chi-phi-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notification.success({
        message: 'Xuất bảng kê thành công',
        placement: 'top',
      });
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Xuất bảng kê thất bại',
        placement: 'top',
      });
    } finally {
      setIsExportingStatement(false);
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
        match(r.tuyen, filters.tuyen)
    );
  }, [rows, filters]);

  const totals = React.useMemo(() => {
    const t: Record<string, number> = {};
    for (const col of MONEY_COLUMNS) {
      t[col as string] = filteredRows.reduce(
        (s, r) => s + ((r[col] as number) || 0),
        0
      );
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
            onChange={(r) => {
              if (r?.from) setDateRange(r);
            }}
            className='w-full md:w-72'
          />
          <Button size='sm' className='h-8 text-xs' onClick={handleApply}>
            Áp dụng
          </Button>

          {/* Chọn phần hiển thị: cả hai / Cước / Chi hộ */}
          <div className='flex items-end'>
            <div className='inline-flex overflow-hidden rounded-md border border-border'>
              {(
                [
                  ['both', 'Cả hai'],
                  ['cuoc', 'Cước'],
                  ['chiho', 'Chi hộ'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSection(key)}
                  className={cn(
                    'h-8 px-3 text-xs font-medium transition-colors',
                    section === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
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
                <span className='text-[10px] text-muted-foreground/60'>
                  {' '}
                  / {rows.length}
                </span>
              )}
            </span>
            <Button
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={() => apiQuery.refetch()}
              disabled={apiQuery.isFetching}
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
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={handleExportStatement}
              disabled={isExportingStatement}
            >
              {isExportingStatement ? (
                <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <FileSpreadsheetIcon className='h-3.5 w-3.5 text-green-600' />
              )}
              {isExportingStatement ? 'Đang xuất...' : 'Xuất bảng kê'}
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
              {isExporting ? 'Đang xuất...' : 'Xuất báo cáo kê cước & chi hộ'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Dirty action bar ── */}
      {dirtyCount > 0 && (
        <div className='flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-amber-200 bg-amber-50 px-4 py-2 md:px-6'>
          <PencilIcon className='h-3.5 w-3.5 shrink-0 text-amber-600' />
          <span className='text-xs text-amber-700'>
            <span className='font-semibold'>{dirtyCount} ô</span> đã chỉnh sửa,
            chưa gửi.
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
              onClick={handleOpenConfirm}
              disabled={
                createMutation.isLoading || dirtyChanges.length === 0
              }
            >
              <CheckCircleIcon className='h-3 w-3' /> Gửi đề nghị ({dirtyCount})
            </Button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {/* Outer: flex column + overflow-hidden để bodyScrollRef (flex-1 min-h-0
          overflow-auto) là viewport scroll Y → sticky thead pin được vào đỉnh
          wrapper khi cuộn dọc trong bảng. */}
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6'>
        {apiQuery.isLoading ? (
          <div className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/10 text-muted-foreground'>
            <Loader2Icon className='h-9 w-9 animate-spin text-primary' />
            <p className='text-sm font-medium'>
              Đang tải dữ liệu kê cước &amp; chi hộ...
            </p>
            <p className='text-xs text-muted-foreground/70'>
              Quá trình này có thể mất một lúc, vui lòng đợi.
            </p>
          </div>
        ) : (
          <>
            {/* Thanh cuộn ngang phía trên (đồng bộ với bảng) — dễ cuộn khi nhiều cột */}
            <div
              ref={topScrollRef}
              onScroll={onTopScroll}
              className='w-full shrink-0 overflow-x-auto'
            >
              <div style={{ width: tableWidth, height: 1 }} />
            </div>

            <div
              ref={bodyScrollRef}
              onScroll={onBodyScroll}
              className='relative mt-1 min-h-0 w-full flex-1 overflow-auto rounded-md border border-border'
            >
              {/* Overlay loading khi tải lại (đã có dữ liệu cũ) */}
              {apiQuery.isFetching && (
                <div className='absolute inset-0 z-20 flex items-start justify-center bg-background/50 pt-24 backdrop-blur-[1px]'>
                  <div className='flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 shadow-md'>
                    <Loader2Icon className='h-4 w-4 animate-spin text-primary' />
                    <span className='text-xs font-medium'>
                      Đang tải dữ liệu...
                    </span>
                  </div>
                </div>
              )}
              <table
                className='text-sm'
                style={{ tableLayout: 'fixed', width: tableWidth }}
              >
                <colgroup>
                  {visibleLeafCols.map((c) => (
                    <col key={c.id} style={{ width: colWidths[c.id] ?? c.w }} />
                  ))}
                </colgroup>
                <thead className='sticky top-0 z-20'>
                  <tr>
                    <LeafTh
                      id='tt'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.tt}
                      className={FROZEN_HEADER_CLASS}
                      style={frozenHeaderStyle('tt')}
                    >
                      TT
                    </LeafTh>
                    <LeafTh
                      id='ngay'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.ngay}
                      className={FROZEN_HEADER_CLASS}
                      style={frozenHeaderStyle('ngay')}
                    >
                      Ngày
                    </LeafTh>
                    {/* <LeafTh
                      id='ma_don_hang'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.ma_don_hang}
                    >
                      <SearchHeader
                        label='Mã ĐH'
                        value={filters.ma_don_hang}
                        onChange={(v) => setFilter('ma_don_hang', v)}
                      />
                    </LeafTh> */}
                    <LeafTh
                      id='so_bill_booking'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.so_bill_booking}
                      className={FROZEN_HEADER_CLASS}
                      style={frozenHeaderStyle('so_bill_booking')}
                    >
                      <SearchHeader
                        label='Số book/Bill'
                        value={filters.so_bill_booking}
                        onChange={(v) => setFilter('so_bill_booking', v)}
                      />
                    </LeafTh>
                    <LeafTh
                      id='tuyen'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.tuyen}
                      className={FROZEN_HEADER_CLASS}
                      style={frozenHeaderStyle('tuyen')}
                    >
                      <SearchHeader
                        label='Tuyến'
                        value={filters.tuyen}
                        onChange={(v) => setFilter('tuyen', v)}
                      />
                    </LeafTh>
                    <LeafTh
                      id='loai_don_hang'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.loai_don_hang}
                      className={FROZEN_HEADER_CLASS}
                      style={frozenHeaderStyle('loai_don_hang')}
                    >
                      <div className='flex flex-col gap-1'>
                      <span>Loại đơn hàng</span>
                <Select
                  allowClear
                  showSearch
                  value={filters.loai_don_hang}
                  placeholder='Đơn hàng'
                  optionFilterProp='label'
                  // loading={optionsQuery.isLoading}
                  onChange={(v) => setFilter('loai_don_hang', v)}
                  // style={{ width: 240 }}
                  options={[{label:'Nhập khẩu', value: 'Nhập khẩu'}, {label:'Xuất khẩu', value: 'Xuất khẩu'}]}
                  size='small'
                /></div>
                    </LeafTh>
                    <LeafTh
                      id='so_cont'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.so_cont}
                      className={FROZEN_HEADER_CLASS}
                      style={frozenHeaderStyle('so_cont')}
                    >
                      <SearchHeader
                        label='Số cont'
                        value={filters.so_cont}
                        onChange={(v) => setFilter('so_cont', v)}
                      />
                    </LeafTh>
                    <LeafTh
                      id='loai_cont'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.loai_cont}
                      // className={FROZEN_HEADER_CLASS}
                      // style={frozenHeaderStyle('loai_cont')}
                    >
                      

                      <SearchHeader
                        label='Loại cont'
                        value={filters.loai_cont}
                        onChange={(v) => setFilter('loai_cont', v)}
                      />
                    </LeafTh>
                    <LeafTh
                      id='loai_hang'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.loai_hang}
                      // className={FROZEN_HEADER_CLASS}
                      // style={frozenHeaderStyle('loai_hang')}
                    >
                      
                       <SearchHeader
                        label='Loại hàng'
                        value={filters.loai_hang}
                        onChange={(v) => setFilter('loai_hang', v)}
                      />
                    </LeafTh>
                    <LeafTh
                      id='cang_ha'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.cang_ha}
                      // className={FROZEN_HEADER_CLASS}
                      // style={frozenHeaderStyle('cang_ha')}
                    >
                      <SearchHeader
                        label='Cảng hạ'
                        value={filters.cang_ha}
                        onChange={(v) => setFilter('cang_ha', v)}
                      />
                      
                    </LeafTh>
                    <LeafTh
                      id='cang_nang'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.cang_nang}
                      // className={FROZEN_HEADER_CLASS}
                      // style={frozenHeaderStyle('cang_nang')}
                    >
                      <SearchHeader
                        label='Cảng nâng'
                        value={filters.cang_nang}
                        onChange={(v) => setFilter('cang_nang', v)}
                      />
                      
                    </LeafTh>
                    <LeafTh
                      id='so_xe'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.so_xe}
                      // className={FROZEN_HEADER_CLASS}
                      // style={frozenHeaderStyle('so_xe')}
                    >
                      <SearchHeader
                        label='Số xe'
                        value={filters.so_xe}
                        onChange={(v) => setFilter('so_xe', v)}
                      />
                      
                    </LeafTh>
                    <LeafTh
                      id='thang_cong_no'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.thang_cong_no}
                      // className={FROZEN_HEADER_CLASS}
                      // style={frozenHeaderStyle('thang_cong_no')}
                    >
                      <SearchHeader
                        label='Tháng công nợ'
                        value={filters.thang_cong_no}
                        onChange={(v) => setFilter('thang_cong_no', v)}
                      />
                      
                    </LeafTh>
                    {/* <LeafTh
                      id='so_to_khai'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.so_to_khai}
                    >
                      Số tờ khai
                    </LeafTh>
                    <LeafTh
                      id='bien_so_xe'
                      rowSpan={headerRowSpan}
                      onResize={onResize}
                      width={colWidths.bien_so_xe}
                    >
                      Biển số xe
                    </LeafTh> */}

                    {showCuoc && (
                      <>
                        <LeafTh
                          id='cuoc'
                          rowSpan={headerRowSpan}
                          onResize={onResize}
                          width={colWidths.cuoc}
                        >
                          Cước
                        </LeafTh>
                        <LeafTh
                          id='ky_gs'
                          rowSpan={headerRowSpan}
                          onResize={onResize}
                          width={colWidths.ky_gs}
                        >
                          Ký GS
                        </LeafTh>
                        <LeafTh
                          id='luu_ca_xe'
                          rowSpan={headerRowSpan}
                          onResize={onResize}
                          width={colWidths.luu_ca_xe}
                        >
                          Lưu ca xe
                        </LeafTh>
                        <LeafTh
                          id='lach_huyen'
                          rowSpan={headerRowSpan}
                          onResize={onResize}
                          width={colWidths.lach_huyen}
                        >
                          Lạch Huyện, HATECO
                        </LeafTh>
                        <LeafTh
                          id='phat_sinh'
                          rowSpan={headerRowSpan}
                          onResize={onResize}
                          width={colWidths.phat_sinh}
                        >
                          Phát sinh
                        </LeafTh>
                        <LeafTh
                          id='tong'
                          rowSpan={headerRowSpan}
                          onResize={onResize}
                          width={colWidths.tong}
                        >
                          Tổng
                        </LeafTh>
                      </>
                    )}

                    {showChiHo && (
                      <>
                        <th className={TH} colSpan={4}>
                          CHI HỘ XUẤT về MH (có VAT)
                        </th>
                        <LeafTh
                          id='tong_chi_ho_mh'
                          rowSpan={2}
                          onResize={onResize}
                          width={colWidths.tong_chi_ho_mh}
                        >
                          Tổng chi hộ về MH
                        </LeafTh>
                        <th className={TH} colSpan={4}>
                          CHI HỘ XUẤT KHÁCH HÀNG (có VAT)
                        </th>
                        <LeafTh
                          id='tong_chi_ho_kh'
                          rowSpan={2}
                          onResize={onResize}
                          width={colWidths.tong_chi_ho_kh}
                        >
                          Tổng chi hộ về KH
                        </LeafTh>
                        <LeafTh
                          id='chi_ho_ve'
                          rowSpan={2}
                          onResize={onResize}
                          width={colWidths.chi_ho_ve}
                        >
                          Chi hộ về
                        </LeafTh>
                        <LeafTh
                          id='upload'
                          rowSpan={2}
                          onResize={onResize}
                          width={colWidths.upload}
                        >
                          Tải file chi hộ
                        </LeafTh>
                      </>
                    )}
                  </tr>
                  {showChiHo && (
                    <tr>
                      {/* CHI HỘ về MH */}
                      <LeafTh
                        id='mh_nang'
                        onResize={onResize}
                        width={colWidths.mh_nang}
                      >
                        Nâng cont
                      </LeafTh>
                      <LeafTh
                        id='mh_ha'
                        onResize={onResize}
                        width={colWidths.mh_ha}
                      >
                        Hạ cont
                      </LeafTh>
                      <LeafTh
                        id='mh_luu'
                        onResize={onResize}
                        width={colWidths.mh_luu}
                      >
                        Lưu cont/bãi/VS, SC
                      </LeafTh>
                      <LeafTh
                        id='mh_phat_sinh'
                        onResize={onResize}
                        width={colWidths.mh_phat_sinh}
                      >
                        Phát sinh
                      </LeafTh>
                      {/* CHI HỘ về KH */}
                      <LeafTh
                        id='kh_csht'
                        onResize={onResize}
                        width={colWidths.kh_csht}
                      >
                        CSHT
                      </LeafTh>
                      <LeafTh
                        id='kh_nang'
                        onResize={onResize}
                        width={colWidths.kh_nang}
                      >
                        Nâng cont
                      </LeafTh>
                      <LeafTh
                        id='kh_ha'
                        onResize={onResize}
                        width={colWidths.kh_ha}
                      >
                        Hạ cont
                      </LeafTh>
                      <LeafTh
                        id='kh_luu'
                        onResize={onResize}
                        width={colWidths.kh_luu}
                      >
                        Lưu cont/bãi/VS, SC
                      </LeafTh>
                    </tr>
                  )}
                </thead>

                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={totalVisibleCols}
                        className='py-16 text-center text-xs text-muted-foreground'
                      >
                        Không có dữ liệu phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, i) => (
                      <tr
                        key={row.tt}
                        className={cn(
                          'border-b border-border hover:bg-primary/5',
                          i % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                        )}
                      >
                        <td
                          className='border-x border-border bg-background px-2 py-1 text-center text-xs text-muted-foreground'
                          style={frozenBody('tt')}
                        >
                          {row.tt}
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          style={frozenBody('ngay')}
                        >
                          <Text v={formatNgay(row.ngay)} />
                        </td>
                        {/* <td className='border-r border-border'>
                          <div className='flex items-center gap-1 px-2 py-1'>
                            <span className='text-xs'>
                              {row.ma_don_hang || '—'}
                            </span>
                            {row.order_completed && (
                              <Badge
                                variant='secondary'
                                className='px-1 text-[9px]'
                              >
                                Hoàn tất
                              </Badge>
                            )}
                          </div>
                        </td> */}
                        <td
                          className='border-r border-border bg-background'
                          style={frozenBody('so_bill_booking')}
                        >
                          <Text v={row.so_bill_booking} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          style={frozenBody('tuyen')}
                        >
                          <Text v={row.tuyen} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          style={frozenBody('loai_don_hang')}
                        >
                          <Text v={row.loai_don_hang} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          style={frozenBody('so_cont')}
                        >
                          <Text v={row.so_cont} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          // style={frozenBody('loai_cont')}
                        >
                          <Text v={row.loai_cont} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          // style={frozenBody('loai_hang')}
                        >
                          <Text v={row.loai_hang} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          // style={frozenBody('cang_ha')}
                        >
                          <Text v={row.cang_ha} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          // style={frozenBody('cang_nang')}
                        >
                          <Text v={row.cang_nang} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          // style={frozenBody('so_xe')}
                        >
                          <Text v={row.so_xe} />
                        </td>
                        <td
                          className='border-r border-border bg-background'
                          // style={frozenBody('thang_cong_no')}
                        >
                          <Text v={formatThangCongNo(row.thang_cong_no)} />
                        </td>
                        {/* <td className='border-r border-border'>
                          <Text v={row.so_to_khai} />
                        </td>
                        <td className='border-r border-border'>
                          <Text v={row.bien_so_xe} />
                        </td> */}

                        {/* nhóm Cước — editable (trừ Phát sinh) */}
                        {showCuoc && (
                          <>
                            {CUOC_FIELDS.map((f) => (
                              <td
                                key={f.key}
                                className='border-r border-border'
                              >
                                <EditableMoneyCell
                                  value={row[f.key] as number}
                                  editable={isCellEditable(
                                    row,
                                    f.key,
                                    f.idsKey
                                  )}
                                  isDirty={dirty.has(`${row.tt}-${f.key}`)}
                                  onCommit={(v) => handleEdit(row.tt, f.key, v)}
                                  lockedTooltip={
                                    locked ||
                                    isCellLocked(row, f.idsKey)
                                      ? 'Đã chốt — không thể sửa.'
                                      : undefined
                                  }
                                />
                              </td>
                            ))}
                            <td className='border-r border-border'>
                              <Money v={row.phat_sinh} />
                            </td>
                            <td className='border-r border-border bg-muted/20'>
                              <Money v={row.tong} />
                            </td>
                          </>
                        )}

                        {showChiHo && (
                          <>
                            {/* Chi hộ về MH */}
                            <td className='border-r border-border'>
                              <Money v={row.so_tien_nang_cont_mh} />
                            </td>
                            <td className='border-r border-border'>
                              <Money v={row.so_tien_ha_cont_mh} />
                            </td>
                            <td className='border-r border-border'>
                              <Money v={row.so_tien_luu_cont_mh} />
                            </td>
                            <td className='border-r border-border'>
                              <Money v={row.so_tien_phat_sinh_mh} />
                            </td>
                            <td className='border-r border-border bg-muted/20'>
                              <Money v={row.tong_chi_ho_mh} />
                            </td>

                            {/* Chi hộ về KH */}
                            <td className='border-r border-border'>
                              <Money v={row.so_tien_csht_kh} />
                            </td>
                            <td className='border-r border-border'>
                              <Money v={row.so_tien_nang_cont_kh} />
                            </td>
                            <td className='border-r border-border'>
                              <Money v={row.so_tien_ha_cont_kh} />
                            </td>
                            <td className='border-r border-border'>
                              <Money v={row.so_tien_luu_cont_kh} />
                            </td>
                            <td className='border-r border-border bg-muted/20'>
                              <Money v={row.tong_chi_ho_kh} />
                            </td>

                            {/* Chi hộ về (theo order.chi_ho_for) */}
                            <td className='border-r border-border'>
                              <div
                                className='whitespace-normal break-words px-2 py-1 text-xs leading-snug'
                                title={row.chi_ho_ve || ''}
                              >
                                {row.chi_ho_ve || (
                                  <span className='italic text-muted-foreground'>
                                    —
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Tải file chi hộ + số file theo trạng thái duyệt */}
                            <td className='border-r border-border px-2 py-1'>
                              {(() => {
                                const fc = fileCountsOf(row);
                                return (
                                  <div className='flex flex-col items-stretch gap-1'>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='h-7 w-full gap-1.5 text-[11px]'
                                      disabled={row.order_id == null}
                                      onClick={() => setUploadRow(row)}
                                    >
                                      <UploadCloudIcon className='h-3.5 w-3.5' />
                                      Tải lên
                                    </Button>
                                    <div className='flex items-center justify-center gap-1 text-[10px] tabular-nums'>
                                      <span
                                        title='Đã duyệt'
                                        className='flex items-center gap-0.5 rounded bg-green-50 px-1 text-green-700'
                                      >
                                        <CheckCircle2Icon className='h-3 w-3' />
                                        {fc.approved}
                                      </span>
                                      <span
                                        title='Chờ duyệt'
                                        className='flex items-center gap-0.5 rounded bg-amber-50 px-1 text-amber-700'
                                      >
                                        <ClockIcon className='h-3 w-3' />
                                        {fc.pending}
                                      </span>
                                      <span
                                        title='Từ chối'
                                        className='flex items-center gap-0.5 rounded bg-red-50 px-1 text-red-700'
                                      >
                                        <XCircleIcon className='h-3 w-3' />
                                        {fc.rejected}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
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
                      <td
                        colSpan={INFO_COL_COUNT}
                        className='sticky left-0 z-10 border-x border-border bg-muted px-2 py-2 text-xs'
                      >
                        Tổng ({filteredRows.length} container)
                      </td>
                      <td
                        colSpan={6}
                        className=' left-0 z-10 border-x border-border bg-muted px-2 py-2 text-xs'
                      >
                        
                      </td>
                      {visibleMoneyCols.map((col) => (
                        <td
                          key={col as string}
                          className='border-r border-border px-2 py-2 text-right text-xs tabular-nums text-primary'
                        >
                          {formatVND(totals[col as string])}
                        </td>
                      ))}
                      {showChiHo && (
                        <>
                          <td className='border-r border-border' />
                          <td className='border-r border-border' />
                        </>
                      )}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
        )}
      </div>

      {confirmModalOpen && (
        <ConfirmChangesModal
          changes={dirtyChanges}
          reasonMap={reasonMap}
          onReasonChange={handleReasonChange}
          onResetReason={handleResetReason}
          onClose={() => {
            if (createMutation.isLoading) return;
            setConfirmModalOpen(false);
          }}
          onConfirm={handleSubmitChanges}
          submitting={createMutation.isLoading}
        />
      )}

      {uploadRow && uploadRow.order_id != null && (
        <ChiHoUploadModal
          orderId={uploadRow.order_id}
          orderCode={uploadRow.ma_don_hang}
          containerNo={uploadRow.so_cont}
          bookingBillNumber={uploadRow.so_bill_booking}
          onClose={() => setUploadRow(null)}
          onUploaded={(added) =>
            setPendingDelta((prev) => ({
              ...prev,
              [uploadRow.order_id as number]:
                (prev[uploadRow.order_id as number] ?? 0) + added,
            }))
          }
        />
      )}
    </>
  );
};

export default KeCuocChiHoTable;
