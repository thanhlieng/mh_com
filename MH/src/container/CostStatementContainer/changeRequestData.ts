import { type ChangeRequest } from './types';

/** Dữ liệu giả các đề nghị thay đổi đã gửi (sắp theo thời gian gửi mới nhất trước) */
export const FAKE_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 'cr-3',
    code: 'DNTD-2024-0003',
    submittedAt: '2024-02-20T15:42:00',
    status: 'Chờ duyệt',
    items: [
      {
        rowId: '2',
        billCode: 'MH-2024-0002',
        field: 'freightCost',
        fieldLabel: 'Cước phí',
        oldValue: '3.500.000 ₫',
        newValue: '3.800.000 ₫',
      },
      {
        rowId: '2',
        billCode: 'MH-2024-0002',
        field: 'note',
        fieldLabel: 'Ghi chú',
        oldValue: 'Cần xác nhận từ kho ĐN',
        newValue: 'Đã xác nhận, cập nhật cước',
      },
    ],
  },
  {
    id: 'cr-2',
    code: 'DNTD-2024-0002',
    submittedAt: '2024-02-12T09:10:00',
    status: 'Đã duyệt',
    items: [
      {
        rowId: '1',
        billCode: 'MH-2024-0001',
        field: 'status',
        fieldLabel: 'Trạng thái',
        oldValue: 'Chưa thanh toán',
        newValue: 'Đã thanh toán',
      },
    ],
  },
  {
    id: 'cr-1',
    code: 'DNTD-2024-0001',
    submittedAt: '2024-01-28T16:05:00',
    status: 'Từ chối',
    items: [
      {
        rowId: '1',
        billCode: 'MH-2024-0001',
        field: 'surcharge',
        fieldLabel: 'Phụ phí',
        oldValue: '240.000 ₫',
        newValue: '300.000 ₫',
      },
      {
        rowId: '1',
        billCode: 'MH-2024-0001',
        field: 'customer',
        fieldLabel: 'Khách hàng',
        oldValue: 'Công ty TNHH ABC',
        newValue: 'Công ty TNHH ABC Logistics',
      },
    ],
  },
];
