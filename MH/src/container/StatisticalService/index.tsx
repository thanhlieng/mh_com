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
import { getStatisticalServiceReport } from '@/services/assign.services';
import { generateDowloadList } from '@/services/booking.services';
import { DownloadOutlined } from '@ant-design/icons';
import { STATISTICAL_SERVICE_REPORT_COLUMNS } from './columns';
import moment from 'moment';
import { formatNumberWithCommas } from '@/utils/ultils';

const StatisticalServiceReportContainer = () => {
  const [queriesGet, setQueriesGet] = useState<{
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

  const { data, isLoading } = useQuery(['GET_DATA', queriesGet], () =>
    getStatisticalServiceReport(queriesGet)
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

  const exportReportFile = () => {
    setExportLoading(true);
    getDowloadList({
      endpoint: 'finance-statistical/export-statistical-service',
      params: queriesGet,
    });
    setExportLoading(false);
  };

  const handlePagination = (pagination: { current?: number }) => {
    setQueriesGet((prev) => ({
      ...prev,
      page: pagination.current || 1,
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

  const columns = STATISTICAL_SERVICE_REPORT_COLUMNS.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => {
        return {
          record,
          dataIndex: col.dataIndex,
          title: col.title,
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
          scroll={{ y: 600, x: 1600 }}
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

export default StatisticalServiceReportContainer;
