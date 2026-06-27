import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PuDeliveriesEntity } from './pu-deliveries.entity';
import { ETypePuDeliveryDetail } from 'src/common/constants/common.constants';

@Entity({ name: 'pu_deliveries_detail' })
export class PuDeliveriesDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PuDeliveriesEntity, (puDelivery) => puDelivery.id)
  @JoinColumn({ name: 'pu_delivery_id' })
  @Column({ name: 'pu_delivery_id' })
  puDeliveryId: string;

  @Column({ type: 'float' })
  quantity: number;

  @Column({ type: 'float' })
  weight: number;

  @Column({ type: 'float', name: 'bulky_weight', nullable: true })
  bulkyWeight: number;

  @Column({ type: 'float' })
  height: number;

  @Column({ type: 'float' })
  width: number;

  @Column({ type: 'float' })
  longs: number;

  @Column({
    enum: ETypePuDeliveryDetail,
    default: ETypePuDeliveryDetail.PICKUP,
  })
  type: string;
}
