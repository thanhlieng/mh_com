/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';

import { IDetailsLisResPonse, ListRespone } from '@/services/list.services';
import { numberWithCommas } from '@/utils/helpers';

import {
  BookingType,
  InvoiceItemType,
  InvoiceType,
  OpitionType,
} from '../types';
import { formatNumberWithCommas } from '@/utils/ultils';

const LIST_COLUMNS_CARGO_LIST_USD: ColumnsType<ListRespone> = [
  {
    title: 'Tên khách hàng',
    dataIndex: 'customer_name',
    key: 'customer_name',
    align: 'center',
    width: 150,
  },
  {
    title: 'Mã khách hàng',
    dataIndex: 'customer_code',
    key: 'customer_code',
    align: 'center',
    width: 150,
  },
  {
    title: 'Người liên hệ',
    dataIndex: 'notify_contact_person',
    key: 'notify_contact_person',
    align: 'center',
    width: 150,
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'customer_booking_mobile',
    key: 'customer_booking_mobile',
    align: 'center',
    width: 150,
  },
  {
    title: 'Email nhận bảng kê',
    dataIndex: 'customer_booking_email',
    key: 'customer_booking_email',
    align: 'center',
    width: 150,
  },
  {
    title: 'Ghi chú bảng kê',
    dataIndex: 'price_list_note',
    key: 'price_list_note',
    align: 'center',
    width: 150,
  },
  {
    title: 'Lần gửi gần nhất',
    dataIndex: 'last_sent',
    key: 'last_sent',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>
        {text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm') : ''}
      </span>
    ),
  },
  {
    title: 'Tổng doanh số cả VAT',
    dataIndex: 'total_sales_including_vat_usd',
    key: 'total_sales_including_vat_usd',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{formatNumberWithCommas(parseFloat(text ?? 0).toFixed(2))}</span>
    ),
  },
];

const LIST_COLUMNS_CARGO_LIST_VND: ColumnsType<ListRespone> = [
  {
    title: 'Tên khách hàng',
    dataIndex: 'customer_name',
    key: 'customer_name',
    align: 'center',
    width: 150,
  },
  {
    title: 'Mã khách hàng',
    dataIndex: 'customer_code',
    key: 'customer_code',
    align: 'center',
    width: 150,
  },
  {
    title: 'Người liên hệ',
    dataIndex: 'notify_contact_person',
    key: 'notify_contact_person',
    align: 'center',
    width: 150,
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'customer_booking_mobile',
    key: 'customer_booking_mobile',
    align: 'center',
    width: 150,
  },
  {
    title: 'Email nhận bảng kê',
    dataIndex: 'customer_booking_email',
    key: 'customer_booking_email',
    align: 'center',
    width: 150,
  },
  {
    title: 'Ghi chú bảng kê',
    dataIndex: 'price_list_note',
    key: 'price_list_note',
    align: 'center',
    width: 150,
  },
  {
    title: 'Lần gửi gần nhất',
    dataIndex: 'last_sent',
    key: 'last_sent',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{text ? moment(text).format('YYYY/MM/DD HH:mm') : ''}</span>
    ),
  },
  {
    title: 'Tổng doanh số cả VAT',
    dataIndex: 'total_sales_including_vat_vnd',
    key: 'total_sales_including_vat_vnd',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{formatNumberWithCommas(parseFloat(text ?? 0).toFixed(2))}</span>
    ),
  },
];

export const LIST_COLUMNS_CARGO_LIST = {
  USD: LIST_COLUMNS_CARGO_LIST_USD,
  VND: LIST_COLUMNS_CARGO_LIST_VND,
};

const DETAILS_LIST_COLUMNS_CARGO_LIST_VND: ColumnsType<IDetailsLisResPonse> = [
  {
    title: <span style={{ color: 'blue' }}>Ngày</span>,
    dataIndex: 'created_at',
    key: 'created_at',
    align: 'center',
    width: 150,
    render: (url: string) => <span>{moment(url).format('DD/MM/YYYY')}</span>,
  },
  {
    title: <span style={{ color: 'blue' }}>Mã đơn hàng</span>,
    dataIndex: 'booking_code',
    key: 'booking_code',
    align: 'center',
    width: 150,
  },
  {
    title: <span style={{ color: 'blue' }}>Nơi đến</span>,
    dataIndex: 'destination',
    key: 'destination',
    align: 'center',
    width: 150,
  },
  {
    title: <span style={{ color: 'blue' }}>Loại bưu phẩm bưu kiện</span>,
    dataIndex: 'booking_type',
    key: 'booking_type',
    align: 'center',
    width: 100,
    render: (type: any, record: any) => {
      return (
        <div className='h-full w-full cursor-pointer'>
          <span
            className={`m-0 p-0 ${
              record?.is_handle === null && 'text-red-500'
            }`}
          >
            {BookingType[type as 'LICENSE']}
          </span>
        </div>
      );
    },
  },
  {
    title: <span style={{ color: 'blue' }}>Trọng lượng</span>,
    dataIndex: 'billable_weight',
    key: 'billable_weight',
    align: 'center',
    width: 150,
  },
  {
    title: <span style={{ color: 'blue' }}>Tổng tiền cước</span>,
    dataIndex: 'total_sales_vnd',
    key: 'total_sales_vnd',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>
    ),
  },
  {
    title: <span style={{ color: 'blue' }}>VAT</span>,
    dataIndex: 'vat_vnd',
    key: 'vat_vnd',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>
    ),
  },
  {
    title: <span style={{ color: 'blue' }}>Tổng doanh số cả VAT</span>,
    dataIndex: 'total_sales_including_vat_vnd',
    key: 'total_sales_including_vat_vnd',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>
    ),
  },
  {
    title: <span style={{ color: 'blue' }}>Lần gửi cuối</span>,
    dataIndex: 'last_sent',
    key: 'last_sent',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{text ? moment(text).format('DD/MM/YYYY HH:mm') : ''}</span>
    ),
  },
];

