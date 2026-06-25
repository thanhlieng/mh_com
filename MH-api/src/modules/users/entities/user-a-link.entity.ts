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
 * Loại liên kết của một tài khoản mhcom với thực thể bên A.
 * Một tài khoản chỉ thuộc đúng MỘT loại (supplier HOẶC customer),
 * nhưng có thể liên kết với NHIỀU thực thể cùng loại đó.
 */
export enum EALinkType {
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
}

/**
 * Target hệ A mà link trỏ tới. Một account có thể liên kết đồng thời với
 * nhiều thực thể ở cả hai target — switcher trên web mhcom chọn target tại
 * runtime để route các API proxy.
 */
export enum EATarget {
  MHVN = 'mhvn',
  GP = 'gp',
}

/**
 * Tập liên kết account mhcom ↔ các id thực thể bên A.
 * `a_entity_id` chính là `a_supplier_id` (khi link_type='supplier')
 * hoặc `a_customer_id` (khi link_type='customer'), gắn với `a_target`.
 */
@Entity({ name: 'user_a_links' })
@Unique('UQ_user_a_links_user_target_entity', [
  'userId',
  'aTarget',
  'linkType',
  'aEntityId',
])
@Index('IDX_user_a_links_user_type', ['userId', 'linkType'])
@Index('IDX_user_a_links_user_target', ['userId', 'aTarget'])
export class UserALinkEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    name: 'a_target',
    enum: EATarget,
    default: EATarget.MHVN,
  })
  aTarget: EATarget;

  @Column({ type: 'varchar', name: 'link_type', enum: EALinkType })
  linkType: EALinkType;

  @Column({ type: 'varchar', name: 'a_entity_id' })
  aEntityId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
