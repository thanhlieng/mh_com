export interface IUser {
  username: string;
  status: string;
  typeUser: string;
  phoneCode: string;
  phoneNumber: string;
  permissions: Array<string>;
}

export interface IExprires {
  token: string;
  expires: string;
}

export interface IToken {
  access: IExprires;
  refresh: IExprires;
}

export interface ILogin {
  user: IUser;
  tokens: IToken;
}
