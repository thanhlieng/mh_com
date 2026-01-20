import { IShippingItem } from 'src/modules/shipping-items/interface/shipping-items.interface';

export interface IBookingDetail {
  id?: string;
  bookingId?: string;
  calculationUnit: string;
  commoditiesTypeId: string;
  shippingItemViId: string;
  description: string;
  originItem: string;
  shippingItemEn?: string;
  quantity: number;
  weight: number;
  height?: number;
  width?: number;
  longs?: number;
  bulkyWeight?: number;
  note?: string;

  shippingItemVi?: IShippingItem;
}
