/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification, Popconfirm, Select, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { Button } from '@/components/ui/button';

import { withPrivateRouteSupplier } from '@/routes/withPrivateRouteSupplier';
import {
  deleteSupplierPriceChange,
  getSupplierPriceChanges,
} from '@/services/supplier.services';
import type { SupplierPriceChange } from '@/services/supplier.services';

import {
  CHANGE_TYPE_COLOR,
  CHANGE_TYPE_LABEL,
  SOURCE_LABEL,
  STATUS_COLOR,
  STATUS_FILTER_OPTIONS,
  STATUS_LABEL,
} from './types';

const formatVND = (n: number | string | null | undefined) => {
  const num = n == null || n === '' ? null : Number(n);
  return num == null || Number.isNaN(num)
    ? '-'
    : num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const SupplierPriceChangeContainer = () => {
  const [status, setStatus] = React.useState<string>('');
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery(
    ['supplier-price-changes', status],
    () => getSupplierPriceChanges(status || undefined),
    {
      keepPreviousData: true,
      retry: false,
      onError: (e: any) => {
        notification.error({
          message: e?.response?.data?.message
            ? `${e.response.data.message}`
            : 'Tải danh sách yêu cầu thay đổi giá thất bại',
          placement: 'top',
        });
      },
    },
  );

  const deleteMutation = useMutation(deleteSupplierPriceChange, {
    onSuccess: () => {
      queryClient.invalidateQueries('supplier-price-changes');
      notification.success({ message: 'Đã xóa yêu cầu', placement: 'top' });
    },
    onError: (e: any) => {
      notification.error({
        message:
          e?.response?.data?.message ||
          e?.response?.data?.detail ||
          'Xóa yêu cầu thất bại',
        placement: 'top',
      });
    },
  });

  const columns: ColumnsType<SupplierPriceChange> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_v, _r, i) => i + 1,
    },
    {
      title: 'Loại',
      dataIndex: 'change_type',
      key: 'change_type',
      width: 110,
      render: (v: SupplierPriceChange['change_type']) => (
        <Tag color={CHANGE_TYPE_COLOR[v]}>{CHANGE_TYPE_LABEL[v] ?? v}</Tag>
      ),
    },
    {
      title: 'Tuyến / Dịch vụ',
      dataIndex: 'label',
      key: 'label',
      render: (v: string | null) => v || '-',
    },
    {
      title: 'Giá cũ → Giá mới',
      key: 'amount',
      width: 240,
      render: (_v, r) => (
        <span className='tabular-nums'>
          <span className='text-muted-foreground'>{formatVND(r.old_amount)}</span>
          {' → '}
          <span className='font-semibold'>{formatVND(r.new_amount)}</span>
        </span>
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (v: SupplierPriceChange['source']) => SOURCE_LABEL[v] ?? v,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: SupplierPriceChange['status']) => (
        <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v] ?? v}</Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Người duyệt',
      dataIndex: 'approved_by',
      key: 'approved_by',
      width: 130,
      render: (v: string | null) => v || '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 110,
      align: 'center',
      render: (_v, r) =>
        r.status === 'PENDING' ? (
          <Popconfirm
            title='Xóa yêu cầu này?'
            okText='Xóa'
            cancelText='Hủy'
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteMutation.mutate(r.id)}
          >
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs text-red-600 hover:text-red-700'
            >
              Xóa
            </Button>
          </Popconfirm>
        ) : (
          <span className='text-muted-foreground'>-</span>
        ),
    },
  ];

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      {/* ── Page header + filter ── */}
      <div className='flex shrink-0 flex-col gap-2 border-b border-border px-4 py-2 md:h-14 md:flex-row md:flex-wrap md:items-center md:gap-3 md:px-6 md:py-0'>
        <h1 className='text-sm font-semibold'>Yêu cầu thay đổi giá</h1>
        <div className='flex items-center gap-2 md:ml-auto'>
          <span className='text-xs text-muted-foreground'>Trạng thái</span>
          <Select
            size='small'
            value={status}
            style={{ width: 140 }}
            options={STATUS_FILTER_OPTIONS}
            onChange={(v) => setStatus(v)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className='flex-1 overflow-auto px-4 py-4 md:px-6'>
        <Spin spinning={isFetching}>
          <Table<SupplierPriceChange>
            rowKey='id'
            size='small'
            columns={columns}
            dataSource={data?.results ?? []}
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'Chưa có yêu cầu thay đổi giá' }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default withPrivateRouteSupplier(SupplierPriceChangeContainer);
