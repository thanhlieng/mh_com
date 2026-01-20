import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'categories_post' })
export class CategoriesPostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, name: 'name_vi', default: '' })
  nameVi: string;

  @Column({ nullable: false, name: 'name_en', default: '' })
  nameEn: string;

  @Column({ nullable: true, name: 'thumbnail' })
  thumbnail: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
