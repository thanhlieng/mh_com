/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import { ColumnsType } from 'antd/lib/table';

export const ORDER_REMAINING_REPORT_COLUMNS: ColumnsType<any> = [
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
    title: 'Số bưu MH',
    dataIndex: 'booking_code',
    align: 'center',
    width: 140,
    fixed: true,
  },
  {
    title: 'Số bưu đối tác',
    dataIndex: 'partner_bill_code',
    align: 'center',
    width: 140,
  },
  {
    title: 'Đối tác kết nối',
    dataIndex: 'partner_connection',
    align: 'center',
    width: 140,
  },
  {
    title: 'Mã khách hàng',
    dataIndex: 'customer_code',
    align: 'center',
    width: 140,
  },
  {
    title: 'Tên khách hàng',
    dataIndex: 'customer_name',
    align: 'center',
    width: 140,
  },
  {
    title: 'Ngày pick up nhận vào',
    dataIndex: 'pickup_date',
    align: 'center',
    width: 140,
  },
  {
    title: 'Ngày xuất ra khỏi công ty',
    dataIndex: 'export_date',
    align: 'center',
    width: 140,
  },
  {
    title: 'Số ngày tồn chưa phát kể từ khi xuất ra',
    dataIndex: 'remaining_days',
    align: 'center',
    width: 140,
  },
  {
    title: 'Note tình trạng và xử lý đơn hàng',
    dataIndex: 'note',
    align: 'center',
    width: 250,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //  @ts-ignore
    editable: true,
  },
];
