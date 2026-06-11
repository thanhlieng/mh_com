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
  createdAt?: Date;
  updatedAt?: Date;
  customer?: ICustomer;
  staff?: IStaffs;
}
