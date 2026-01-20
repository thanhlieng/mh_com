import { IZoneService } from 'src/modules/services-booking/interface/zone-servies.interface';

export interface IOtherPrice {
  id?: string;
  priceListId: string;
  countryContractId?: string; // Country hoặc Zone // /service/zone-small-service/:id
  discountRate?: string; // Tỷ lệ giảm giá (Đánh tỷ lệ %)
  noteOtherPrice?: string;

  countryContract?: IZoneService;
}
