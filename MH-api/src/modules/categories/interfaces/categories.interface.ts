import { IItemCategory } from "./item-categories.interface";

export interface ICategory {
  id?: string;
  name: string;
  key?: string;

  items?: IItemCategory[];

  createdAt?: Date;
  updatedAt?: Date;
}