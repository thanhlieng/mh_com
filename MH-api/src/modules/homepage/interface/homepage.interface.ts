import { EHomePage } from 'src/common/constants/common.constants';

export interface IHomepage {
  id?: string;
  type: EHomePage;
  position: number;
  nameVi: string;
  nameEn: string;
  link?: string;
  typeLink: string;
  categoryId?: string;
  postId?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
