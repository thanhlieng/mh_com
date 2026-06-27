export interface IManifestYamato {
  id: string;
  shipDate: Date; // Ship Date
  handlingType: number; // Handling Type
  shipmentType: string; // Shipment Type
  shipperName: string; // Shipper Name
  shipperAdd1: string; // Shipper Add 1
  shipperAdd2: string; //  Shipper Add 2
  shipperAdd3: string; //  Shipper Add 3
  shipperAdd4: string; //  Shipper Add 4
  shipperPostalCode: string; // Shipper Postal Code
  shipperPhone: string; // Shipper Phone
  packageID: string; //=== Package ID
  trackingNo: string; // Tracking No
  referenceNoManifest: string; //=== Reference No
  cneeCompany: string; // Cnee Company
  cneeAdd1: string; // Cnee Add 1
  cneeAdd2: string; // Cnee Add 2
  cneeAdd3: string; // Cnee Add 3
  cneeAdd4: string; // Cnee Add 4
  cneeTel: string; // Cnee Tel
  cneePostalCode: string; // Cnee Postal Code
  cneeNameInKatakana: string; // Cnee Name in Katakana
  gwManifest: number; //=== GW
  unitOfWeight: string; // Unit of weight
  paymentTermManifest: number; // Payment term
  freightChargeManifest: number; //=== Freight Charge
  itemCode: string; // Item code
  itemNameManifest: string; //=== Item name
  originOfCountry: string; // Origin of Country
  qtyManifest: number; // Qty
  uomManifest: string; // UOM
  unitPriceManifest: number; // Unit Price
  invoiceCurManifest: string; // Invoice Cur
  lengthManifest: number; //=== Length
  widthManifest: number; //=== Width
  heightManifest: number; //=== Height
  lengthUnit: string; // Length Unit
  insurance: string; // Insurance
  consigneeNameJapaneseManifest: string; //=== Consignee Japan name
  consigneeCodeManifest: string; //=== Consignee code
  registeredCompanyNameManifest: string; //===  Registered company name
  addressManifest: string; //=== Address
  isUploadedPartnerInvoiceFile?: boolean;
  isInvoice: boolean;
}
