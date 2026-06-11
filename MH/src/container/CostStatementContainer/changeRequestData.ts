import { type ChangeRequest } from './types';

/**
 * Dữ liệu giả các đề nghị thay đổi đã gửi (không còn được dùng — màn hình lấy
 * data thật từ API GET /api/supplier/change-requests). Giữ lại để tham chiếu shape.
 */
export const FAKE_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 'cr-1',
    code: 'XK250608001-1',
    submittedAt: '2024-02-20T15:42:00',
    status: 'Chờ duyệt',
    items: [
      {
        rowId: '1',
        billCode: 'XK250608001',
        field: 'amount',
        fieldLabel: 'Tiền',
        oldValue: '2.400.000 ₫',
        newValue: '2.800.000 ₫',
      },
    ],
  },
];
