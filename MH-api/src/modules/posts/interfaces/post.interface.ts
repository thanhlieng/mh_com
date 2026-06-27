export interface IPost {
  id?: string;
  categoryId: string;
  titleVi: string;
  titleEn: string;
  thumbnail: string;
  descriptionVi: string;
  descriptionEn: string;
  contentVi: string;
  contentEn: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
