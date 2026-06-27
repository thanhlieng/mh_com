/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker, Pagination, notification } from 'antd';
import dayjs from 'dayjs';
import {
  CheckCircle2Icon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useQualityReportSeenBaseline } from '@/hook/useQualityReportNewMarker';

import {
  changeQualityReportStatus,
  deleteQualityReport,
  listQualityReports,
  type QualityReport,
  type QualityReportTab,
} from '@/services/supplier.services';

import QualityReportDetailModal from './QualityReportDetailModal';
import QualityReportFormModal from './QualityReportFormModal';
import {
  DEFAULT_FILTERS,
  SEVERITY_OPTIONS,
  STATUS_OPTIONS,
  severityLabel,
  severityVariant,
  statusLabel,
  statusVariant,
  type FilterState,
} from './types';

interface Props {
  tab: QualityReportTab;
}

const fmtDate = (s: string | null) =>
  s ? dayjs(s).format('DD/MM/YYYY HH:mm') : '—';

const COLUMN_COUNT = 14;

const QualityReportsTable: React.FC<Props> = ({ tab }) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<FilterState>(DEFAULT_FILTERS);
  // Đánh dấu báo cáo mới (source=mhvn, created_at > lastSeen). Tự cập nhật
  // lastSeen = now khi mount để dot ở sidebar tắt.
  const { isNew } = useQualityReportSeenBaseline();
  const [openModal, setOpenModal] = React.useState(false);
  const [editing, setEditing] = React.useState<QualityReport | null>(null);
  const [viewing, setViewing] = React.useState<QualityReport | null>(null);

  const listQuery = useQuery(
    ['quality-reports', tab, filters],
    () =>
      listQualityReports({
        tab,
        page: filters.page,
        page_size: filters.page_size,
        from: filters.from,
        to: filters.to,
        status: filters.status,
        severity: filters.severity,
      }),
    {
      keepPreviousData: true,
      onError: (e: any) => {
        notification.error({
          message:
            e?.response?.data?.message ||
            e?.response?.data?.detail ||
            'Tải danh sách báo cáo thất bại',
          placement: 'top',
        });
      },
    },
  );

  const deleteMut = useMutation((id: number) => deleteQualityReport(id), {
    onSuccess: () => {
      notification.success({ message: 'Đã xóa báo cáo', placement: 'top' });
      queryClient.invalidateQueries(['quality-reports']);
    },
    onError: (e: any) => {
      notification.error({
        message:
          e?.response?.data?.message ||
          e?.response?.data?.detail ||
          'Xóa thất bại',
        placement: 'top',
      });
    },
  });

  const statusMut = useMutation(
    (p: { id: number; status: 'received' | 'processed' | 'rejected' }) =>
      changeQualityReportStatus(p.id, p.status),
    {
      onSuccess: () => {
        notification.success({
          message: 'Đã cập nhật trạng thái',
          placement: 'top',
        });
        queryClient.invalidateQueries(['quality-reports']);
      },
      onError: (e: any) => {
        notification.error({
          message:
            e?.response?.data?.message ||
            e?.response?.data?.detail ||
            'Cập nhật trạng thái thất bại',
          placement: 'top',
        });
      },
    },
  );

  const setFilter = (patch: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));

  const selectedStatuses = filters.status
    ? new Set(filters.status.split(','))
    : new Set<string>();
  const toggleStatus = (v: string) => {
    const next = new Set(selectedStatuses);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setFilter({
      status: next.size ? Array.from(next).join(',') : undefined,
    });
  };

  const selectedSeverities = filters.severity
    ? new Set(filters.severity.split(','))
    : new Set<string>();
  const toggleSeverity = (v: string) => {
    const next = new Set(selectedSeverities);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setFilter({
      severity: next.size ? Array.from(next).join(',') : undefined,
    });
  };

  const handleDelete = (row: QualityReport) => {
    if (window.confirm('Xóa báo cáo này?')) deleteMut.mutate(row.id);
  };

  const rows = listQuery.data?.results ?? [];
  const total = listQuery.data?.total ?? 0;
  const baseIndex = (filters.page - 1) * filters.page_size;

  const renderActions = (row: QualityReport) => {
    // Nút "Xem chi tiết" luôn hiển thị (mọi tab, mọi trạng thái).
    const viewBtn = (
      <Button
        variant='outline'
        size='sm'
        className='h-7 gap-1.5 text-xs'
        onClick={() => setViewing(row)}
      >
        <EyeIcon className='h-3.5 w-3.5' />
        Xem
      </Button>
    );

    if (tab === 'sent') {
      // Tab "Báo cáo đã gửi" (NCC tạo): chỉ sửa/xóa khi can_edit.
      return (
        <div className='flex flex-wrap items-center gap-1.5'>
          {viewBtn}
          {row.can_edit && (
            <>
              <Button
                variant='outline'
                size='sm'
                className='h-7 gap-1.5 text-xs'
                onClick={() => {
                  setEditing(row);
                  setOpenModal(true);
                }}
              >
                <PencilIcon className='h-3.5 w-3.5' />
                Sửa
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-7 gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700'
                onClick={() => handleDelete(row)}
                disabled={deleteMut.isLoading}
              >
                <Trash2Icon className='h-3.5 w-3.5' />
                Xóa
              </Button>
            </>
          )}
        </div>
      );
    }

    // Tab "Báo cáo đã nhận" (MHVN/GP tạo cho NCC):
    //   notified → Tiếp nhận / Đã xử lý / Từ chối
    //   received → Đã xử lý / Từ chối
    //   processed / rejected → chỉ Xem
    const canReceive = row.trang_thai === 'notified';
    const canFinalize =
      row.trang_thai === 'notified' || row.trang_thai === 'received';

    return (
      <div className='flex flex-wrap items-center gap-1.5'>
        {viewBtn}
        {canReceive && (
          <Button
            variant='outline'
            size='sm'
            className='h-7 gap-1.5 text-xs'
            onClick={() => statusMut.mutate({ id: row.id, status: 'received' })}
            disabled={statusMut.isLoading}
          >
            Tiếp nhận
          </Button>
        )}
        {canFinalize && (
          <>
            <Button
              size='sm'
              className='h-7 gap-1.5 text-xs'
              onClick={() => {
                if (window.confirm('Xác nhận đã xử lý?'))
                  statusMut.mutate({ id: row.id, status: 'processed' });
              }}
              disabled={statusMut.isLoading}
            >
              <CheckCircle2Icon className='h-3.5 w-3.5' />
              Đã xử lý
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-7 gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700'
              onClick={() => {
                if (window.confirm('Từ chối xử lý báo cáo này?'))
                  statusMut.mutate({ id: row.id, status: 'rejected' });
              }}
              disabled={statusMut.isLoading}
            >
              <XCircleIcon className='h-3.5 w-3.5' />
              Từ chối
            </Button>
          </>
        )}
      </div>
    );
  };

  const clamp2Line: React.CSSProperties = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  return (
    <div className='space-y-3'>
      {/* ── Filter bar ── */}
      <div className='rounded-md border border-border bg-muted/20 px-3 py-3'>
        <div className='flex flex-wrap items-end gap-3'>
          <div>
            <div className='mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
              Ngày phát sinh
            </div>
            <DatePicker.RangePicker
              allowClear
              format='DD/MM/YYYY'
              value={
                [
                  filters.from ? dayjs(filters.from) : null,
                  filters.to ? dayjs(filters.to) : null,
                ] as any
              }
              onChange={(range: any) =>
                setFilter({
                  from: range?.[0]?.startOf('day').toISOString(),
                  to: range?.[1]?.endOf('day').toISOString(),
                })
              }
            />
          </div>

          <div>
            <div className='mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
              Trạng thái
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              <button
                type='button'
                onClick={() => setFilter({ status: undefined })}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                  selectedStatuses.size === 0
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent',
                )}
              >
                Tất cả
              </button>
              {STATUS_OPTIONS.map((opt) => {
                const active = selectedStatuses.has(opt.value);
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => toggleStatus(opt.value)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className='mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
              Mức độ
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              <button
                type='button'
                onClick={() => setFilter({ severity: undefined })}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                  selectedSeverities.size === 0
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent',
                )}
              >
                Tất cả
              </button>
              {SEVERITY_OPTIONS.map((opt) => {
                const active = selectedSeverities.has(opt.value);
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => toggleSeverity(opt.value)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className='ml-auto flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={() => listQuery.refetch()}
              disabled={listQuery.isFetching}
              title='Tải lại'
            >
              <RefreshCwIcon
                className={cn(
                  'h-3.5 w-3.5',
                  listQuery.isFetching && 'animate-spin',
                )}
              />
              Tải lại
            </Button>
            {tab === 'sent' && (
              <Button
                size='sm'
                className='h-8 gap-1.5 text-xs'
                onClick={() => {
                  setEditing(null);
                  setOpenModal(true);
                }}
              >
                <PlusIcon className='h-3.5 w-3.5' />
                Gửi báo cáo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table area ── */}
      <div className='max-w-full'>
        <div className='max-w-full overflow-x-auto rounded-md border border-border'>
          <table className='w-full min-w-[2400px] border-collapse text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted/40 text-left'>
                <th className='w-12 px-3 py-2 text-xs font-semibold'>STT</th>
                <th className='px-3 py-2 text-xs font-semibold'>
                  Ngày phát sinh
                </th>
                <th className='px-3 py-2 text-xs font-semibold'>Khách hàng</th>
                <th className='px-3 py-2 text-xs font-semibold'>Mô tả lỗi</th>
                <th className='px-3 py-2 text-xs font-semibold'>
                  Ảnh hưởng cụ thể
                </th>
                <th className='px-3 py-2 text-xs font-semibold'>Mức độ</th>
                <th className='px-3 py-2 text-xs font-semibold'>
                  Nguyên nhân gốc rễ
                </th>
                <th className='px-3 py-2 text-xs font-semibold'>
                  Biện pháp khắc phục
                </th>
                <th className='px-3 py-2 text-xs font-semibold'>
                  Biện pháp phòng ngừa
                </th>
                <th className='px-3 py-2 text-xs font-semibold'>
                  Deadline xử lý
                </th>
                <th className='px-3 py-2 text-xs font-semibold'>Trạng thái</th>
                <th className='px-3 py-2 text-xs font-semibold'>
                  Ngày hoàn thành
                </th>
                <th className='px-3 py-2 text-xs font-semibold'>Ghi chú</th>
                <th className='sticky right-0 z-20 min-w-[260px] border-l border-border bg-muted px-3 py-2 text-xs font-semibold shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]'>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isFetching && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMN_COUNT}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMN_COUNT}
                    className='py-16 text-center text-xs text-muted-foreground'
                  >
                    Chưa có báo cáo nào
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'group border-b border-border transition-colors hover:bg-accent/40',
                      i % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                    )}
                  >
                    <td className='px-3 py-2 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1.5'>
                        {isNew(row) && (
                          <span
                            aria-label='Báo cáo mới chưa xem'
                            className='h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500'
                          />
                        )}
                        <span>{baseIndex + i + 1}</span>
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-3 py-2 text-xs tabular-nums text-foreground'>
                      <div className='flex items-center gap-2'>
                        <span>{fmtDate(row.ngay_phat_sinh)}</span>
                        {isNew(row) && (
                          <Badge
                            variant='destructive'
                            className='h-4 px-1.5 text-[10px] font-bold uppercase tracking-wider'
                          >
                            Mới
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className='px-3 py-2 text-xs font-medium text-foreground'>
                      {row.khach_hang || '—'}
                    </td>
                    <td className='px-3 py-2 align-top text-xs text-foreground'>
                      {row.mo_ta_loi ? (
                        <span
                          title={row.mo_ta_loi}
                          className='block max-w-[360px]'
                          style={clamp2Line}
                        >
                          {row.mo_ta_loi}
                        </span>
                      ) : (
                        <span className='italic text-muted-foreground/60'>
                          —
                        </span>
                      )}
                    </td>
                    <td className='px-3 py-2 align-top text-xs text-foreground'>
                      {row.anh_huong_cu_the ? (
                        <span
                          title={row.anh_huong_cu_the}
                          className='block max-w-[320px]'
                          style={clamp2Line}
                        >
                          {row.anh_huong_cu_the}
                        </span>
                      ) : (
                        <span className='italic text-muted-foreground/60'>
                          —
                        </span>
                      )}
                    </td>
                    <td className='px-3 py-2 text-xs'>
                      <Badge variant={severityVariant(row.muc_do)}>
                        {severityLabel(row.muc_do)}
                      </Badge>
                    </td>
                    <td className='px-3 py-2 align-top text-xs text-foreground'>
                      {row.nguyen_nhan_goc_re ? (
                        <span
                          title={row.nguyen_nhan_goc_re}
                          className='block max-w-[320px]'
                          style={clamp2Line}
                        >
                          {row.nguyen_nhan_goc_re}
                        </span>
                      ) : (
                        <span className='italic text-muted-foreground/60'>
                          —
                        </span>
                      )}
                    </td>
                    <td className='px-3 py-2 align-top text-xs text-foreground'>
                      {row.bien_phap_khac_phuc ? (
                        <span
                          title={row.bien_phap_khac_phuc}
                          className='block max-w-[320px]'
                          style={clamp2Line}
                        >
                          {row.bien_phap_khac_phuc}
                        </span>
                      ) : (
                        <span className='italic text-muted-foreground/60'>
                          —
                        </span>
                      )}
                    </td>
                    <td className='px-3 py-2 align-top text-xs text-foreground'>
                      {row.bien_phap_phong_ngua ? (
                        <span
                          title={row.bien_phap_phong_ngua}
                          className='block max-w-[320px]'
                          style={clamp2Line}
                        >
                          {row.bien_phap_phong_ngua}
                        </span>
                      ) : (
                        <span className='italic text-muted-foreground/60'>
                          —
                        </span>
                      )}
                    </td>
                    <td className='whitespace-nowrap px-3 py-2 text-xs tabular-nums text-muted-foreground'>
                      {fmtDate(row.deadline_xu_ly)}
                    </td>
                    <td className='px-3 py-2 text-xs'>
                      <Badge variant={statusVariant(row.trang_thai)}>
                        {statusLabel(row.trang_thai)}
                      </Badge>
                    </td>
                    <td className='whitespace-nowrap px-3 py-2 text-xs tabular-nums text-muted-foreground'>
                      {fmtDate(row.ngay_hoan_thanh)}
                    </td>
                    <td className='px-3 py-2 align-top text-xs text-foreground'>
                      {row.ghi_chu ? (
                        <span
                          title={row.ghi_chu}
                          className='block max-w-[280px]'
                          style={clamp2Line}
                        >
                          {row.ghi_chu}
                        </span>
                      ) : (
                        <span className='italic text-muted-foreground/60'>
                          —
                        </span>
                      )}
                    </td>
                    <td
                      className='sticky right-0 z-10 border-l border-border bg-background px-3 py-2 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)] transition-colors group-hover:bg-accent'
                    >
                      {renderActions(row)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className='mt-4 flex justify-end'>
            <Pagination
              size='small'
              current={filters.page}
              pageSize={filters.page_size}
              total={total}
              showSizeChanger
              pageSizeOptions={['10', '20', '50', '100']}
              onChange={(page, page_size) =>
                setFilters((prev) => ({ ...prev, page, page_size }))
              }
            />
          </div>
        )}
      </div>

      <QualityReportFormModal
        open={openModal}
        editing={editing}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
      />

      <QualityReportDetailModal
        open={!!viewing}
        report={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
};

export default QualityReportsTable;
