import { ServiceEntity } from 'src/modules/services-booking/entities/services.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomersEntity } from './customers.entity';
import { OtherPriceEntity } from './other-price.entity';

@Entity({ name: 'price_list' })
export class PriceListEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomersEntity, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'service_request_id' })
  @Column({ name: 'service_request_id', nullable: true })
  serviceRequestId: string; // Dịch vụ yêu cầu /service/small-service

  @Column({ name: 'potential_revenue_from', nullable: true, type: 'float' })
  potentialRevenueFrom: number; // Doanh thu tiềm năng từ

  @Column({ name: 'potential_revenue_to', nullable: true, type: 'float' })
  potentialRevenueTo: number; // Doanh thu tiềm năng đến

  @Column({ name: 'fixed_price_code', nullable: true })
  fixedPriceCode?: string; // Mã bảng giá cố định // Enum EFixedPriceCode

  @Column({ name: 'price_code_document', nullable: true })
  priceCodeDocument?: string; // Mã bảng giá chứng từ

  @Column({ name: 'light_price_code', nullable: true })
  lightPriceCode?: string; // Mã bảng giá hàng nhẹ

  @Column({ name: 'heavy_price_code', nullable: true })
  heavyPriceCode?: string; // Mã bảng giá hàng nặng 

  @Column({ name: 'lkd_rate', nullable: true, type: 'float' })
  lkdRate?: number; // Tỷ lệ LKD/Giá bán gốc chưa phụ phí

  @Column({ nullable: true })
  surcharge?: string; // Phụ phí xăng dầu áp dụng

  @Column({ name: 'exchange_rate', nullable: true })
  exchangeRate?: string; //Tỷ giá

  @Column({ name: 'time_apply_from', nullable: true })
  timeApplyFrom?: Date; // Từ ngày

  @Column({ name: 'time_apply_to', nullable: true })
  timeApplyTo?: Date; // Đến ngày

  @Column({ name: 'other_price', nullable: true })
  otherPrice?: string;

  @Column({ name: 'discount_rate', nullable: true })
  discountRate?: string;

  @Column({ name: 'note_price_list', nullable: true })
  notePriceList?: string;

  @Column({ name: 'note_price_list_2', nullable: true })
  notePriceList2?: string;

  @Column({ name: 'price_list_requested', nullable: true })
  priceListRequested: string; // 'Bảng giá yêu cầu'

  @Column('character varying', { nullable: true, array: true })
  files: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OtherPriceEntity, (otherPrice) => otherPrice.priceListId, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'id' })
  otherPrices: OtherPriceEntity[];
}
