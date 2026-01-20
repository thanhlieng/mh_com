import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InvoiceEntity } from './invoices.entity';

@Entity({ name: 'invoice_detail' })
export class InvoiceDetailEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.id)
  @Column({ name: 'invoice_id', type: 'uuid' })
  @JoinColumn({ name: 'invoice_id' })
  invoiceId: string;

  @Column({ nullable: false, name: 'goods_name' })
  goodsName: string;

  @Column({ nullable: false })
  describe: string;

  @Column('numeric', { nullable: false })
  quantity: number;

  @Column({ nullable: false, name: 'unit_of_measure' })
  unitOfMeasure: string;

  @Column('numeric', { nullable: false })
  price: number;

  @Column('numeric', { nullable: true, name: 'weight' })
  weight: number;

  @Column({ nullable: false, name: 'origin_of_goods' })
  originOfGoods: string;

  @Column({ nullable: true, name: 'HS_code' })
  HSCode: string;

  @Column('numeric', { nullable: true, name: 'total_money' })
  totalMoney: number;
}
