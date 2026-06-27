import { BookingEntity } from 'src/modules/bookings/entities/bookings.entity';
import { TrackingsEntity } from 'src/modules/trackings/entities/trackings.entity';
import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'checkpoints' })
export class CheckpointsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TrackingsEntity, (tracking) => tracking.id)
  @JoinColumn({ name: 'tracking_id' })
  @Column({ name: 'tracking_id', nullable: true })
  trackingId: string;

  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, name: 'country_name' })
  countryName: string;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true, name: 'country_iso3' })
  countryIso3: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  sugtag: string;

  @Column({ nullable: true, name: 'sugtag_message' })
  sugtagMessage: string;

  @Column({ nullable: true, name: 'checkpoint_time' })
  checkpointTime: string;

  @Column('text', { name: 'coordinates', nullable: true, array: true })
  coordinates: string[];

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zip: string;

  @Column({ nullable: true, name: 'raw_tag' })
  rawTag: string;

  @Column({ nullable: true, name: 'is_aftership_data' })
  isAftershipData: boolean;

  @Column({ nullable: true, name: 'timezone' })
  timezone: string;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
