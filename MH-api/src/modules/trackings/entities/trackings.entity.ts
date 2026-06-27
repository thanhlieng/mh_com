import { BookingEntity } from 'src/modules/bookings/entities/bookings.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IAftershipEstimatedDeliveryDate, ILatestEstimatedDelivery } from '../interface/trackings.interface';

@Entity({ name: 'trackings' })
export class TrackingsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => BookingEntity, (booking) => booking.id)
  @JoinColumn({ name: 'booking_id' })
  @Column({ name: 'booking_id', nullable: false, unique: true })
  bookingId: string;

  @Column({ nullable: true, name: 'tracking_number' })
  trackingNumber: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true, name: 'origin_country_iso3' })
  originCountryIso3: string;

  @Column({ nullable: true, name: 'description_country_iso3' })
  descriptionCountryIso3: string;

  @Column({ nullable: true, name: 'courier_destination_country_iso3' })
  courierDestinationCountryIso3: string;

  @Column({ nullable: true, name: 'shipment_package_count' })
  shipmentPackageCount: number;

  @Column({ nullable: true })
  active: boolean;

  @Column({ nullable: true, name: 'order_id' })
  orderId: string;

  @Column({ nullable: true, name: 'order_id_path' })
  orderIdPath: string;

  @Column({ nullable: true, name: 'order_date' })
  orderDate: Date;

  @Column({ nullable: true, name: 'customer_name' })
  customerName: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  subtag: string;

  @Column({ nullable: true })
  subtagMessage: string;

  @Column({ type: 'decimal', nullable: true, name: 'tracked_count' })
  trackedCount: number;

  @Column({ nullable: true, name: 'expected_delivery' })
  expectedDelivery: Date;

  @Column({ nullable: true, name: 'shipment_type' })
  shipmentType: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true, name: 'unique_token' })
  uniqueToken: string;

  @Column({ nullable: true })
  path: string;

  @Column({ type: 'decimal', nullable: true, name: 'shipment_weight' })
  shipmentWeight: number;

  @Column({ nullable: true, name: 'shipment_weight_unit' })
  shipmentWeightUnit: string;

  @Column({ nullable: true, name: 'delivery_time' })
  deliveryTime: number;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true, name: 'shipment_pickup_date' })
  shipmentPickupDate: string;

  @Column({ nullable: true, name: 'shipment_delivery_date' })
  shipmentDeliveryDate: string;

  @Column({ nullable: true, name: 'order_promised_delivery_date' })
  orderPromisedDeliveryDate: Date;

  @Column({ nullable: true, name: 'delivery_type' })
  deliveryType: string;

  @Column({ nullable: true, name: 'pickup_location' })
  pickupLocation: string;

  @Column({ nullable: true, name: 'pickup_note' })
  pickupNote: string;

  @Column({ nullable: true, name: 'tracking_account_number' })
  trackingAccountNumber: string;

  @Column({ nullable: true, name: 'tracking_origin_country' })
  trackingOriginCountry: string;

  @Column({ nullable: true, name: 'tracking_destination_country' })
  trackingDestinationCountry: string;

  @Column({ nullable: true, name: 'tracking_key' })
  trackingKey: string;

  @Column({ nullable: true, name: 'tracking_postal_code' })
  trackingPostalCode: string;

  @Column({ nullable: true, name: 'tracking_ship_date' })
  trackingShipDate: Date;

  @Column({ nullable: true, name: 'tracking_state' })
  trackingState: string;

  @Column({ nullable: true, name: 'on_time_status' })
  onTimeStatus: string;

  @Column({ type: 'decimal', nullable: true, name: 'on_time_difference' })
  onTimeDifference: number;

  @Column('text', {
    nullable: true,
    name: 'aftership_estimated_delivery_date',
  })
  aftershipEstimatedDeliveryDate: IAftershipEstimatedDeliveryDate;

  @Column({ nullable: true, name: 'order_number' })
  orderNumber: string;

  @Column('text', {
    nullable: true,
    name: 'latest_estimated_delivery',
  })
  latestEstimatedDelivery: ILatestEstimatedDelivery;

  @Column({ name: 'latest_message' })
  latestMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