const DETAILS_LIST_COLUMNS_CARGO_LIST_USD: ColumnsType<IDetailsLisResPonse> = [
  {
    title: <span style={{ color: 'blue' }}>Ngày</span>,
    dataIndex: 'created_at',
    key: 'created_at',
    align: 'center',
    width: 150,
    render: (url: string) => <span>{moment(url).format('DD/MM/YYYY')}</span>,
  },
  {
    title: <span style={{ color: 'blue' }}>Mã đơn hàng</span>,
    dataIndex: 'booking_code',
    key: 'booking_code',
    align: 'center',
    width: 150,
  },
  {
    title: <span style={{ color: 'blue' }}>Nơi đến</span>,
    dataIndex: 'destination',
    key: 'destination',
    align: 'center',
    width: 150,
  },
  {
    title: <span style={{ color: 'blue' }}>Loại bưu phẩm bưu kiện</span>,
    dataIndex: 'booking_type',
    key: 'booking_type',
    align: 'center',
    width: 100,
    render: (type: any, record: any) => {
      return (
        <div className='h-full w-full cursor-pointer'>
          <span
            className={`m-0 p-0 ${
              record?.is_handle === null && 'text-red-500'
            }`}
          >
            {BookingType[type as 'LICENSE']}
          </span>
        </div>
      );
    },
  },
  {
    title: <span style={{ color: 'blue' }}>Trọng lượng</span>,
    dataIndex: 'billable_weight',
    key: 'billable_weight',
    align: 'center',
    width: 150,
  },
  {
    title: <span style={{ color: 'blue' }}>Tổng tiền cước</span>,
    dataIndex: 'total_sales_usd',
    key: 'total_sales_usd',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>
    ),
  },
  {
    title: <span style={{ color: 'blue' }}>VAT</span>,
    dataIndex: 'vat_usd',
    key: 'vat_usd',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>
    ),
  },
  {
    title: <span style={{ color: 'blue' }}>Tổng doanh số cả VAT</span>,
    dataIndex: 'total_sales_including_vat_usd',
    key: 'total_sales_including_vat_usd',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>
    ),
  },
  {
    title: <span style={{ color: 'blue' }}>Lần gửi cuối</span>,
    dataIndex: 'last_sent',
    key: 'last_sent',
    align: 'center',
    width: 150,
    render: (text: string) => (
      <span>{text ? moment(text).format('DD/MM/YYYY HH:mm') : ''}</span>
    ),
  },
];

export const DETAILS_LIST_COLUMNS_CARGO_LIST = {
  USD: DETAILS_LIST_COLUMNS_CARGO_LIST_USD,
  VND: DETAILS_LIST_COLUMNS_CARGO_LIST_VND,
};

const OpitionInvoiceType = Object.entries(InvoiceType).map(([key, value]) => ({
  value: key,
  label: value,
}));

const OpitionInvoiceItemType = Object.entries(InvoiceItemType).map(
  ([key, value]) => ({
    value: key,
    label: value,
  })
);

export const teamplateInvoiceListColumns = ({
  optionCurrency,
  handleUpdate,
  handleDeleteRow,
}: {
  optionCurrency: Array<OpitionType>;
  handleUpdate: (record: any) => void;
  handleDeleteRow: (record: any) => void;
}) => {
  const columns: ColumnsType<any> = [
    {
      title: 'STT',
      key: 'no',
      align: 'center',
      width: 40,
      render: (_text, _object, index) => {
        return <span className='text-center'>{index + 1}</span>;
      },
    },
    {
      title: 'Tên mẫu invoice',
      key: 'templateName',
      dataIndex: 'templateName',
      align: 'center',
      width: 150,
    },
    {
      title: 'Loại invoice',
      key: 'invoiceType',
      dataIndex: 'invoiceType',
      align: 'center',
      width: 150,
      render: (text: InvoiceType) => {
        return (
          <span className='text-center'>
            {OpitionInvoiceType.find((x) => x.value === text)?.label}
          </span>
        );
      },
    },
    {
      title: 'Loại hàng hóa',
      key: 'typeItemInvoice',
      dataIndex: 'typeItemInvoice',
      align: 'center',
      width: 150,
      render: (text: InvoiceType) => {
        return (
          <span className='text-center'>
            {OpitionInvoiceItemType.find((x) => x.value === text)?.label}
          </span>
        );
      },
    },

    {
      title: 'Loại tiền tệ',
      key: 'currencyId',
      dataIndex: 'currencyId',
      align: 'center',
      width: 150,
      render: (text: InvoiceItemType) => {
        return (
          <span className='text-center'>
            {optionCurrency.find((x) => x.value === text)?.label}
          </span>
        );
      },
    },

    {
      title: 'Lý do xuất khẩu',
      key: 'reasonExport',
      dataIndex: 'reasonExport',
      align: 'center',
      width: 150,
    },

    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50,
      render: (_type: string, record: any, index) => (
        <div className='flex flex-row items-center justify-center gap-4'>
          <EditOutlined
            onClick={() => handleUpdate({ ...record, idKey: index })}
          />
          <DeleteOutlined onClick={() => handleDeleteRow(record)} />
        </div>
      ),
    },
  ];

  return columns;
};
