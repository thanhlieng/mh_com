import { ICurrencyUnit } from 'src/modules/currency-units/interface/currency-units.interface';
import { IInvoiceDetail } from './invoice-detail.interface';

export interface IInvoice {
  id?: string;
  bookingId: string;
  isAdditional: boolean;
  typeItemInvoice: string;
  invoiceType: string;
  invoiceCode: string;
  senderInformation: string;
  receiverInformation: string;
  invoiceDate: Date;
  importers: string;
  invoiceNumber: string;
  serviceId: string;
  totalNetWeight: number;
  totalBulkyWeight: number;
  goodsSize: string;
  totalBaleNumber: number;
  currencyId: string;
  reasonExport: string;
  note: string;
  deliveryConditionId?: string;

  invoice_detail?: IInvoiceDetail[];

  currencyUnit?: ICurrencyUnit;
}
