import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Index,
  Unique,
} from 'typeorm';

/**
 * Loại liên kết của một tài khoản B với thực thể bên A.
 * Một tài khoản chỉ thuộc đúng MỘT loại (supplier HOẶC customer),
 * nhưng có thể liên kết với NHIỀU thực thể cùng loại đó.
 */
export enum EALinkType {
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
}

/**
 * Tập liên kết account B ↔ các id thực thể bên A.
 * `a_entity_id` chính là `a_supplier_id` (khi link_type='supplier')
 * hoặc `a_customer_id` (khi link_type='customer').
 */
@Entity({ name: 'user_a_links' })
@Unique('UQ_user_a_links_user_entity', ['userId', 'linkType', 'aEntityId'])
@Index('IDX_user_a_links_user_type', ['userId', 'linkType'])
export class UserALinkEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', name: 'link_type', enum: EALinkType })
  linkType: EALinkType;

  @Column({ type: 'varchar', name: 'a_entity_id' })
  aEntityId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
