import { EAddressBookingType } from 'src/common/constants/common.constants';
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

@Entity({ name: 'address_books' })
export class AddressBookEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  ////////////////  Sender  /////////////////

  @Column({ nullable: true, name: 'sender_name_vi' })
  senderNameVi: string;

  @Column({ nullable: true, name: 'sender_name_en' })
  senderNameEn: string;

  @Column({
    nullable: true,
    name: 'sender_address_vi',
  })
  senderAddressVi: string;

  @Column({
    nullable: true,
    name: 'sender_address_en',
  })
  senderAddressEn: string;

  @Column({
    nullable: true,
    name: 'sender_address_en_1',
    default: '',
  })
  senderAddressEn1: string;

  @Column({
    nullable: true,
    name: 'sender_address_en_2',
    default: '',
  })
  senderAddressEn2: string;

  @Column({
    nullable: true,
    name: 'sender_address_en_3',
    default: '',
  })
  senderAddressEn3: string;

  @Column({ nullable: true, name: 'sender_contact_person' })
  senderContactPerson: string;

  @Column({
    nullable: true,
    name: 'sender_department',
  })
  senderDepartment: string;

  @Column({ nullable: true, name: 'sender_phone_number' })
  senderPhoneNumber: string;

  @Column({ nullable: true, name: 'sender_phone_number_2' })
  senderPhoneNumber2: string;

  @Column({ nullable: true, name: 'sender_note' })
  senderNote: string;

  @Column({
    nullable: true,
    name: 'sender_country',
  })
  senderCountry: string;

  @Column({
    nullable: true,
    name: 'sender_province',
  })
  senderProvince: string;

  @Column({
    nullable: true,
    name: 'sender_town',
  })
  senderTown: string;

  @Column({ nullable: true, name: 'sender_postal_code' })
  senderPostalCode: string;

  ///////////// Receiver  //////////////////

  @Column({
    nullable: true,
    name: 'receiver_address',
  })
  receiverAddress: string;

  @Column({
    nullable: false,
    name: 'receiver_address_1',
    default: '',
  })
  receiverAddress1: string;

  @Column({
    nullable: false,
    name: 'receiver_address_2',
    default: '',
  })
  receiverAddress2: string;

  @Column({
    nullable: false,
    name: 'receiver_address_3',
    default: '',
  })
  receiverAddress3: string;

  @Column({ nullable: true, name: 'receiver_name' })
  receiverName: string;

  @Column({ nullable: true, name: 'receiver_postal_code' })
  receiverPostalCode: string;

  @Column({
    nullable: true,
    name: 'receiver_country',
  })
  receiverCountry: string;

  @Column({
    nullable: true,
    name: 'receiver_province',
  })
  receiverProvince: string;

  @Column({
    nullable: true,
    name: 'receiver_town',
  })
  receiverTown: string;

  @Column({ nullable: true, name: 'receiver_contact_person' })
  receiverContactPerson: string;

  @Column({ nullable: true, name: 'receiver_department' })
  receiverDepartment: string;

  @Column({ nullable: true, name: 'receiver_phone_number' })
  receiverPhoneNumber: string;

  @Column({ nullable: true, name: 'receiver_phone_number_2' })
  receiverPhoneNumber2: string;

  @Column({ nullable: true, name: 'receiver_note' })
  receiverNote: string;

  @Column({ nullable: true, enum: EAddressBookingType })
  type: string;

  @ManyToOne(() => CustomersEntity, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  @Column({ nullable: true, name: 'customer_id' })
  customerId: string;

  @Column({ default: false, nullable: true })
  default: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
