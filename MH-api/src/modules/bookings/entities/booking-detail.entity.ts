import { CalculationUnit } from 'src/common/constants/common.constants';
import { CommoditiesTypeEntity } from 'src/modules/commodities-types/entities/commodities-types.entity';
import { ShippingItemEntity } from 'src/modules/shipping-items/entities/shipping-items.entity';
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
import { BookingEntity } from './bookings.entity';

@Entity({ name: 'booking_detail' })
export class BookingDetailEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BookingEntity, (booking) => booking.id)
  @Column({ nullable: true, name: 'booking_id', type: 'uuid' })
  @JoinColumn({ name: 'booking_id' })
  bookingId: string;

  @Column({ nullable: false, name: 'calculation_unit', enum: CalculationUnit })
  calculationUnit: string;

  @ManyToOne(
    () => CommoditiesTypeEntity,
    (commoditiesType) => commoditiesType.id,
  )
  @JoinColumn({ name: 'commodities_type_id' })
  @Column({ nullable: true, name: 'commodities_type_id' })
  commoditiesTypeId: string;

  @ManyToOne(() => ShippingItemEntity, (shippingItem) => shippingItem.id)
  @JoinColumn({ name: 'shipping_item_vi_id' })
  @Column({ nullable: true, name: 'shipping_item_vi_id' })
  shippingItemViId: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false, name: 'origin_item' })
  originItem: string;

  @Column({ nullable: true, name: 'shipping_item_en' })
  shippingItemEn: string;

  @Column({ nullable: false })
  quantity: number;

  @Column('numeric', { nullable: false })
  weight: number;

  @Column('numeric', { nullable: true })
  height: number;

  @Column('numeric', { nullable: true })
  width: number;

  @Column('numeric', { nullable: true })
  longs: number;

  @Column('numeric', { nullable: true, name: 'bulky_weight' })
  bulkyWeight: number;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
