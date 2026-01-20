import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CategoriesPostEntity } from './categories-post.entity';

@Entity({ name: 'posts' })
export class PostsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CategoriesPostEntity, (category) => category.id)
  @JoinColumn({ name: 'category_id' })
  categoryId: string;

  @Column({ nullable: false, name: 'title_vi', default: '' })
  titleVi: string;

  @Column({ nullable: false, name: 'title_en', default: '' })
  titleEn: string;

  @Column({ nullable: true, name: 'description_vi' })
  descriptionVi: string;

  @Column({ nullable: true, name: 'description_en' })
  descriptionEn: string;

  @Column({ nullable: true, name: 'thumbnail' })
  thumbnail: string;

  @Column({ nullable: true, name: 'content_vi' })
  contentVi: string;

  @Column({ nullable: true, name: 'content_en' })
  contentEn: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
