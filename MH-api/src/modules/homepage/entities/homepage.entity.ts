import {
  EHomePage,
  ETypeLinkHomepage,
} from 'src/common/constants/common.constants';
import { CategoriesPostEntity } from 'src/modules/posts/entities/categories-post.entity';
import { PostsEntity } from 'src/modules/posts/entities/posts.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'homepage' })
export class HomePageEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: '', name: 'name_vi' })
  nameVi: string;

  @Column({ nullable: false, default: '', name: 'name_en' })
  nameEn: string;

  @Column({ nullable: true })
  link: string;

  @Column({
    name: 'type_link',
    enum: ETypeLinkHomepage,
    nullable: false,
    default: ETypeLinkHomepage.LINK,
  })
  typeLink: string;

  @ManyToOne(() => CategoriesPostEntity, (category) => category.id)
  @JoinColumn({ name: 'category_id' })
  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => PostsEntity, (post) => post.id)
  @JoinColumn({ name: 'post_id' })
  @Column({ name: 'post_id', nullable: true })
  postId: string;

  @Column({ enum: EHomePage })
  type: string;

  @Column()
  position: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
