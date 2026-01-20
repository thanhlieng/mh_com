import { BookingEntity } from 'src/modules/bookings/entities/bookings.entity';
import { ConnectBillEntity } from 'src/modules/connect-bill/entities/connect-bill.entity';
import { ServiceEntity } from 'src/modules/services-booking/entities/services.entity';
import { StaffsEntity } from 'src/modules/staffs/entities/staffs.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'pu_deliveries' })
export class PuDeliveriesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // This column for the split booking
  @Column({ nullable: true, name: 'parent_booking_manifest_id' })
  @ManyToOne(() => PuDeliveriesEntity, (pu_deliveries) => pu_deliveries.id)
  @JoinColumn({ name: 'parent_booking_manifest_id' })
  parentBookingManifestId: string;

  @Column({ name: 'is_splited_booking', default: false })
  isSplitedBooking: boolean;

  @Column({ nullable: true, name: 'booking_id', unique: true })
  @ManyToOne(() => BookingEntity, (booking) => booking.id)
  @JoinColumn({ name: 'booking_id' })
  bookingId: string;

  @Column({ nullable: true, name: 'pu_staff_id' })
  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'pu_staff_id' })
  puStaffId: string;

  @Column({ nullable: true, name: 'sales_staff_id' })
  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'sales_staff_id' })
  salesStaffId: string;

  @Column({ nullable: true, name: 'checkin_staff_id' })
  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'checkin_staff_id' })
  checkinStaffId: string;

  @Column({ nullable: true, name: 'checkout_staff_id' })
  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'checkout_staff_id' })
  checkoutStaffId: string;

  @Column({ nullable: true, name: 'manifest_staff_id' })
  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'manifest_staff_id' })
  manifestStaffId: string;

  @ManyToOne(() => ConnectBillEntity, (connectBill) => connectBill.id)
  @JoinColumn({ name: 'connect_bill_id' })
  @Column({ name: 'connect_bill_id', nullable: true })
  connectBillId: string;

  @Column({ nullable: true })
  status: number;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  quantity: number;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'service_booking_id' })
  @Column({ nullable: true, name: 'service_booking_id' })
  serviceBookingId: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'require_partner_service_id' })
  @Column({ name: 'require_partner_service_id', nullable: true })
  requirePartnerServiceId: string;

  @Column({ nullable: true, name: 'content_detail' })
  contentDetail: string;

  @Column({ nullable: true, name: 'customs_declaration_number' })
  customsDeclarationNumber: string;

  @Column({ nullable: true })
  note: string;

  @Column({ name: 'booking_partner_bill_code', nullable: true })
  bookingPartnerBillCode?: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'booking_partner_service' })
  @Column({ name: 'booking_partner_service', nullable: true })
  bookingPartnerService?: string;

  @Column({ name: 'content_detail_invoice', nullable: true })
  contentDetailInvoice?: string;

  @Column({ name: 'information_receiver_address', nullable: true })
  informationReceiverAddress?: string;

  // All columns below for cargo list and statistics
  @Column({ name: 'billable_weight', nullable: true, type: 'numeric' })
  billableWeight: number; // Trọng lượng tính cước

  @Column({ name: 'price_usd', nullable: true, type: 'numeric' })
  priceUSD: number; // Giá bán USD

  @Column({ name: 'price_vnd', nullable: true, type: 'numeric' })
  priceVND: number; // Giá bán VNĐ

  @Column({ name: 'lkd_price_usd', nullable: true, type: 'numeric' })
  lkdPriceUSD: number; // LKD/Giá bán

  @Column({ name: 'lkd_price_vnd', nullable: true, type: 'numeric' })
  lkdPriceVND: number; // LKD/Giá bán

  @Column({ name: 'total_pp_usd', nullable: true, type: 'numeric' })
  totalPPUSD: number; // Tống PP+/Giá

  @Column({ name: 'total_pp_vnd', nullable: true, type: 'numeric' })
  totalPPVND: number; // Tổng PP+/Giá

  @Column({ name: 'total_selling_price_usd', nullable: true, type: 'numeric' })
  totalSellingPriceUSD: number; // Tống giá bán

  @Column({ name: 'total_selling_price_vnd', nullable: true, type: 'numeric' })
  totalSellingPriceVND: number; // Tổng giá bán

  @Column({ name: 'ppxd_usd', nullable: true, type: 'numeric' })
  PPXDUSD: number; // PPXD USD

  @Column({ name: 'ppxd_vnd', nullable: true, type: 'numeric' })
  PPXDVND: number; // PPXD VNĐ

  @Column({ name: 'total_external_pp_usd', nullable: true, type: 'numeric' })
  totalExternalPPUSD: number; // Tổng PP Ngoài

  @Column({ name: 'total_external_pp_vnd', nullable: true, type: 'numeric' })
  totalExternalPPVND: number; // Tổng PP Ngoài

  @Column({ name: 'total_sales_usd', nullable: true, type: 'numeric' })
  totalSalesUSD: number; // Tổng Doanh số

  @Column({ name: 'total_sales_vnd', nullable: true, type: 'numeric' })
  totalSalesVND: number; // Tổng Doanh số

  @Column({ name: 'vat_usd', nullable: true, type: 'numeric' })
  VATUSD: number; // VAT USD

  @Column({
    name: 'total_sales_including_vat_usd',
    nullable: true,
    type: 'numeric',
  })
  totalSalesIncludingVATUSD: number; // Tổng doanh số cả VAT

  @Column({ name: 'vat_vnd', nullable: true, type: 'numeric' })
  VATVND: number; // VAT VNĐ

  @Column({
    name: 'total_sales_including_vat_vnd',
    nullable: true,
    type: 'numeric',
  })
  totalSalesIncludingVATVND: number; // Tổng doanh số cả VAT

  @Column({ name: 'note_order_remaining', nullable: true })
  noteOrderRemaining?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
