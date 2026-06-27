import { BookingStatus, BookingType } from 'src/common/constants/common.constants';
import { CustomersEntity } from 'src/modules/customers/entities/customers.entity';
import { DeliveryConditionsEntity } from 'src/modules/delivery-conditions/entities/delivery-conditions.entity';
import { ServiceEntity } from 'src/modules/services-booking/entities/services.entity';
import { StaffsEntity } from 'src/modules/staffs/entities/staffs.entity';
import { TypeOfPaymentEntity } from 'src/modules/type-of-payments/entities/type-of-payments.entity';
import { UnitsEntity } from 'src/modules/units/entities/units.entity';
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

@Entity({ name: 'booking' })
export class BookingEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'origin_of_country', nullable: true, type: 'varchar' })
  originOfCountry: string;

  // @Column({ name: 'partner_code_mapping', nullable: true })
  // partnerCodeMapping: string;

  @Column({ name: 'reference_code', nullable: true })
  referenceCode: string;

  @ManyToOne(() => UnitsEntity, (unit) => unit.id)
  @JoinColumn({ name: 'unit_id' })
  @Column({ name: 'unit_id', nullable: true })
  unitId: string;

  @Column({ nullable: false, default: false, name: 'is_invoice' })
  isInvoice: boolean;

  @Column({ nullable: false, enum: BookingType })
  type: string;

  @Column({ nullable: false, unique: true, name: 'booking_code' })
  bookingCode: string;

  @ManyToOne(() => CustomersEntity, (customer) => customer.id, {
    cascade: true,
  })
  @Column({ nullable: false, name: 'customer_id', type: 'uuid' })
  @JoinColumn({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'service_booking_id' })
  @Column({ nullable: false, name: 'service_booking_id' })
  serviceBookingId: string;

  // This for split booking task
  @Column({ nullable: true, name: 'parent_booking_manifest_id' })
  @ManyToOne(() => BookingEntity, (booking) => booking.id)
  @JoinColumn({ name: 'parent_booking_manifest_id' })
  parentBookingManifestId: string;

  @Column({ name: 'is_splited_booking_manifest', default: false })
  isSplitedBookingManifest: boolean;

  @Column({ nullable: false, name: 'estimate_date' })
  estimatedDate: Date;

  @Column({ nullable: false, name: 'estimate_hour', default: '00:00' })
  estimateHour: string;

  @ManyToOne(() => DeliveryConditionsEntity, (deliveryCondition) => deliveryCondition.id)
  @JoinColumn({ name: 'delivery_condition_id' })
  @Column({
    nullable: false,
    name: 'delivery_condition_id',
  })
  deliveryConditionId: string;

  @Column({ nullable: true, name: 'other_delivery_conditions' })
  otherDeliveryConditions: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  payment: string;

  @ManyToOne(() => TypeOfPaymentEntity, (typeOfPayment) => typeOfPayment.id)
  @JoinColumn({ name: 'type_of_payment_id' })
  @Column({ nullable: false, name: 'type_of_payment_id' })
  typeOfPaymentId: string;

  @Column({ nullable: true, name: 'oder_account_foreign' })
  oderAccountForeign: string;

  @Column({
    nullable: true,
    default: false,
    name: 'is_customer_create_declaration',
  })
  isCustomerCreateDeclaration: boolean;

  @Column({
    nullable: true,
    default: false,
    name: 'is_customs_declaration',
  })
  isCustomsDeclaration: boolean;

  @Column({ nullable: true, name: 'customs_declaration_number' })
  customsDeclarationNumber?: string;

  @Column({ nullable: true, name: 'parent_booking' })
  parentBooking: string;

  @Column({ nullable: false, default: false, name: 'is_created_small_booking' })
  isCreatedSmallBooking: boolean;

  ////////////////  Sender  /////////////////

  @Column({ nullable: true, name: 'sender_name_vi', default: '' })
  senderNameVi: string;

  @Column({ nullable: true, name: 'sender_name_en' })
  senderNameEn: string;

  @Column({
    nullable: true,
    name: 'sender_address_vi',
    default: '',
  })
  senderAddressVi: string;

  @Column({
    nullable: true,
    name: 'sender_address_en',
    default: '',
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

  @Column({ nullable: false, name: 'sender_contact_person' })
  senderContactPerson: string;

  @Column({
    nullable: true,
    name: 'sender_department',
  })
  senderDepartment: string;

  @Column({ nullable: false, name: 'sender_phone_number' })
  senderPhoneNumber: string;

  @Column({ nullable: true, name: 'sender_phone_number_2' })
  senderPhoneNumber2: string;

  @Column({ nullable: true, name: 'sender_note' })
  senderNote: string;

  @Column({ nullable: true, name: 'sender_other_shipping_address' })
  senderOtherShippingAddress: string;

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
    nullable: false,
    name: 'receiver_address',
    default: '',
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

  @Column({ nullable: false, name: 'receiver_name' })
  receiverName: string;

  @Column({ nullable: true, name: 'receiver_postal_code' })
  receiverPostalCode: string;

  @Column({
    nullable: false,
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

  @Column({ nullable: false, name: 'receiver_contact_person' })
  receiverContactPerson: string;

  @Column({ nullable: true, name: 'receiver_department' })
  receiverDepartment: string;

  @Column({ nullable: false, name: 'receiver_phone_number' })
  receiverPhoneNumber: string;

  @Column({ nullable: true, name: 'receiver_phone_number_2' })
  receiverPhoneNumber2: string;

  @Column({ nullable: true, name: 'receiver_note' })
  receiverNote: string;

  ///////////////////////////////////////

  @Column({ nullable: true, default: false, name: 'is_handle' })
  isHandle: boolean;

  @Column({ nullable: false, default: BookingStatus.NOT_YET_HANDED_OVER })
  status: string;

  @Column({ type: 'bigint', nullable: true })
  total: number;

  @Column({ type: 'bigint', nullable: true })
  vat: number;

  @Column({ type: 'bigint', nullable: true })
  amount: number;

  @Column({ nullable: true, name: 'partner_bill_code' })
  partnerBillCode: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'partner_service' })
  @Column({
    nullable: true,
    name: 'partner_service',
  })
  partnerService: string;

  @Column({ name: 'manufacture', nullable: true })
  manufacture?: string;

  @Column({ name: 'partner_bill_code_domestic', nullable: true })
  partnerBillCodeDomestic?: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'partner_service_domestic' })
  @Column({ name: 'partner_service_domestic', nullable: true })
  partnerServiceDomestic?: string;

  @Column({ name: 'manufacture_domestic', nullable: true })
  manufactureDomestic?: string;

  @Column({ name: 'partner_bill_code_foreign', nullable: true })
  partnerBillCodeForeign?: string;

  @ManyToOne(() => ServiceEntity, (service) => service.id)
  @JoinColumn({ name: 'partner_service_foreign' })
  @Column({ name: 'partner_service_foreign', nullable: true })
  partnerServiceForeign?: string;

  @Column({ name: 'manufacture_foreign', nullable: true })
  manufactureForeign?: string;

  @Column({ name: 'value_added_service_1', nullable: true })
  valueAddedService1?: string;

  @Column({ name: 'value_added_service_2', nullable: true })
  valueAddedService2?: string;

  @Column({ name: 'value_added_service_3', nullable: true })
  valueAddedService3?: string;

  @Column('integer', { name: 'dhl', nullable: true, array: true })
  dhl?: number[];

  @Column('integer', { name: 'fedex', nullable: true, array: true })
  fedex?: number[];

  @Column('integer', { name: 'ups', nullable: true, array: true })
  ups?: number[];

  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'pickup_id' })
  @Column({ name: 'pickup_id', nullable: true })
  pickupId: string;

  @Column({ name: 'reason_cancel_booking', nullable: true })
  reasonCancelBooking: string;

  // handle manifest yamato
  @Column({ name: 'package_id_manifest', nullable: true })
  packageID: string;

  @Column({ name: 'reference_no_manifest', nullable: true })
  referenceNoManifest: string; // Mã bill đối tác khác

  @Column('numeric', { name: 'gw_manifest', nullable: true })
  gwManifest: number; //Cân nặng cồng kềnh

  @Column('numeric', { name: 'freight_charge_manifest', nullable: true })
  freightChargeManifest: number; // Xác định thông qua Payment term

  @Column({ name: 'item_name_manifest', nullable: true })
  itemNameManifest: string;

  @Column('numeric', { name: 'length_manifest', nullable: true })
  lengthManifest: number;

  @Column('numeric', { name: 'width_manifest', nullable: true })
  widthManifest: number;

  @Column('numeric', { name: 'height_manifest', nullable: true })
  heightManifest: number;

  @Column({ name: 'consignee_name_japanese_manifest', nullable: true })
  consigneeNameJapaneseManifest: string;

  @Column({ name: 'consignee_code_manifest', nullable: true })
  consigneeCodeManifest: string;

  @Column({ name: 'registered_company_name_manifest', nullable: true })
  registeredCompanyNameManifest: string;

  @Column({ name: 'address_manifest', nullable: true })
  addressManifest: string;

  @Column({ name: 'qty_manifest', nullable: true })
  qtyManifest: number;

  @Column({ name: 'uom_manifest', nullable: true })
  uomManifest: string;

  @Column('numeric', { name: 'unit_price_manifest', nullable: true })
  unitPriceManifest: number;

  @Column({ name: 'invoice_cur_manifest', nullable: true })
  invoiceCurManifest: string;

  @Column({ name: 'payment_term_manifest', nullable: true })
  paymentTermManifest: number;

  @Column({ name: 'partner_invoice_manifest', nullable: true })
  partnerInvoiceManifest: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'canceled_date', nullable: true })
  canceledAt: Date;
}
