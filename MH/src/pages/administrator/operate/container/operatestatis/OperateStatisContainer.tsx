/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Collapse, DatePicker, notification } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import { QUERY_KEY } from '@/utils/contants/query-key';
import { getStatisticalDelivery } from '@/utils/contants/services';
const { RangePicker } = DatePicker;

import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';

import { QueryParamConnectBill } from '@/contants/common.constants';
import {
  generateConnectBillOperate,
  generateConnectBillOperateOP,
  generateMultiParcelOP,
  generateMultiParcelPickup,
} from '@/services/booking.services';

import ItemPanel from './ItemPanel';

const OperateStatisContainer = () => {
  const { data: dataStatic } = useQuery([QUERY_KEY.statisticalDelivery], () =>
    getStatisticalDelivery()
  );
  const [queries, setQueries] = useState<QueryParamConnectBill>({});

  const { mutate: generateConnectBill } = useMutation(
    generateConnectBillOperate,
    {
      onSuccess: () => {
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
    }
  );

  const { mutate: generateConnectBillOP } = useMutation(
    generateConnectBillOperateOP,
    {
      onSuccess: () => {
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
    }
  );

  const { mutate: generateExcelMultiParcelOP } = useMutation(
    generateMultiParcelOP,
    {
      onSuccess: () => {
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
    }
  );

  const { mutate: generateExcelMultiParcelPickup } = useMutation(
    generateMultiParcelPickup,
    {
      onSuccess: () => {
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
    }
  );

  const handleChangeDateFilter = (value: any) => {
    setQueries(() => ({
      from: moment(value?.[0]).format('YYYY-MM-DD'),
      to: moment(value?.[1]).format('YYYY-MM-DD'),
    }));
  };

  const handleGenerateConnectBill = () => {
    generateConnectBill({
      from: queries.from,
      to: queries.to,
    });
  };

  const handleGenerateConnectBillOP = () => {
    generateConnectBillOP({
      from: queries.from,
      to: queries.to,
    });
  };

  const handleGenerateMultiParcelOP = () => {
    generateExcelMultiParcelOP({
      from: queries.from,
      to: queries.to,
    });
  };

  const handleGenerateMultiParcelPickup = () => {
    generateExcelMultiParcelPickup({
      from: queries.from,
      to: queries.to,
    });
  };

  const router = useRouter();

  const { Panel } = Collapse;
  const renderHeader = (v: any) => {
    return (
      <div className='flex w-full flex-row justify-between'>
        <div className='flex w-full flex-row items-end justify-between'>
          <p className='m-0 p-0'>{v?.name}</p>
          <p className='m-0 p-0'>{`Số lượng bill: ${v?.totalBill}`}</p>
          <p className='m-0 p-0'>{`Số lượng hàng: ${v?.totalCommodity}`}</p>
          <p className='m-0 p-0'>{`Số lượng thư: ${v?.totalLicense}`}</p>
        </div>
        {v?.id && (
          <div className='w-[120px] text-center'>
            <Button
              className='h-8 rounded-md bg-[#FBE51D] px-4 outline-none'
              onClick={() => router.push(`/administrator/connect/${v.id}`)}
            >
              Tiếp
            </Button>
          </div>
        )}
      </div>
    );
  };
  return (
    <div>
      <div className='mb-5'>
        <RangePicker
          format='DD-MM-YYYY'
          onChange={handleChangeDateFilter}
          className='mr-5 h-8'
          placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
        />
        <Button
          icon={<DownloadOutlined />}
          type='primary'
          className='h-8'
          onClick={handleGenerateConnectBill}
        >
          Xuất excel Pickup
        </Button>
        <Button
          icon={<DownloadOutlined />}
          type='primary'
          className='ml-2 h-8'
          onClick={handleGenerateConnectBillOP}
        >
          Xuất excel OP
        </Button>
        <Button
          icon={<DownloadOutlined />}
          type='primary'
          className='ml-2 h-8'
          onClick={handleGenerateMultiParcelPickup}
        >
          Đơn nhiều kiện pick up
        </Button>
        <Button
          icon={<DownloadOutlined />}
          type='primary'
          className='ml-2 h-8'
          onClick={handleGenerateMultiParcelOP}
        >
          Đơn nhiều kiện OP
        </Button>
      </div>
      <Collapse bordered={true} expandIconPosition='right'>
        {dataStatic?.map((v: any, index: number) => (
          <Panel header={renderHeader(v)} key={index}>
            <ItemPanel
              values={v.details as Array<any>}
              isSum={v.name === 'Tổng'}
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default OperateStatisContainer;
