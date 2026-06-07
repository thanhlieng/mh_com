import { ICustomer } from '../customers/interface/customers.interface';
import { IStaffs } from '../staffs/staffs.interface';

export interface IUser {
  id?: string;
  username: string;
  roleId: string;
  status: string;
  password: string;
  salt: string;
  type: string;
  a_supplier_id?: string | null;
  a_customer_id?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  customer?: ICustomer;
  staff?: IStaffs;
}
