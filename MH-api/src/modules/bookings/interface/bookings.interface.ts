import { ICustomer } from 'src/modules/customers/interface/customers.interface';
import { IDeliveryConditions } from 'src/modules/delivery-conditions/interface/delivery-conditions.interface';
import { IInvoice } from 'src/modules/invoices/interface/invoices.interface';
import { IPuDeliveries } from 'src/modules/pu-deliveries/interface/pu-deliveries.interface';
import { IService } from 'src/modules/services-booking/interface/services.interface';
import { ITrackings } from 'src/modules/trackings/interface/trackings.interface';
import { ITypeOfPayment } from 'src/modules/type-of-payments/interface/type-of-payments.interface';
import { IBookingDetail } from './booking-detail.interface';

export interface IBooking {
  id?: string;
  bookingCode?: string;
  isInvoice: boolean;
  type: string;
  customerId?: string;
  serviceBookingId: string;
  estimatedDate: Date;
  estimateHour: string;
  deliveryConditionId: string;
  otherDeliveryConditions?: string;
  note?: string;
  payment?: string;
  typeOfPaymentId: string;
  oderAccountForeign?: string;
  isCustomerCreateDeclaration?: boolean;
  customsDeclarationNumber?: string;
  parentBooking?: string;
  isCreatedSmallBooking?: boolean;
  parentBookingManifestId?: string;
  isSplitedBookingManifest?: boolean;
  referenceCode?: string;

  senderNameVi: string;
  senderNameEn?: string;
  senderAddressVi: string;
  senderAddressEn?: string;
  senderAddressEn1?: string;
  senderAddressEn2?: string;
  senderAddressEn3?: string;
  senderCountry: string;
  senderProvince: string;
  senderTown?: string;
  senderPostalCode?: string;
  senderContactPerson: string;
  senderDepartment?: string;
  senderPhoneNumber: string;
  senderNote?: string;
  senderOtherShippingAddress?: string;

  receiverName: string;
  receiverAddress: string;
  receiverAddress1?: string;
  receiverAddress2?: string;
  receiverAddress3?: string;
  receiverPostalCode: string;
  receiverCountry: string;
  receiverProvince: string;
  receiverTown?: string;
  receiverContactPerson: string;
  receiverDepartment?: string;
  receiverPhoneNumber: string;
  receiverNote?: string;

  status?: string;
  total?: number;
  vat?: number;
  amount?: number;
  isHandle?: boolean;
  reasonCancelBooking?: string;
  canceledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  partnerBillCode?: string;
  partnerService?: string;
  manufacture?: string;
  partnerBillCodeDomestic?: string;
  partnerServiceDomestic?: string;
  manufactureDomestic?: string;
  partnerBillCodeForeign?: string;
  partnerServiceForeign?: string;
  manufactureForeign?: string;
  valueAddedService1?: string;
  valueAddedService2?: string;
  valueAddedService3?: string;
  dhl?: number[];
  fedex?: number[];
  ups?: number[];

  bookingDetail?: IBookingDetail[];
  invoice?: IInvoice;
  customer?: ICustomer;
  service?: IService;
  deliveryCondition?: IDeliveryConditions;
  OPartnerService?: IService;
  service_booking?: IService;
  type_of_payment?: ITypeOfPayment;
  partner_service_domestic?: IService;

  partnerInvoiceManifest?: string;

  tracking?: ITrackings;
  pu_deliveries?: IPuDeliveries;
}

export interface IGetBooking {
  booking: IBooking;
  invoice: IInvoice;
}
