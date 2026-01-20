import { IService } from 'src/modules/services-booking/interface/services.interface';
import { IOtherPrice } from './other-price.interface';
import { ICustomer } from './customers.interface';

export interface IPriceList {
  id?: string;
  customerId?: string;
  serviceRequestId: string; // Dịch vụ yêu cầu /service/small-service
  potentialRevenueFrom: number; // Doanh thu tiềm năng từ
  potentialRevenueTo: number; // Doanh thu tiềm năng đến
  fixedPriceCode?: string; // Mã bảng giá cố định // Enum EFixedPriceCode
  surcharge?: string; // Phụ phí xăng dầu áp dụng
  lkdRate?: number; // Tỷ lệ LKD/Giá bán gốc chưa phụ phí
  exchangeRate?: string; // Tỷ giá
  timeApplyFrom?: Date; // Từ ngày
  timeApplyTo?: Date; // Đến ngày
  otherPrices?: IOtherPrice[];
  otherPrice?: string;
  discountRate?: string;
  notePriceList?: string;
  createdAt?: Date;
  files?: string[];

  serviceRequest?: IService;
  customer?: ICustomer;
}
