import { CustomersEntity } from 'src/modules/customers/entities/customers.entity';
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

@Entity({ name: 'receiver_customer' })
export class ReceiverCustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomersEntity, (sender)=> sender.id)
  @Column({ nullable: false, name: 'sender_id', type: 'uuid' })
  @JoinColumn({name: 'sender_id'})
  senderId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, name: 'contact_person_name' })
  contactPersonName: string;

  @Column({ nullable: false })
  mobile: string;

  @Column({ nullable: false, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: false, name: 'phone_code' })
  phoneCode: string;

  @Column({ nullable: false })
  country: string;

  @Column({ nullable: false })
  district: string;

  @Column({ nullable: false })
  province: string;

  @Column({ nullable: false })
  commune: string;

  @Column({ nullable: true, name: 'postal_code' })
  postalCode: string;

  @Column({ nullable: false, name: 'detail_address' })
  detailAddress: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
