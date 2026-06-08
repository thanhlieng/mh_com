export type PaymentStatus =
  | 'Chờ chi hộ'
  | 'Đã chi hộ'
  | 'Đã đối soát'
  | 'Đã hủy';

export interface PaymentOrder {
  id: string;
  code: string;            // Mã đơn hàng
  aOrderId?: number;       // System A order ID (dùng để gọi API file)
  createdDate: string;     // ISO date string YYYY-MM-DD
  customer: string;        // Khách hàng
  route: string;           // Tuyến đường
  amount: number;          // Số tiền chi hộ (VND)
  status: PaymentStatus;
  fileCount: number;       // Số file đã upload
  note: string;
}

export type UploadedFileType = 'pdf' | 'excel' | 'image' | 'other';

export interface UploadedFile {
  id: string;
  name: string;
  type: UploadedFileType;
  size: number;            // bytes
  uploadedAt: string;      // ISO datetime string
  url?: string;            // object URL hoặc link tải từ server
  /** File gốc khi upload từ trình duyệt (chưa gửi backend) */
  raw?: File;
}
