import {
  CustomerType,
  ECustomerGroup,
  ECustomerStatus,
  EIdentifierType,
  Gender,
  NetWorkCustomerType,
} from 'src/common/constants/common.constants';
import { CompaniesEntity } from 'src/modules/companies/entities/companies.entity';
import { StaffsEntity } from 'src/modules/staffs/entities/staffs.entity';
import { UnitsEntity } from 'src/modules/units/entities/units.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'customers' })
export class CustomersEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('character varying', {
    name: 'customer_code',
    nullable: false,
    unique: true,
  })
  customerCode: string;

  @Column({ enum: ECustomerStatus, default: ECustomerStatus.ACTIVE, name: 'status' })
  status: string;

  @ManyToOne(() => UnitsEntity, (unit) => unit.id)
  @Column({ nullable: true, name: 'unit_id', type: 'uuid' })
  @JoinColumn({ name: 'unit_id' })
  unitId: string;

  @ManyToOne(() => CompaniesEntity, (company) => company.id)
  @Column({ nullable: true, name: 'company_id', type: 'uuid' })
  @JoinColumn({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => StaffsEntity, (staff) => staff.id)
  @JoinColumn({ name: 'staff_id' })
  @Column({ name: 'staff_id', nullable: true })
  staffId: string;

  @OneToOne(() => UserEntity, (user) => user.id)
  @Column({ nullable: true, name: 'user_id', type: 'uuid' })
  @JoinColumn({ name: 'user_id' })
  userId: string;

  @Column({ nullable: false, name: 'full_name' })
  fullName: string;

  @Column({ nullable: true, name: 'full_name_en' })
  fullNameEn: string;

  @Column({ enum: ECustomerGroup, nullable: true, name: 'customer_group' })
  customerGroup: string;

  @Column({ nullable: false, name: 'detail_address' })
  detailAddress: string;

  @Column({ nullable: true, name: 'detail_address_en' })
  detailAddressEn: string;

  @Column({ nullable: true, name: 'gender', enum: Gender })
  gender: string;

  @Column({ nullable: true, name: 'date_of_birth' })
  dob: Date;

  @Column({ nullable: true })
  commune: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: false })
  country: string;

  @Column({ nullable: false, name: 'contact_person' })
  contactPerson: string;

  @Column({ nullable: false, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true, name: 'phone_code' })
  phoneCode: string;

  @Column({ nullable: true, name: 'mobile' })
  mobile: string;

  @Column({ nullable: true, name: 'fax' })
  fax: string;

  @Column({ nullable: true, name: 'website' })
  website: string;

  @Column({ nullable: false })
  email: string;

  @Column({
    nullable: false,
    name: 'type_customer',
    default: CustomerType.INDIVIDUAL_CUSTOMER,
  })
  typeCustomer: string;

  @Column({ nullable: false, default: NetWorkCustomerType.TRIAL_CUSTOMER })
  type: string;

  @Column('text', { name: 'service', nullable: true, array: true })
  service: string[];

  @Column({ nullable: true, name: 'post_code' })
  postCode: string;

  @Column({ nullable: true })
  note: string;

  @Column({ enum: EIdentifierType, nullable: true, name: 'identifier_type' })
  identifierType: string;

  @Column({ nullable: true, name: 'identifier' })
  identifier: string;

  @Column({ nullable: true, name: 'open_date' })
  openDate: Date;

  // Update info customer 28/11
  // Lương kinh doanh
  @Column({ name: 'beneficiary', nullable: true })
  beneficiary?: string; // Tên người thụ hưởng

  @Column({ name: 'job_title', nullable: true })
  jobTitle?: string; // Chức vụ làm việc

  @Column({ name: 'beneficiary_phone', nullable: true })
  beneficiaryPhone?: string; // Số điện thoại người thụ hưởng
  @Column({ name: 'is_direct_beneficiary', nullable: true })
  isDirectBeneficiary?: boolean; // Người trực tiếp hưởng hay người thân
  @Column({ name: 'relationship_beneficiaries', nullable: true })
  relationshipBeneficiaries?: string; // Quan hệ với người thụ hưởng
  @Column({ name: 'beneficiary_account_number', nullable: true })
  beneficiaryAccountNumber?: string; // Số tài khoản thụ hưởng
  @Column({ name: 'beneficiary_bank', nullable: true })
  beneficiaryBank?: string; // Ngân hàng thụ hưởng

  @Column({ name: 'lkd_rate', nullable: true, type: 'float' })
  lkdRate?: number; // Tỷ lệ LKD/Giá bán gốc chưa phụ phí

  @Column({ name: 'beneficiary_note', nullable: true })
  beneficiaryNote?: string; // Ghi chú

  // Tài chính
  @Column({ name: 'type_of_payment', nullable: true })
  typeOfPayment?: string; // Loại thanh toán

  @Column({ name: 'previous_cosing', nullable: true })
  previousCosing?: string; // Kỳ chốt cước

  @Column({ name: 'finance_note', nullable: true })
  financeNote?: string; // Ghi chú

  // Thông tin gửi BK
  @Column({ name: 'notify_email', nullable: true })
  notifyEmail?: string; //Email BK theo thông tin KH
  @Column({ name: 'notify_other_email', nullable: true })
  notifyOtherEmail?: string; //Gửi BK theo danh sách Email bổ sung thêm ngoài email ban đầu
  @Column({ name: 'notify_contact_person', nullable: true })
  notifyContactPerson?: string; // Người liên hệ
  @Column({ name: 'booking_email', nullable: true })
  bookingEmail?: string; //Email bảng kê
  @Column({ name: 'booking_phone', nullable: true })
  bookingPhone?: string; //Số điện thoại
  @Column({ name: 'booking_mobile', nullable: true })
  bookingMobile?: string; //Số di động
  @Column({ name: 'notify_price_list_note', nullable: true })
  notifyPriceListNote?: string; // Ghi chú

  // Thông tin gửi hóa đơn điện tử
  @Column({ name: 'order_email_customer', nullable: true })
  orderEmailCustomer?: string; //Email hóa đơn theo thông tin KH
  @Column({ name: 'order_other_email', nullable: true })
  orderOtherEmail?: string; // Gửi Hóa đơn theo danh sách Email bổ sung thêm ngoài email ban đầu
  @Column({ name: 'order_contact_person', nullable: true })
  orderContactPerson?: string; // Người liên hệ
  @Column({ name: 'order_email', nullable: true })
  orderEmail?: string; //Email hóa đơn
  @Column({ name: 'order_phone', nullable: true })
  orderPhone?: string; //Số di động
  @Column({ name: 'order_note', nullable: true })
  orderNote?: string; // Ghi chú

  // Thông tin thu nợ
  @Column({ name: 'debt_contact_person', nullable: true })
  debtContactPerson?: string; // Người liên hệ
  @Column({ name: 'debt_email', nullable: true })
  debtEmail?: string; // Email thu nợ
  @Column({ name: 'debt_phone', nullable: true })
  debtPhone?: string; // Số điện thoại
  @Column({ name: 'debt_mobile', nullable: true })
  debtMobile?: string; // Số di động
  @Column({ name: 'debt_address', nullable: true })
  debtAddress?: string; // Địa chỉ thu nợ
  @Column({ name: 'debt_note', nullable: true })
  debtNote?: string; // Ghi chú

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}