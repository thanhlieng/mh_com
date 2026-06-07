export type CostStatus = 'Chờ xử lý' | 'Đã thanh toán' | 'Chưa thanh toán' | 'Đã hủy';

export interface CostStatementRow {
  id: string;
  billCode: string;
  createdDate: string;       // ISO date string YYYY-MM-DD
  customer: string;
  route: string;
  cargoType: string;
  quantity: number;
  freightCost: number;
  surcharge: number;
  total: number;
  status: CostStatus;
  note: string;
}

export type EditableField = Exclude<keyof CostStatementRow, 'id' | 'total'>;
