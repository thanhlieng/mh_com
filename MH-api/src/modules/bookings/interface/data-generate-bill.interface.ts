export interface IDataGenerateBill {
  mapShippingItem: string;
  sumPieces: string;
  sumWeight: string;
  status: string;
  sumWeightCharge: string;
  htmlDemensions: string;
  bookingType: string;
  bookingTypeV2: string;
  note: string;
  collectCharge: string;

  senderPostalCode: string;
  senderCountry: string;
  senderProvince: string;
  senderPhoneNumber: string;
  senderAddressEn: string;
  senderNameEn: string;
  senderContactPerson: string;
  senderDepartment: string;
  senderNote: string;
  receiverCountry;
  receiverPostalCode: string;
  receiverProvince: string;
  receiverPhoneNumber: string;
  receiverAddress: string;
  receiverName: string;
  receiverContactPerson: string;
  receiverDepartment: string;
  receiverNote: string;

  customerCode: string;
  customsDeclarationNumber: string;
  deliveryConditionName: string;
  bookingCode: string;

  createdDate: string;
}

export interface IDataGenerateInvoice {
  invoiceType: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerCode: string;
  bookingCode: string;

  senderName: string;
  senderAddress: string;
  senderTown: string;
  senderProvince: string;
  senderCountry: string;
  senderPostalCode: string;
  senderContactPerson: string;
  senderPhoneNumber: string;

  receiverName: string;
  receiverAddress: string;
  receiverTown: string;
  receiverProvince: string;
  receiverCountry: string;
  receiverPostalCode: string;
  receiverContactPerson: string;
  receiverPhoneNumber: string;

  importers: string;
  currencyUnitCode: string;

  htmlShowListInvoiceDetail: string;
  totalItem: string;
  amount: string;
  deliveryCondition: string;
  totalBaleNumber: number;
  totalNetWeight: any;
  totalBulkyWeight: any;
  reasonExport: string;
  dimension: string;
}
