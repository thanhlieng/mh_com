export interface IReceiverCustomer {
  id?: string;
  senderId: string;
  name: string;
  contactPersonName: string;
  mobile: string;
  phoneNumber: string;
  phoneCode: string;
  country: string;
  district: string;
  province: string;
  commune: string;
  postalCode?: string;
  detailAddress: string;
  state?: string;
  note?: string;
}
