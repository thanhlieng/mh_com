/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DatePicker, notification, Select, Spin, Table } from 'antd';
import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_PARAMS } from '@/contants/common.constants';

import ItemControlTableRender from '@/components/TableCustom';
import {
  getStatisticalRevenueCustomerReport,
  updateOrderRemainingService,
} from '@/services/assign.services';
import { generateDowloadList } from '@/services/booking.services';
import { DownloadOutlined } from '@ant-design/icons';
import { STATISTICAL_CUSTOMER_REPORT_COLUMNS } from './columns';
import moment from 'moment';

const { Option } = Select;

const StatisticalRevenueCustomerReportContainer = () => {
  const [queriesGet, setQueriesGet] = useState<{
    year?: string;
    month?: string;
    typeStatistical?: string;
    page: number;
    pageSize: number;
    search: string;
  }>({
    year: moment().format('YYYY'),
    month: moment().format('MM'),
    page: 1,
    pageSize: 20,
    search: '',
  });

  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const optionsTypeStatistical = [
    {
      value: 'CUSTOMERS_NOT_ENTER_NETWORK',
      label: 'Khách hàng không vào mạng',
    },
    {
      value: 'CUSTOMERS_SEND_REDUCTION',
      label: 'Khách hàng gửi giảm',
    },
    {
      value: 'CUSTOMERS_SEND_INCREASE',
      label: 'Khách hàng gửi tăng',
    },
  ];

  const { data, isLoading } = useQuery(['GET_DATA', queriesGet], () =>
    getStatisticalRevenueCustomerReport(queriesGet)
  );

  const queryClient = useQueryClient();
  const { mutate: getDowloadList } = useMutation(generateDowloadList, {
    onSuccess: () => {
      queryClient.invalidateQueries([]);
      notification.success({
        message: 'Tải xuống thành công',
        placement: 'top',
      });
    },
    onError: () => {
      notification.error({
        message: 'Tải xuống thất bại',
        placement: 'top',
      });
    },
  });

  const { mutate: updateOrderRemaining } = useMutation(
    updateOrderRemainingService,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['GET_DATA']);
        notification.success({
          message: 'Cập nhật thành công',
          placement: 'top',
        });
      },
      onError: (e: any) => {
        notification.error({
          message: `${
            e.response.data ? e.response.data.message : 'Cập nhật thất bại'
          }`,
          placement: 'top',
        });
      },
    }
  );

  const exportReportFile = () => {
    setExportLoading(true);
    getDowloadList({
      endpoint: 'finance-statistical/export-statistical-revenue-customer',
      params: queriesGet,
    });
    setExportLoading(false);
  };

  const handleChangeTypeStatistical = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      typeStatistical: value,
    }));
  };

  const handlePagination = (pagination: { current?: number }) => {
    setQueriesGet((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };

  const handleSave = (row: any) => {
    if (row.id) {
      updateOrderRemaining({
        id: row.id,
        data: {
          note: row.note,
        },
      });
    }
  };

  const handleChangeDateFilter = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      from: moment(value?.[0]).format('YYYY-MM-DD'),
      to: moment(value?.[1]).format('YYYY-MM-DD'),
    }));
  };

  const handleMonthChange = (date: moment.Moment | null) => {
    setQueriesGet((prev) => ({
      ...prev,
      month: date ? date.format('MM') : undefined,
      year: date ? date.format('YYYY') : undefined,
    }));
  };

  const disabledDate = (current: moment.Moment) => {
    return current && current.year() > moment().year();
  };

  const columns = STATISTICAL_CUSTOMER_REPORT_COLUMNS.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => {
        return {
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
        };
      },
    };
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-row flex-wrap gap-4'>
        <DatePicker
          picker='month'
          defaultValue={moment(new Date(), 'YYYY-MM')}
          onChange={handleMonthChange}
          style={{ marginRight: 16 }}
        />
        <Select
          placeholder='Chọn loại khách hàng'
          className='w-[250px]'
          onChange={handleChangeTypeStatistical}
          filterOption={(input, option) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          showArrow
          showSearch
          allowClear
        >
          {optionsTypeStatistical?.map((v: any) => (
            <Option key={v.value} value={v.value}>
              {v.label}
            </Option>
          ))}
        </Select>

        <Spin spinning={exportLoading}>
          <Button
            type='primary'
            onClick={exportReportFile}
            icon={<DownloadOutlined />}
          >
            Xuất báo cáo
          </Button>
        </Spin>
      </div>

      <div>
        <Table
          dataSource={data?.data}
          columns={columns}
          rowKey={(e) => e.id}
          bordered
          onChange={handlePagination}
          scroll={{ y: 600, x: 600 }}
          rowClassName={() => 'editable-row'}
          pagination={{
            current: data?.pagination?.currentPage,
            total: data?.pagination?.totalCount,
            pageSize: data?.pagination?.pageSize,
            showSizeChanger: false,
            defaultPageSize: QUERY_PARAMS.pageSize,
            itemRender: ItemControlTableRender,
          }}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default StatisticalRevenueCustomerReportContainer;
