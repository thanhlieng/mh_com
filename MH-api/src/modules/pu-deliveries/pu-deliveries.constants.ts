export enum CargoListError {
  CARGO_LIST_FILE_IS_REQUIRED = 'Vui lòng kiểm tra lại file bảng kê',
  INVALID_CARGO_LIST_FILE = 'File không đúng định dạng, vui lòng kiểm tra lại',
  NOT_FOUND_ANY_BOOKING = 'Khách hàng không có bất kì đơn hàng nào cần thanh toán',
}

export enum ECurrency {
  USD = 'USD',
  VND = 'VND',
}

export const TemplateCargoListFile = [
  'STT',
  'Ngày',
  'Số bill gốc',
  'Số bill đối tác',
  'Mã khách hàng',
  'Tên khách hàng',
  'Kinh doanh',
  'Loại gửi',
  'Nước gửi',
  'Dịch vụ gửi',
  'TL tính cước',
  'Giá bán\r\nUSD',
  'Giá bán\r\nVNĐ',
  'LKD/Giá bán\r\nUSD',
  'LKD/Giá bán\r\nVNĐ',
  'Tổng PP+/Giá\r\nUSD',
  'Tổng PP+/Giá\r\nVNĐ',
  'Tổng giá bán\r\nUSD',
  'Tổng giá bán\r\nVNĐ',
  'PPXD\r\nUSD',
  'PPXD\r\nVNĐ',
  'Tổng PP Ngoài\r\nUSD',
  'Tổng PP Ngoài\r\nVNĐ',
  'Tổng Doanh số\r\nUSD',
  'Tổng Doanh số\r\nVNĐ',
  'VAT \r\nUSD',
  'Tổng Doanh số Cả VAT\r\nUSD',
  'VAT\r\nVNĐ',
  'Tổng Doanh số Cả VAT\r\nVNĐ',
];
