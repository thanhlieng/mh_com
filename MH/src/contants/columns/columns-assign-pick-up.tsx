import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';

import { BookingType } from '../types';

interface DataType {
  id: string;
  booking_code: string; // Mã booking
  estimate_date: string | Date; // Thời gian yêu cầu lấy hàng
  type: BookingType; // Loại hàng hóa
  note?: string; // Note
  created_at: string | Date; // Thời gian tạo booking
  customer_code: string; // Mã khách hàng
  weight: number; // Cân nặng
  bulky_weight: number; // Cân nặng cồng kềnh
  quantity: string; // Số lượng
  sender_phone_number: string; // Số điện thoại người gửi
  sender_address: string; // Địa chỉ người gửi
  sender_name: string; // Thông tin người gửi
}

export const columnsAssignPickUp: ColumnsType<DataType> = [
  {
    title: 'Mã booking',
    dataIndex: 'booking_code',
    align: 'center',
  },
  {
    title: 'Nhân viên pickup',
    align: 'center',
    width: 150,
    render: (_type: string, record: any) => {
      return record.staff_code
        ? `${record.staff_code} - ${record.staff_name}`
        : '';
    },
  },
  {
    title: 'Thời gian yêu cầu lấy hàng',
    dataIndex: 'estimate_date',
    align: 'center',
    render: (text: string | Date) =>
      moment(text).format('DD/MM/YYYY  HH:mm:ss'),
  },
  {
    title: 'Mã khách hàng',
    dataIndex: 'customer_code',
    align: 'center',
  },
  {
    title: 'Cân nặng thực',
    dataIndex: 'weight',
    align: 'center',
    render: (text: number) => text.toFixed(2),
  },
  {
    title: 'Cân nặng cồng kềnh',
    dataIndex: 'bulky_weight',
    align: 'center',
    render: (text: number) => text.toFixed(2),
  },
  {
    title: 'Số lượng',
    dataIndex: 'quantity',
    align: 'center',
  },
  {
    title: 'Thông tin người gửi',
    dataIndex: 'sender_name',
    align: 'center',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'sender_phone_number',
    align: 'center',
  },
  {
    title: 'Address',
    dataIndex: 'sender_address',
    align: 'center',
  },
  {
    title: 'Địa chỉ gửi hàng khác địa chỉ người gửi (nếu có)',
    dataIndex: 'sender_other_shipping_address',
    align: 'center',
  },
];
