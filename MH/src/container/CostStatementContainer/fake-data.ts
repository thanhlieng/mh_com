export interface CostStatementRow {
  id: string;
  code: string;
  date: string;
  partnerCode: string;
  orderCode: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  status: 'draft' | 'confirmed' | 'paid' | 'cancelled';
  note: string;
}

export const FAKE_COST_STATEMENT: CostStatementRow[] = [
  { id: '1', code: 'BK-2024-001', date: '2024-03-01', partnerCode: 'SUP-001', orderCode: 'ORD-1001', description: 'Phí vận chuyển nội địa tháng 3', category: 'Vận chuyển', amount: 12500000, currency: 'VND', status: 'confirmed', note: '' },
  { id: '2', code: 'BK-2024-002', date: '2024-03-03', partnerCode: 'SUP-002', orderCode: 'ORD-1002', description: 'Phí lưu kho tháng 3', category: 'Lưu kho', amount: 4200000, currency: 'VND', status: 'paid', note: 'Đã thanh toán' },
  { id: '3', code: 'BK-2024-003', date: '2024-03-05', partnerCode: 'SUP-001', orderCode: 'ORD-1003', description: 'Phí hải quan lô hàng A', category: 'Hải quan', amount: 8750000, currency: 'VND', status: 'draft', note: 'Chờ xác nhận' },
  { id: '4', code: 'BK-2024-004', date: '2024-03-07', partnerCode: 'SUP-003', orderCode: 'ORD-1004', description: 'Phí xử lý hàng đặc biệt', category: 'Xử lý', amount: 2100000, currency: 'VND', status: 'confirmed', note: '' },
  { id: '5', code: 'BK-2024-005', date: '2024-03-10', partnerCode: 'SUP-002', orderCode: 'ORD-1005', description: 'Phí vận chuyển quốc tế', category: 'Vận chuyển', amount: 35000000, currency: 'VND', status: 'paid', note: '' },
  { id: '6', code: 'BK-2024-006', date: '2024-03-12', partnerCode: 'SUP-004', orderCode: 'ORD-1006', description: 'Phí đóng gói hàng hóa', category: 'Đóng gói', amount: 1800000, currency: 'VND', status: 'draft', note: '' },
  { id: '7', code: 'BK-2024-007', date: '2024-03-14', partnerCode: 'SUP-001', orderCode: 'ORD-1007', description: 'Phí bảo hiểm hàng hóa', category: 'Bảo hiểm', amount: 5500000, currency: 'VND', status: 'confirmed', note: '' },
  { id: '8', code: 'BK-2024-008', date: '2024-03-15', partnerCode: 'SUP-003', orderCode: 'ORD-1008', description: 'Phí vận chuyển nội địa', category: 'Vận chuyển', amount: 9200000, currency: 'VND', status: 'cancelled', note: 'Hủy theo yêu cầu' },
  { id: '9', code: 'BK-2024-009', date: '2024-03-18', partnerCode: 'SUP-002', orderCode: 'ORD-1009', description: 'Phí lưu kho bổ sung', category: 'Lưu kho', amount: 3100000, currency: 'VND', status: 'paid', note: '' },
  { id: '10', code: 'BK-2024-010', date: '2024-03-20', partnerCode: 'SUP-005', orderCode: 'ORD-1010', description: 'Phí xử lý thông quan', category: 'Hải quan', amount: 12000000, currency: 'VND', status: 'confirmed', note: '' },
  { id: '11', code: 'BK-2024-011', date: '2024-03-22', partnerCode: 'SUP-001', orderCode: 'ORD-1011', description: 'Phí vận chuyển tuyến HAN-HCM', category: 'Vận chuyển', amount: 7800000, currency: 'VND', status: 'draft', note: '' },
  { id: '12', code: 'BK-2024-012', date: '2024-03-25', partnerCode: 'SUP-004', orderCode: 'ORD-1012', description: 'Phí kiểm định hàng hóa', category: 'Xử lý', amount: 4500000, currency: 'VND', status: 'paid', note: 'Đã thanh toán đầy đủ' },
  { id: '13', code: 'BK-2024-013', date: '2024-03-27', partnerCode: 'SUP-002', orderCode: 'ORD-1013', description: 'Phí vận chuyển hàng lạnh', category: 'Vận chuyển', amount: 18500000, currency: 'VND', status: 'confirmed', note: '' },
  { id: '14', code: 'BK-2024-014', date: '2024-03-28', partnerCode: 'SUP-003', orderCode: 'ORD-1014', description: 'Phí lưu kho lạnh tháng 3', category: 'Lưu kho', amount: 6200000, currency: 'VND', status: 'draft', note: '' },
  { id: '15', code: 'BK-2024-015', date: '2024-03-30', partnerCode: 'SUP-005', orderCode: 'ORD-1015', description: 'Phí đóng gói đặc biệt', category: 'Đóng gói', amount: 3300000, currency: 'VND', status: 'confirmed', note: '' },
  { id: '16', code: 'BK-2024-016', date: '2024-04-01', partnerCode: 'SUP-001', orderCode: 'ORD-1016', description: 'Phí vận chuyển tháng 4', category: 'Vận chuyển', amount: 14200000, currency: 'VND', status: 'draft', note: '' },
  { id: '17', code: 'BK-2024-017', date: '2024-04-03', partnerCode: 'SUP-002', orderCode: 'ORD-1017', description: 'Phí lưu kho tháng 4', category: 'Lưu kho', amount: 4800000, currency: 'VND', status: 'draft', note: '' },
  { id: '18', code: 'BK-2024-018', date: '2024-04-05', partnerCode: 'SUP-004', orderCode: 'ORD-1018', description: 'Phí hải quan lô B', category: 'Hải quan', amount: 9100000, currency: 'VND', status: 'draft', note: '' },
  { id: '19', code: 'BK-2024-019', date: '2024-04-08', partnerCode: 'SUP-003', orderCode: 'ORD-1019', description: 'Phí xử lý hàng nguy hiểm', category: 'Xử lý', amount: 22000000, currency: 'VND', status: 'draft', note: 'Cần phê duyệt đặc biệt' },
  { id: '20', code: 'BK-2024-020', date: '2024-04-10', partnerCode: 'SUP-005', orderCode: 'ORD-1020', description: 'Phí bảo hiểm lô hàng tháng 4', category: 'Bảo hiểm', amount: 6700000, currency: 'VND', status: 'draft', note: '' },
];

export const STATUS_LABELS: Record<CostStatementRow['status'], string> = {
  draft: 'Nháp',
  confirmed: 'Xác nhận',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
};
