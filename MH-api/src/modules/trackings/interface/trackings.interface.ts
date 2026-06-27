import { ICheckpoints } from 'src/modules/checkpoints/interface/checkpoints.interface';

export interface IAftershipEstimatedDeliveryDate {
  estimatedDeliveryDate?: Date;
  confidenceScore?: any;
  estimatedDeliveryDateMin?: Date;
  estimatedDeliveryDateMax?: Date;
}

export interface ILatestEstimatedDelivery {
  type?: string;
  source?: string;
  datetime?: Date;
  datetimeMin?: Date;
  datetimeMax?: Date;
}

export interface ITrackings {
  id?: string;
  bookingId?: string;
  trackingNumber?: string;
  title?: string;
  note?: string;
  originCountryIso3?: string;
  descriptionCountryIso3?: string;
  courierDestinationCountryIso3?: string;
  shipmentPackageCount?: number;
  active?: boolean;
  orderId?: string;
  orderIdPath?: string;
  orderDate?: Date;
  customerName?: string;
  source?: string;
  tag?: string;
  subtag?: string;
  subtagMessage?: string;
  trackedCount?: number;
  expectedDelivery?: Date;
  shipmentType?: string;
  slug?: string;
  uniqueToken?: string;
  path?: string;
  shipmentWeight?: number;
  shipmentWeightUnit?: string;
  deliveryTime?: number;
  language?: string;
  shipmentPickupDate?: string;
  shipmentDeliveryDate?: string;
  latestMessage?: string;
  orderPromisedDeliveryDate?: Date;
  deliveryType?: string;
  pickupLocation?: string;
  pickupNote?: string;
  trackingAccountNumber?: string;
  trackingOriginCountry?: string;
  trackingDestinationCountry?: string;
  trackingKey?: string;
  trackingPostalCode?: string;
  trackingShipDate?: Date;
  trackingState?: string;
  onTimeStatus?: string;
  onTimeDifference?: number;
  aftershipEstimatedDeliveryDate?: IAftershipEstimatedDeliveryDate;
  orderNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
  latestEstimatedDelivery?: ILatestEstimatedDelivery;

  checkpoints?: ICheckpoints[];
}
