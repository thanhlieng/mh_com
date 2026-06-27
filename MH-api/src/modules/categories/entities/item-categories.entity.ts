import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CategoryEntity } from "./categories.entity";

@Entity({name: 'item_categories'})
export class ItemCategoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CategoryEntity, (category) => category.id)
  @JoinColumn({name: 'category_id'})
  @Column({name: 'category_id'})
  categoryId: string;

  @Column()
  name: string;

  @Column({nullable: true})
  key: string;

  @Column({name: 'is_default', default: false})
  isDefault: boolean;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;
}