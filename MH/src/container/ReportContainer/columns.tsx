/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';

import { BookingType } from '@/contants/types';
import { formatNumberWithCommas } from '@/utils/ultils';

const convertDataRate = (currency: string, rate: any, value: any) => {
  if (currency === 'USD') {
    return formatNumberWithCommas(parseFloat((value * rate) as any).toFixed(2));
  }

  return formatNumberWithCommas(Number(value ?? 0).toFixed(2));
};

export const REPORT_COLUMNS: ColumnsType<any> = [
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
    title: 'Ngày xuất',
    dataIndex: 'export_date',
    align: 'center',
    width: 140,
    fixed: true,
    render: (text: string) => {
      return (
        <span className='text-center'>{moment(text).format('DD/MM/YYYY')}</span>
      );
    },
  },
  {
    title: 'Số bill gốc',
    dataIndex: 'booking_code',
    align: 'center',
    width: 180,
    fixed: true,
  },
  {
    title: 'Số bill đối tác',
    dataIndex: 'partner_bill_code',
    align: 'center',
    width: 140,
    fixed: true,
  },
  {
    title: 'Mã khách hàng',
    dataIndex: 'customer_code',
    align: 'center',
    width: 140,
    fixed: true,
  },
  {
    title: 'Tên khách hàng',
    dataIndex: 'full_name',
    align: 'center',
    width: 240,
  },
  {
    title: 'Kinh doanh',
    dataIndex: 'staff_info',
    align: 'center',
    width: 140,
  },
  {
    title: 'Loại gửi',
    dataIndex: 'booking_type',
    align: 'center',
    width: 140,
    render: (type: string) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //  @ts-ignore
      return <span>{BookingType[type]}</span>;
    },
  },
  {
    title: 'Kí hiệu nước',
    dataIndex: 'country_code',
    align: 'center',
    width: 140,
  },
  {
    title: 'Nước gửi',
    dataIndex: 'country_name',
    align: 'center',
    width: 140,
  },
  {
    title: 'Hình thức xuất',
    dataIndex: 'export_form',
    align: 'center',
    width: 140,
  },
  {
    title: 'Điều kiện giao hàng',
    dataIndex: 'delivery_condition',
    align: 'center',
    width: 140,
    render: (text: string) => {
      return <span>{text?.slice(0, 3)}</span>;
    },
  },
  {
    title: 'Dịch vụ gửi',
    dataIndex: 'require_service',
    align: 'center',
    width: 140,
  },
  {
    title: 'Dịch vụ Checkout',
    dataIndex: 'partner_service',
    align: 'center',
    width: 140,
  },
  {
    title: 'Nhà cung cấp chính',
    dataIndex: 'connection_partner_service',
    align: 'center',
    width: 140,
  },
  {
    title: 'TTGD Quản lý',
    dataIndex: 'unit_name',
    align: 'center',
    width: 140,
  },
  {
    title: 'Nhóm Dịch vụ',
    dataIndex: 'service_booking_name',
    align: 'center',
    width: 140,
  },
  {
    title: 'TL tính cước',
    dataIndex: 'billable_weight',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Điều chỉnh TL Tính cước',
    dataIndex: 'op_billable_weight',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'TL Đối tác chốt',
    dataIndex: 'partner_billable_weight',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Loại thanh toán',
    dataIndex: 'type_of_payment',
    align: 'center',
    width: 140,
  },
  {
    title: 'Giá bán PHÍ BIẾN ĐỘNG',
    dataIndex: 'pp1_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn PHÍ BIẾN ĐỘNG',
    dataIndex: 'gvg_pp1_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán PHÍ HÀNG HÓA',
    dataIndex: 'pp2_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn PHÍ HÀNG HÓA',
    dataIndex: 'gvg_pp2_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán PHÍ KHÁC',
    dataIndex: 'pp3_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn PHÍ KHÁC',
    dataIndex: 'gvg_pp3_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán GOM, DELIVERY…',
    dataIndex: 'extend_pp_1',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn GOM, DELIVERY…',
    dataIndex: 'extend_gvg_pp_1',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán HANDLING (XỬ LÝ HẢI QUAN…)',
    dataIndex: 'extend_pp_2',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn HANDLING (XỬ LÝ HẢI QUAN…)',
    dataIndex: 'extend_gvg_pp_2',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán TRUCKING, KẾT NỐI…',
    dataIndex: 'extend_pp_3',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn TRUCKING, KẾT NỐI…',
    dataIndex: 'extend_gvg_pp_3',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán TỜ KHAI/CO…',
    dataIndex: 'extend_pp_4',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn TỜ KHAI/CO…',
    dataIndex: 'extend_gvg_pp_4',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán KHÁC…',
    dataIndex: 'extend_pp_5',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn KHÁC…',
    dataIndex: 'extend_gvg_pp_5',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'NCC PP Gom, Delivery, Trucking, Kết nối…',
    dataIndex: 'ncc_pp',
    align: 'center',
    width: 140,
  },
  {
    title: 'NCC Tờ khai, CO…',
    dataIndex: 'ncc_co',
    align: 'center',
    width: 140,
  },
  {
    title: 'NCC Handling, Khác…',
    dataIndex: 'ncc_handling',
    align: 'center',
    width: 140,
  },
  {
    title: 'Loại bảng giá',
    dataIndex: 'price_list_type',
    align: 'center',
    width: 140,
  },
  {
    title: 'Gía bán BẢNG',
    dataIndex: 'sales_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Gía mua BẢNG',
    dataIndex: 'original_cost_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'LKD/GIÁ BÁN',
    dataIndex: 'lkd_sales_price',
    align: 'center',
    width: 140,

    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán TỔNG PP+/GIÁ',
    dataIndex: 'total_pp_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn TỔNG PP+/GIÁ',
    dataIndex: 'gv_origin_total_pp_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Tổng giá bán + PP trước PPXD',
    dataIndex: 'total_sales_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Tổng giá vốn + PP trước PPXD',
    dataIndex: 'gv_origin_sales_price',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán PPXD',
    dataIndex: 'ppxd',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn PPXD',
    dataIndex: 'gv_origin_ppxd',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá bán TỔNG PP NGOÀI',
    dataIndex: 'total_extend_pp',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Giá vốn TỔNG PP NGOÀI',
    dataIndex: 'total_origin_extend_gv_pp',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'TỔNG DOANH SỐ THEO LOẠI TIỀN BÁN RA',
    dataIndex: 'total_sales',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'TỔNG GIÁ VỐN THEO LOẠI TIỀN BÁN RA',
    dataIndex: 'total_origin_gv_acf',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Tổng Lợi nhuận theo loại tiền bán ra',
    dataIndex: 'total_origin_sales',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'Tỷ suất LN/ DT',
    dataIndex: 'ros',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return (
        <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}%</span>
      );
    },
  },
  {
    title: 'VAT',
    dataIndex: 'vat',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'TỔNG Doanh số Cả VAT',
    dataIndex: 'total_sales_vat',
    align: 'center',
    width: 140,
    render: (type: string) => {
      return <span>{formatNumberWithCommas(parseFloat(type).toFixed(2))}</span>;
    },
  },
  {
    title: 'TỔNG DOANH SỐ QUY ĐỔI',
    dataIndex: 'total_sales',
    align: 'center',
    width: 140,
    render: (text: string, record: any) => {
      return <span>{convertDataRate(record.currency, record.rate, text)}</span>;
    },
  },
  {
    title: 'TỔNG GIÁ VỐN QUY ĐỔI',
    dataIndex: 'total_origin_gv_acf',
    align: 'center',
    width: 140,
    render: (text: string, record: any) => {
      return <span>{convertDataRate(record.currency, record.rate, text)}</span>;
    },
  },
  {
    title: 'Tổng Lợi nhuận QUY ĐỔI',
    dataIndex: 'total_origin_sales',
    align: 'center',
    width: 140,
    render: (text: string, record: any) => {
      return <span>{convertDataRate(record.currency, record.rate, text)}</span>;
    },
  },
  {
    title: 'Tỷ suất LN/ DT QUY ĐỔI',
    dataIndex: 'ros',
    align: 'center',
    width: 140,
    render: (text: string, record: any) => {
      return (
        <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}%</span>
      );
    },
  },
  {
    title: 'VAT QUY ĐỔI',
    dataIndex: 'vat',
    align: 'center',
    width: 140,
    render: (text: string, record: any) => {
      return <span>{convertDataRate(record.currency, record.rate, text)}</span>;
    },
  },
  {
    title: 'TỔNG Doanh số Cả VAT QUY ĐỔI',
    dataIndex: 'total_sales_vat',
    align: 'center',
    width: 140,
    render: (text: string, record: any) => {
      return <span>{convertDataRate(record.currency, record.rate, text)}</span>;
    },
  },
  {
    title: 'DOANH THU GỐC TRƯỚC CHÊNH',
    dataIndex: 'original_revenue_before_diff',
    align: 'center',
    width: 140,
    render: (text: string) => {
      return <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>;
    },
  },
  {
    title: 'SỐ TIỀN CHÊNH GIÁ',
    dataIndex: 'price_diff',
    align: 'center',
    width: 140,
    render: (text: string) => {
      return <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>;
    },
  },
  {
    title: 'GIÁ VỐN THEO NCC CHÍNH',
    dataIndex: 'cost_of_main_ncc',
    align: 'center',
    width: 140,
    render: (text: string) => {
      return <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>;
    },
  },
  {
    title: 'TỔNG GIÁ VỐN THEO LOẠI TIỀN NCC CHÍNH',
    dataIndex: 'total_cost_capital_main_type_ncc',
    align: 'center',
    width: 140,
    render: (text: string) => {
      return <span>{formatNumberWithCommas(parseFloat(text).toFixed(2))}</span>;
    },
  },
  {
    title: 'LOẠI XUẤT HÓA ĐƠN CỦA NCC CHÍNH',
    dataIndex: 'type_invoice_of_main_ncc',
    align: 'center',
    width: 140,
  },
  {
    title: 'CHECK',
    dataIndex: 'verified',
    align: 'center',
    width: 140,
    render: (text: string) => {
      return <span>{String(text).toUpperCase()}</span>;
    },
  },
  {
    title: 'NOTE',
    dataIndex: 'note',
    align: 'center',
    width: 140,
  },
];
