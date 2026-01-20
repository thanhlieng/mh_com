import {
  InvoiceItemType,
  InvoiceType,
} from 'src/common/constants/common.constants';
import { BookingEntity } from 'src/modules/bookings/entities/bookings.entity';
import { CurrencyUnitEntity } from 'src/modules/currency-units/entities/currency-units.entity';
import { ServiceEntity } from 'src/modules/services-booking/entities/services.entity';
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
import { ETypeInvoice } from '../invoices.constants';
import { DeliveryConditionsEntity } from 'src/modules/delivery-conditions/entities/delivery-conditions.entity';

@Entity({ name: 'invoice' })
export class InvoiceEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BookingEntity, (booking) => booking.id)
  @Column({ nullable: true, name: 'booking_id', type: 'uuid' })
  @JoinColumn({ name: 'booking_id' })
  bookingId: string;

  @Column({ name: 'type', enum: ETypeInvoice, default: ETypeInvoice.OFFICIAL })
  type: string;

  @Column({ name: 'template_name', nullable: true })
  templateName: string;

  @Column({ name: 'is_additional', default: false })
  isAdditional: boolean;

  @Column({
    nullable: true,
    name: 'type_item_invoice',
    default: InvoiceItemType.CommercialGoods,
  })
  typeItemInvoice: string;

  @Column({
    nullable: true,
    name: 'invoice_type',
    default: InvoiceType.CommercialInvoice,
  })
  invoiceType: string;

  @ManyToOne(
    () => DeliveryConditionsEntity,
    (deliveryCondition) => deliveryCondition.id,
  )
  @JoinColumn({ name: 'delivery_condition_id' })
  @Column({
    nullable: true,
    name: 'delivery_condition_id',
  })
  deliveryConditionId: string;

  @Column({ nullable: true, name: 'sender_information' })
  senderInformation: string;

  @Column({ nullable: true, name: 'receiver_information' })
  receiverInformation: string;

  @Column({ nullable: true, name: 'invoice_date' })
  invoiceDate: Date;

  @Column({ nullable: true })
  importers: string;

  @Column({ nullable: true, name: 'invoice_number' })
  invoiceNumber: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'service_id' })
  @Column({ nullable: true, name: 'service_id' })
  serviceId: string;

  @Column('numeric', { nullable: true, name: 'total_net_weight' })
  totalNetWeight: number;

  @Column('numeric', { nullable: true, name: 'total_bulky_weight' }) //trọng lượng cồng kềnh
  totalBulkyWeight: number;

  @Column('text', { nullable: true, name: 'goods_size' })
  goodsSize: string;

  @Column('numeric', { nullable: true, name: 'total_bale_number' })
  totalBaleNumber: number;

  @ManyToOne(() => CurrencyUnitEntity, (currency) => currency.id)
  @JoinColumn({ name: 'currency_id' })
  @Column({ nullable: true, name: 'currency_id' })
  currencyId: string;

  @Column({ nullable: true, name: 'reason_export' })
  reasonExport: string;

  @Column({ nullable: true, name: 'note' })
  noteInvoice: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
