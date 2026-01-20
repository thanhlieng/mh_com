/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import { formatNumberWithCommas } from '@/utils/ultils';
import { ColumnsType } from 'antd/lib/table';

export const STATISTICAL_SERVICE_REPORT_COLUMNS: ColumnsType<any> = [
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
    title: 'Dịch vụ gửi',
    dataIndex: 'serviceName',
    align: 'center',
    fixed: true,
    width: 200,
  },
  {
    title: 'THÁNG 1',
    key: 'jan',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'jan', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'jan', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'jan', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'jan', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 2',
    key: 'feb',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'feb', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'feb', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'feb', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'feb', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 3',
    key: 'mar',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'mar', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'mar', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'mar', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'mar', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 4',
    key: 'apr',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'apr', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'apr', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'apr', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'apr', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 5',
    key: 'may',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'may', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'may', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'may', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'may', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 6',
    key: 'jun',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'jun', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'jun', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'jun', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'jun', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 7',
    key: 'jul',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'jul', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'jul', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'jul', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'jul', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 8',
    key: 'aug',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'aug', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'aug', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'aug', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'aug', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 9',
    key: 'sep',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'sep', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'sep', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'sep', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'sep', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 10',
    key: 'oct',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'oct', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'oct', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'oct', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'oct', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 11',
    key: 'nov',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'nov', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'nov', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'nov', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'nov', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'THÁNG 12',
    key: 'dec',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'dec', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'dec', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'dec', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'dec', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
  {
    title: 'Tổng',
    key: 'summary',
    align: 'center',
    children: [
      {
        title: 'Doanh thu',
        dataIndex: ['statistical', 'summary', 'revenue'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Giá vốn',
        dataIndex: ['statistical', 'summary', 'cost'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Lợi nhuận',
        dataIndex: ['statistical', 'summary', 'profit'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas(fieldData.toFixed(2))}
            </span>
          );
        },
      },
      {
        title: 'Tỷ suất LN',
        dataIndex: ['statistical', 'summary', 'profitMargin'],
        align: 'center',
        width: 150,
        render: (fieldData: number) => {
          return (
            <span className='text-center'>
              {formatNumberWithCommas((fieldData * 100).toFixed(2))}%
            </span>
          );
        },
      },
    ],
  },
];
