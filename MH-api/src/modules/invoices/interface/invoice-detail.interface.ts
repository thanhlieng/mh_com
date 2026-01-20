export interface IInvoiceDetail {
  id?: string;
  invoiceId: string;
  goodsName: string;
  describe: string;
  quantity: number;
  unitOfMeasure: string;
  price: number;
  weight: number;
  originOfGoods: string;
  HSCode: string;
}
