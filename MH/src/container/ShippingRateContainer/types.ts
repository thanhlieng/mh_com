export type RateStatus = 'Đang áp dụng' | 'Hết hiệu lực' | 'Nháp';

/** Một dòng chi phí vận chuyển theo tuyến đường đã tạo */
export interface ShippingRate {
  id: string;
  routeCode: string;      // Mã tuyến
  origin: string;         // Điểm đi
  destination: string;    // Điểm đến
  vehicleType: string;    // Loại phương tiện
  unit: string;           // Đơn vị tính (kg, m³, chuyến...)
  price: number;          // Đơn giá (VND)
  effectiveDate: string;  // Ngày áp dụng (YYYY-MM-DD)
  status: RateStatus;
}
