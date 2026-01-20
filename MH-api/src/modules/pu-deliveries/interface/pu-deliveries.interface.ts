import { IPuDeliveriesDetail } from './pu-deliveries-detail.interface';

export interface IPuDeliveries {
  id?: string;
  bookingId?: string;
  puStaffId?: string;
  connectBillId?: string;
  type: string;
  quantity: number;
  status?: number;
  serviceBookingId: string;
  requirePartnerServiceId: string;
  contentDetail: string;
  customsDeclarationNumber: string;
  note?: string;
  bookingPartnerBillCode?: string;
  bookingPartnerService?: string;
  contentDetailInvoice?: string;
  informationReceiverAddress?: string;
  parentBookingManifestId?: string;

  billableWeight?: number; // Trọng lượng tính cước
  priceUSD?: number; // Giá bán USD
  priceVND?: number; // Giá bán VNĐ
  lkdPriceUSD?: number; // LKD/Giá bán
  lkdPriceVND?: number; // LKD/Giá bán
  totalPPUSD?: number; // Tống PP+/Giá
  totalPPVND?: number; // Tổng PP+/Giá
  totalSellingPriceUSD?: number; // Tống giá bán
  totalSellingPriceVND?: number; // Tổng giá bán
  PPXDUSD?: number; // PPXD USD
  PPXDVND?: number; // PPXD VNĐ
  totalExternalPPUSD?: number; // Tổng PP Ngoài
  totalExternalPPVND?: number; // Tổng PP Ngoài
  totalSalesUSD?: number; // Tổng Doanh số
  totalSalesVND?: number; // Tổng Doanh số
  VATUSD?: number; // VAT USD
  totalSalesIncludingVATUSD?: number; // Tổng doanh số cả VAT
  VATVND?: number; // VAT VNĐ
  totalSalesIncludingVATVND?: number; // Tổng doanh số cả VAT

  details?: IPuDeliveriesDetail[];
}
