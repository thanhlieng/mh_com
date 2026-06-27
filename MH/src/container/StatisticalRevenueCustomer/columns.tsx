/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import { formatNumberWithCommas } from '@/utils/ultils';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';

export const STATISTICAL_CUSTOMER_REPORT_COLUMNS: ColumnsType<any> = [
  {
    title: 'STT',
    key: 'no',
    align: 'center',
    width: 40,
    fixed: true,
    render: (_text, _object, index) => {
      return <span className='text-center'>{index + 1}</span>;
    },
  },
  {
    title: 'Mã khách hàng',
    dataIndex: 'customerCode',
    align: 'center',
    fixed: true,
    width: 200,
  },
  {
    title: 'Tên khách hàng',
    dataIndex: 'customerName',
    align: 'center',
    fixed: true,
    width: 200,
  },
  {
    title: 'Kinh doanh',
    dataIndex: 'salesName',
    align: 'center',
    width: 200,
  },
  {
    title: 'Ngày mở mã/Active lại',
    dataIndex: 'openDate',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {fieldData ? moment(fieldData).format('DD/MM/YYYY') : 'N/A'}
        </span>
      );
    },
  },
  {
    title: 'Thông tin đơn vị',
    dataIndex: 'unitInfo',
    align: 'center',
    width: 200,
  },
  {
    title: 'Nhóm Khách hàng/Nhà cung cấp',
    dataIndex: 'customerGroup',
    align: 'center',
    width: 200,
  },
  {
    title: 'Doanh thu tháng hiện tại (N)',
    dataIndex: 'currentMonthRevenue',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Doanh thu tháng N-1',
    dataIndex: 'revenueMonthN1',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Doanh thu tháng N-2',
    dataIndex: 'revenueMonthN2',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Doanh thu tháng N-3',
    dataIndex: 'revenueMonthN3',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Doanh thu tháng N-4',
    dataIndex: 'revenueMonthN4',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Doanh thu tháng N-5',
    dataIndex: 'revenueMonthN5',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Doanh thu tháng N-6',
    dataIndex: 'revenueMonthN6',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Doanh thu TB 3 tháng liền kề',
    dataIndex: 'avgRevenueLast3Months',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Khách hàng gửi giảm',
    dataIndex: 'revenueDecreased',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
  {
    title: 'Khách hàng gửi tăng',
    dataIndex: 'revenueIncreased',
    align: 'center',
    width: 200,
    render: (fieldData: number) => {
      return (
        <span className='text-center'>
          {formatNumberWithCommas(fieldData.toFixed(2))}
        </span>
      );
    },
  },
];
