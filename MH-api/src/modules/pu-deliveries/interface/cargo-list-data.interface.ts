export interface ICargoListData {
  id: string; // pd id
  bookingCode: string; // Số bill gốc
  partnerBillCode: string; // Số bill đối tác
  customerCode: string; // Mã khách hàng
  customerName: string; // Tên khách hàng
  businessStaff: string; // Kinh doanh
  shippingType: string; // Loại gửi
  senderCountry: string; // Nước gửi
  service: string; // Dịch vụ gửi
  billableWeight: number; // Trọng lượng tính cước
  priceUSD: number; // Giá bán USD
  priceVND: number; // Giá bán VNĐ
  lkdPriceUSD: number; // LKD/Giá bán
  lkdPriceVND: number; // LKD/Giá bán
  totalPPUSD: number; // Tống PP+/Giá
  totalPPVND: number; // Tổng PP+/Giá
  totalSellingPriceUSD: number; // Tống giá bán
  totalSellingPriceVND: number; // Tổng giá bán
  PPXDUSD: number; // PPXD USD
  PPXDVND: number; // PPXD VNĐ
  totalExternalPPUSD: number; // Tổng PP Ngoài
  totalExternalPPVND: number; // Tổng PP Ngoài
  totalSalesUSD: number; // Tổng Doanh số
  totalSalesVND: number; // Tổng Doanh số
  VATUSD: number; // VAT USD
  totalSalesIncludingVATUSD: number; // Tổng doanh số cả VAT
  VATVND: number; // VAT VNĐ
  totalSalesIncludingVATVND: number; // Tổng doanh số cả VAT
}

// Example data
// [
//   1,
//   "28-05-2023",
//   "893080920287000",
//   "18961805892",
//   "080900107",
//   "CÔNG TY TNHH ĐIỆN TỬ QUẢNG ĐÔNG VŨ HÀO",
//   "00013 - Nguyễn Công Thống",
//   "Hàng hóa",
//   "CN",
//   "OCS",
//   37, // 10
//   301.92, // 11
//   7152485,
//   45.29,
//   1072920,
//   0,
//   0,
//   301.92,
//   7152485,
//   90.58,
//   2145840, // 20
//   10.130856901646265,
//   240000,
//   402.63085690164627,
//   9538325,
//   0,
//   40.26308569016463,
//   442.8939425918109,
//   953833
// ],