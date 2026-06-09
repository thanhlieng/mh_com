export default interface IJwtPayload {
  id: string;
  username: string;
  type: string;
  typeUser: string;
  permissions: string[];
  a_supplier_id?: string;
  a_customer_id?: string;
}

export interface IHistoryInfo {
  path?: string;
  ip?: string;
  method?: string;
  updatedBy?: string;
}
