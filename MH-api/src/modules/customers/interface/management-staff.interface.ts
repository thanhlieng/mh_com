import { IStaffs } from 'src/modules/staffs/staffs.interface';

export interface IManagementStaff {
  id?: string;
  customerId?: string;
  staffId: string;
  typeStaff: string;
  createdAt?: Date;
  updatedAt?: Date;

  staff?: IStaffs;
}
