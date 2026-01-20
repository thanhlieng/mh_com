/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  notification,
  Select,
  Spin,
  Table,
} from 'antd';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_PARAMS } from '@/contants/common.constants';

import ItemControlTableRender from '@/components/TableCustom';
import {
  getStatisticalCustomerReport,
  updateOrderRemainingService,
} from '@/services/assign.services';
import { generateDowloadList } from '@/services/booking.services';
import { DownloadOutlined } from '@ant-design/icons';
import { STATISTICAL_CUSTOMER_REPORT_COLUMNS } from './columns';
import moment from 'moment';
import { fetchCustomer, getStaff } from '@/services/customer.services';
import { formatNumberWithCommas } from '@/utils/ultils';
const { RangePicker } = DatePicker;

const { Option } = Select;

const StatisticalCustomerReportContainer = () => {
  const [queriesGet, setQueriesGet] = useState<{
    customerId?: string;
    salesId?: string;
    from?: string;
    to?: string;
    year?: string;
    page: number;
    pageSize: number;
    search: string;
  }>({
    year: moment().format('YYYY'),
    page: 1,
    pageSize: 20,
    search: '',
  });

  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const { data: customerData } = useQuery(['fetchCustomer'], () =>
    fetchCustomer({ page: 1, pageSize: 10000 })
  );

  const OpitionCustomers = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (customerData?.data?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return customerData?.data?.map((v) => ({
        value: v.id,
        label: `${v.customerCode} - ${v.fullName}`,
      }));
    }
  }, [customerData]);

  const { data: staffList } = useQuery(['fetchAllStaff'], () => getStaff());

  const OpitionStaffs = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    if (staffList?.length < 0) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return staffList?.map((v) => ({
        value: v.id,
        label: `${v.staffCode} - ${v.fullName}`,
      }));
    }
  }, [staffList]);

  const { data, isLoading } = useQuery(['GET_DATA', queriesGet], () =>
    getStatisticalCustomerReport(queriesGet)
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
      endpoint: 'finance-statistical/export-statistical-customer',
      params: queriesGet,
    });
    setExportLoading(false);
  };

  const handleChangeCustomer = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      customerId: value,
    }));
  };

  const handleChangeSales = (value: any) => {
    setQueriesGet((prev) => ({
      ...prev,
      salesId: value,
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

  const handleYearChange = (date: moment.Moment | null) => {
    setQueriesGet((prev) => ({
      ...prev,
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
          picker='year'
          defaultValue={moment(queriesGet.year, 'YYYY')}
          disabledDate={disabledDate}
          onChange={handleYearChange}
          style={{ marginRight: 16 }}
        />
        <RangePicker
          format='DD-MM-YYYY'
          onChange={handleChangeDateFilter}
          className='h-8 w-[300px]'
          placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
        />
        <Select
          placeholder='Chọn khách hàng'
          className='w-[250px]'
          onChange={handleChangeCustomer}
          filterOption={(input, option) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onSearch={(value) => {
            // TODO: search customer
          }}
          showArrow
          showSearch
          allowClear
        >
          {OpitionCustomers?.map((v: any) => (
            <Option key={v.value} value={v.value}>
              {v.label}
            </Option>
          ))}
        </Select>
        <Select
          placeholder='Chọn kinh doanh'
          className='w-[250px]'
          onChange={handleChangeSales}
          filterOption={(input, option) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //  @ts-ignore
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          showArrow
          showSearch
          allowClear
        >
          {OpitionStaffs?.map((v: any) => (
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
          summary={(pageData) => {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell
                  className='text-center'
                  index={0}
                  colSpan={2}
                >
                  Tổng
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={3} />
                <Table.Summary.Cell className='text-center' index={4} />
                <Table.Summary.Cell className='text-center' index={5} />
                <Table.Summary.Cell className='text-center' index={6} />
                <Table.Summary.Cell className='text-center' index={7} />
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jan?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jan?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jan?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.jan?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.feb?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.feb?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.feb?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.feb?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.mar?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.mar?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.mar?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.mar?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.apr?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.apr?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.apr?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.apr?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.may?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.may?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.may?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.may?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jun?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jun?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jun?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.jun?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jul?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jul?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.jul?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.jul?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.aug?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.aug?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.aug?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.aug?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.sep?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.sep?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.sep?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.sep?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.oct?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.oct?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.oct?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.oct?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.nov?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.nov?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.nov?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.nov?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.dec?.revenue ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.dec?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.dec?.profit ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(data?.sumValues?.dec?.profitMargin ?? 0.0) *
                      100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(
                      data?.sumValues?.summary?.revenue ?? 0.0
                    ).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.summary?.cost ?? 0.0).toFixed(2)
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    parseFloat(data?.sumValues?.summary?.profit ?? 0.0).toFixed(
                      2
                    )
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell className='text-center' index={8}>
                  {formatNumberWithCommas(
                    (
                      parseFloat(
                        data?.sumValues?.summary?.profitMargin ?? 0.0
                      ) * 100
                    ).toFixed(2)
                  )}{' '}
                  %
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>
    </div>
  );
};

export default StatisticalCustomerReportContainer;
