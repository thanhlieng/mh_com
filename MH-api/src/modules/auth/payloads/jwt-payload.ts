export default interface IJwtPayload {
  id: string;
  username: string;
  type: string;
  typeUser: string;
  permissions: string[];
}

export interface IHistoryInfo {
  path?: string;
  ip?: string;
  method?: string;
  updatedBy?: string;
}
