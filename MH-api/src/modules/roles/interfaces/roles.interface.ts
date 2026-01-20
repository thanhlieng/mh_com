export interface IRoles {
  id?: string;
  name: string;
  permissions: string[];
  active: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
