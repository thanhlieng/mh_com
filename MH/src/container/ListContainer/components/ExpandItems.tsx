/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, notification, Spin, Table } from 'antd';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { DETAILS_LIST_COLUMNS_CARGO_LIST } from '@/contants/columns/list.columns';
import { getListDetails, listSendViaEmail } from '@/services/list.services';

import { GET_LIST } from '..';

const ExpandItem = ({
  id,
  year,
  month,
  from,
  to,
  onSelectChange,
  selectedRowKeys,
  currency,
}: {
  id: string;
  year?: string;
  month?: string;
  from?: string;
  to?: string;
  selectedRowKeys: any;
  onSelectChange: (data: any) => void;
  currency: 'VND' | 'USD';
}) => {
  const [queries, setQueries] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: 10,
  });
  const { data, isLoading, isError } = useQuery([id, queries], () =>
    getListDetails({ params: { customerId: id, from, to } })
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const queryClient = useQueryClient();

  const { mutate } = useMutation(listSendViaEmail, {
    onSuccess: () => {
      queryClient.invalidateQueries([id]);
      notification.success({
        message: 'Gửi bảng kê thành công',
        placement: 'top',
      });
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data ? e.response.data.message : 'Gửi bảng kê thất bạị'
        }`,
        placement: 'top',
      });
    },
  });

  const hanldeClick = () => {
    mutate({
      params: {
        ids: selectedRowKeys,
        customerId: id,
        month,
        year,
        from,
        to,
        currency,
      },
    });
  };

  return (
    <div className='flex flex-col gap-4'>
      <Button
        type='primary'
        className='max-w-[150px]'
        disabled={selectedRowKeys.length <= 0}
        onClick={hanldeClick}
      >
        Gửi bảng kê
      </Button>
      <Spin spinning={isLoading}>
        <Table
          loading={isLoading}
          columns={DETAILS_LIST_COLUMNS_CARGO_LIST[currency]}
          className='cursor-pointer rounded-[10px]'
          dataSource={data}
          pagination={false}
          rowSelection={rowSelection}
          rowKey={(record) => record.id}
          bordered
          scroll={{ y: 550, x: 600 }}
        />
      </Spin>
    </div>
  );
};

export default ExpandItem;
