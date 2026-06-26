/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  DatePicker,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  notification,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import {
  changeQualityReportStatus,
  deleteQualityReport,
  listQualityReports,
  type QualityReport,
  type QualityReportTab,
} from '@/services/supplier.services';

import QualityReportFormModal from './QualityReportFormModal';
import {
  DEFAULT_FILTERS,
  SEVERITY_OPTIONS,
  STATUS_OPTIONS,
  severityColor,
  severityLabel,
  statusColor,
  statusLabel,
  type FilterState,
} from './types';

interface Props {
  tab: QualityReportTab;
}

const fmtDate = (s: string | null) =>
  s ? dayjs(s).format('DD/MM/YYYY HH:mm') : '—';

const QualityReportsTable: React.FC<Props> = ({ tab }) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<FilterState>(DEFAULT_FILTERS);
  const [openModal, setOpenModal] = React.useState(false);
  const [editing, setEditing] = React.useState<QualityReport | null>(null);

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

  const deleteMut = useMutation(
    (id: number) => deleteQualityReport(id),
    {
      onSuccess: () => {
        notification.success({
          message: 'Đã xóa báo cáo',
          placement: 'top',
        });
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
    },
  );

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

  const columns: ColumnsType<QualityReport> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_v, _r, idx) =>
        (filters.page - 1) * filters.page_size + idx + 1,
    },
    {
      title: 'Ngày phát sinh',
      dataIndex: 'ngay_phat_sinh',
      width: 140,
      render: (v) => fmtDate(v),
    },
    { title: 'Khách hàng', dataIndex: 'khach_hang', width: 180 },
    {
      title: 'Mô tả lỗi',
      dataIndex: 'mo_ta_loi',
      ellipsis: true,
      width: 220,
    },
    {
      title: 'Ảnh hưởng cụ thể',
      dataIndex: 'anh_huong_cu_the',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Mức độ',
      dataIndex: 'muc_do',
      width: 130,
      render: (v) => <Tag color={severityColor(v)}>{severityLabel(v)}</Tag>,
    },
    {
      title: 'Nguyên nhân gốc rễ',
      dataIndex: 'nguyen_nhan_goc_re',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Biện pháp khắc phục',
      dataIndex: 'bien_phap_khac_phuc',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Biện pháp phòng ngừa',
      dataIndex: 'bien_phap_phong_ngua',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Deadline xử lý',
      dataIndex: 'deadline_xu_ly',
      width: 140,
      render: (v) => fmtDate(v),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      width: 140,
      render: (v) => <Tag color={statusColor(v)}>{statusLabel(v)}</Tag>,
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'ngay_hoan_thanh',
      width: 140,
      render: (v) => fmtDate(v),
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', ellipsis: true, width: 160 },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_v, row) => {
        // Tab "sent" (NCC tạo): chỉ sửa/xóa khi can_edit
        if (tab === 'sent') {
          if (!row.can_edit) return <span className='text-muted-foreground'>—</span>;
          return (
            <Space size='small'>
              <Button
                size='small'
                onClick={() => {
                  setEditing(row);
                  setOpenModal(true);
                }}
              >
                Sửa
              </Button>
              <Popconfirm
                title='Xóa báo cáo?'
                onConfirm={() => deleteMut.mutate(row.id)}
                okText='Xóa'
                cancelText='Hủy'
              >
                <Button size='small' danger>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          );
        }
        // Tab "received" (MHVN tạo cho NCC): NCC chỉ có thể chuyển trạng thái
        // khi báo cáo đang ở 'notified' (mặc định khi MHVN tạo).
        if (row.trang_thai !== 'notified') {
          return <span className='text-muted-foreground'>—</span>;
        }
        return (
          <Space size='small' wrap>
            <Button
              size='small'
              onClick={() =>
                statusMut.mutate({ id: row.id, status: 'received' })
              }
            >
              Tiếp nhận
            </Button>
            <Popconfirm
              title='Xác nhận đã xử lý?'
              onConfirm={() =>
                statusMut.mutate({ id: row.id, status: 'processed' })
              }
            >
              <Button size='small' type='primary'>
                Đã xử lý
              </Button>
            </Popconfirm>
            <Popconfirm
              title='Từ chối xử lý?'
              onConfirm={() =>
                statusMut.mutate({ id: row.id, status: 'rejected' })
              }
            >
              <Button size='small' danger>
                Từ chối
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const setFilter = (patch: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-end gap-2'>
        <div>
          <div className='mb-1 text-xs text-muted-foreground'>
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
          <div className='mb-1 text-xs text-muted-foreground'>Trạng thái</div>
          <Select
            allowClear
            mode='multiple'
            style={{ minWidth: 220 }}
            placeholder='Tất cả'
            options={STATUS_OPTIONS}
            value={
              filters.status ? (filters.status.split(',') as any) : undefined
            }
            onChange={(vals: string[]) =>
              setFilter({
                status: vals && vals.length ? vals.join(',') : undefined,
              })
            }
          />
        </div>
        <div>
          <div className='mb-1 text-xs text-muted-foreground'>
            Mức độ ảnh hưởng
          </div>
          <Select
            allowClear
            mode='multiple'
            style={{ minWidth: 200 }}
            placeholder='Tất cả'
            options={SEVERITY_OPTIONS}
            value={
              filters.severity
                ? (filters.severity.split(',') as any)
                : undefined
            }
            onChange={(vals: string[]) =>
              setFilter({
                severity: vals && vals.length ? vals.join(',') : undefined,
              })
            }
          />
        </div>
        <div className='ml-auto'>
          {tab === 'sent' && (
            <Button
              type='primary'
              onClick={() => {
                setEditing(null);
                setOpenModal(true);
              }}
            >
              + Gửi báo cáo
            </Button>
          )}
        </div>
      </div>

      <Table<QualityReport>
        rowKey='id'
        size='small'
        loading={listQuery.isFetching}
        dataSource={listQuery.data?.results ?? []}
        columns={columns}
        scroll={{ x: 1800 }}
        pagination={{
          current: filters.page,
          pageSize: filters.page_size,
          total: listQuery.data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, page_size) =>
            setFilters((prev) => ({ ...prev, page, page_size })),
        }}
      />

      <QualityReportFormModal
        open={openModal}
        editing={editing}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
      />
    </div>
  );
};

export default QualityReportsTable;
