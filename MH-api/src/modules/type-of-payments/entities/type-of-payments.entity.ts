import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'type_of_payment' })
export class TypeOfPaymentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({nullable: true})
  key: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
