export interface IContract {
  id?: string;
  customerId?: string;
  service?: string;
  contractCode: string; // Mã hợp đồng
  contractName: string; // Tên hợp đồng
  typeContract: string; // Loại hợp đồng enum ETypeContract
  // Thời hạn hợp đồng
  contractTermFrom?: Date;
  contractTermTo?: Date;
  paymentSchedule: string; // Lịch thanh toán công nợ kể từ ngày chốt bảng kê
  expertise: boolean; // Thẩm định
  appraisalStaff: string; // Nhân viên thẩm định
  files?: string[]; // File hợp đồng
  noteContract?: string;
}
