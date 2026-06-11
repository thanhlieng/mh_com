import { CostStatementRow } from './types';

/**
 * Dữ liệu giả cho bảng kê chi phí (không còn được dùng — màn hình lấy data thật
 * từ API GET /api/supplier/transactions). Giữ lại để tham chiếu shape mới.
 */
export const FAKE_COST_DATA: CostStatementRow[] = [
  {
    id: 'pnl-1',
    orderCode: 'XK250608001',
    bookingBillNumber: 'BOOKING-12345',
    containerNo: 'MSCU1234567',
    containerType: "40'HC",
    route: 'HCM - HN',
    serviceName: 'Vận chuyển đường biển',
    contractNumber: 'HD-2024-001',
    amount: 2_400_000,
    category: 'cost',
    editable: true,
    pnlId: 1,
    orderId: 88,
    type: 'pnl',
  },
  {
    id: 'chi_ho-2',
    orderCode: 'XK250608002',
    bookingBillNumber: 'BOOKING-22345',
    containerNo: 'TGHU2233445, TGHU2233446',
    containerType: "20'DC",
    route: '',
    serviceName: 'Thủ tục hải quan, Vận chuyển nội địa',
    contractNumber: 'HD-2024-002',
    amount: 5_000_000,
    category: 'chi_ho',
    editable: false,
    orderId: 89,
    type: 'chi_ho',
  },
];
