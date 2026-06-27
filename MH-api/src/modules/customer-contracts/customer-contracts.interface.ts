export interface ICustomerContract {
  id?: string;
  customerId: string;
  companyName: string;
  address?: string;
  phoneNumber: string;
  bankAccountNumber: string;
  bankCode: string;
  taxCode?: string;
  nomineeName: string;
  position: string;
  paymentDate?: string;
}
