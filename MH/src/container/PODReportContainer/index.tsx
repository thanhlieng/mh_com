/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DatePicker, notification, Select, Spin, Table } from 'antd';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_PARAMS } from '@/contants/common.constants';

import ItemControlTableRender from '@/components/TableCustom';
import { getPODReport } from '@/services/assign.services';
import {
  fetchServicePartnerService,
  generateDowloadList,
} from '@/services/booking.services';
import { DownloadOutlined } from '@ant-design/icons';
import { POD_REPORT_COLUMNS } from './columns';

const { Option } = Select;
const { RangePicker } = DatePicker;

const select = [
  {
    keyMap: 'reportForEmployee',
    label: 'BC chi tiết DT theo nhân viên',
    permission: 'statistical_by_staff',
  },
];

const PODReportContainer = () => {
  const [queriesGet, setQueriesGet] = useState<{
    from?: string | Date;
    to?: string | Date;
    ServiceID?: string;
    page: number;
    pageSize: number;
    search: string;
  }>({
    page: 1,
    pageSize: 20,
    search: '',
  });

  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const { data: PartnerServices } = useQuery(
    ['fetchServicePartnerService'],
    () => fetchServicePartnerService()
  );

  const OpitionPartServices = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (PartnerServices?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return PartnerServices?.map((v) => ({
        value: v.id,
        label: v.name,
      }));
    }
  }, [PartnerServices]);

  const { data, isLoading } = useQuery([queriesGet], () =>
    getPODReport(queriesGet)
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

  const exportPODReportFile = () => {
    getDowloadList({
      endpoint: 'connect-bill/export-analytic-pod',
      params: queriesGet,
    });
  };

  const handleChangeDateFilter = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      from: moment(value?.[0]).format('YYYY-MM-DD'),
      to: moment(value?.[1]).format('YYYY-MM-DD'),
    }));
  };

  const handleChangeService = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      ServiceID: value,
    }));
  };

  const handlePagination = (pagination: { current?: number }) => {
    setQueriesGet((prev) => ({
      ...prev,
      page: pagination.current || 1,
    }));
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-row flex-wrap gap-4'>
        <Select
          placeholder='Chọn dịch vụ'
          className='w-[250px]'
          onChange={handleChangeService}
          filterOption={(input, option) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          showArrow
          showSearch
          allowClear
        >
          {OpitionPartServices?.map((v: any) => (
            <Option key={v.value} value={v.value}>
              {v.label}
            </Option>
          ))}
        </Select>

        <RangePicker
          format='DD-MM-YYYY'
          onChange={handleChangeDateFilter}
          className='h-8 w-[300px]'
          placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
        />
        <Spin spinning={exportLoading}>
          <Button
            type='primary'
            onClick={exportPODReportFile}
            icon={<DownloadOutlined />}
          >
            Xuất báo cáo
          </Button>
        </Spin>
      </div>

      <div>
        <Table
          rowKey={(row) => row.booking_code}
          columns={POD_REPORT_COLUMNS}
          dataSource={data?.data ? data.data : []}
          onChange={handlePagination}
          pagination={{
            current: data?.pagination?.currentPage,
            total: data?.pagination?.totalCount,
            pageSize: data?.pagination?.pageSize,
            showSizeChanger: false,
            defaultPageSize: QUERY_PARAMS.pageSize,
            itemRender: ItemControlTableRender,
          }}
          loading={isLoading}
          scroll={{ y: 600, x: 600 }}
        />
      </div>
    </div>
  );
};

export default PODReportContainer;
