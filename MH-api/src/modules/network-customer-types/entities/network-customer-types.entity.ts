import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'network_customer_types' })
export class NetworkCustomerTypeEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
