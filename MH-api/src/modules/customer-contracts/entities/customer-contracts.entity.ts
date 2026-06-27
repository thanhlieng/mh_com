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

@Entity({ name: 'customer_contract' })
export class CustomerContractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomersEntity, (customer) => customer.id)
  @Column({ nullable: false , type: 'uuid', name: 'customer_id'})
  @JoinColumn({name: 'customer_id'})
  customerId: string;

  @Column({ nullable: true, name: 'company_name' })
  companyName: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true, name: 'bank_account_number' })
  bankAccountNumber: string;

  @Column({ nullable: true, name: 'bank_code' })
  bankCode: string;

  @Column({ nullable: false, name: 'tax_code' })
  taxCode: string;

  @Column({ nullable: true, name: 'nominee_name' })
  nomineeName: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: false, name: 'payment_date' })
  paymentDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
