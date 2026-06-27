export interface IAddressBook {
  id?: string;
  ////////////////  Sender  /////////////////
  senderNameVi: string;
  senderNameEn?: string;
  senderAddressVi: string;
  senderAddressEn: string;
  senderContactPerson: string;
  senderDepartment: string;
  senderPhoneNumber: string;
  senderNote: string;
  senderCountry: string;
  senderProvince: string;
  senderPostalCode: string;

  ///////////// Receiver  //////////////////

  receiverAddress: string;
  receiverName: string;
  receiverPostalCode: string;
  receiverCountry: string;
  receiverProvince: string;
  receiverContactPerson: string;
  receiverDepartment: string;
  receiverPhoneNumber: string;
  receiverNote: string;

  type: string;
  customerId: string;
  default: boolean;
}
