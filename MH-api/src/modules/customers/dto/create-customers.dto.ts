import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  CustomerType,
  ECustomerGroup,
  ECustomerStatus,
  EIdentifierType,
  ETypePayment,
  NetWorkCustomerType,
} from 'src/common/constants/common.constants';
import { ICustomer } from '../interface/customers.interface';
import { CreateContractDto } from './create-contract.dto';
import { CreateManagementStaffDto } from './create-management-staff.dto';
import { CreatePriceListDto } from './create-price-list.dto';

export class CreateCustomerDto implements ICustomer {
  @ApiProperty({ required: false, enum: ECustomerStatus })
  @IsEnum(ECustomerStatus)
  status: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullNameEn?: string;

  @ApiProperty({ enum: ECustomerGroup })
  @IsEnum(ECustomerGroup)
  customerGroup: string;

  @ApiProperty()
  @IsString()
  mobile: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fax?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty()
  @IsString()
  detailAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  detailAddressEn: string;

  @ApiProperty({ enum: EIdentifierType })
  @IsEnum(EIdentifierType)
  identifierType: string;

  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  unitId: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  commune: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  district: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  province: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  contactPerson: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneCode: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ enum: CustomerType })
  @IsString()
  typeCustomer: string;

  @ApiProperty({ type: 'array', items: { type: 'string' } })
  @IsArray()
  @IsString({ each: true })
  service: string[];

  @ApiProperty({ enum: NetWorkCustomerType })
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  postCode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  openDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note: string;

  // Update 28/11

  // Lương kinh doanh
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  beneficiary?: string; // Tên người thụ hưởng

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobTitle?: string; // Chức vụ làm việc

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  beneficiaryPhone?: string; // Số điện thoại người thụ hưởng

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDirectBeneficiary?: boolean; // Người trực tiếp hưởng hay người thân

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  relationshipBeneficiaries?: string; // Quan hệ với người thụ hưởng

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  beneficiaryAccountNumber?: string; // Số tài khoản thụ hưởng

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  beneficiaryBank?: string; // Ngân hàng thụ hưởng

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lkdRate?: number; // Tỷ lệ LKD/Giá bán gốc chưa phụ phí

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  beneficiaryNote?: string; // Ghi chú

  // Tài chính
  @ApiProperty({ enum: ETypePayment })
  @IsEnum(ETypePayment)
  @IsOptional()
  typeOfPayment: string; // Loại thanh toán

  @ApiProperty()
  @IsString()
  @IsOptional()
  previousCosing?: string; // Kỳ chốt cước

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  financeNote?: string; // Ghi chú

  // Thông tin gửi BK
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notifyEmail?: string; //Email BK theo thông tin KH

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notifyOtherEmail?: string; //Gửi BK theo danh sách Email bổ sung thêm ngoài email ban đầu

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notifyContactPerson?: string; // Người liên hệ

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bookingEmail?: string; //Email bảng kê

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bookingPhone?: string; //Số điện thoại

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bookingMobile?: string; //Số di động

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notifyPriceListNote?: string; // Ghi chú

  // Thông tin gửi hóa đơn điện tử
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderEmailCustomer?: string; //Email hóa đơn theo thông tin KH

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderOtherEmail?: string; // Gửi Hóa đơn theo danh sách Email bổ sung thêm ngoài email ban đầu

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderContactPerson?: string; // Người liên hệ

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderEmail?: string; //Email hóa đơn

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderPhone?: string; //Số di động

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderNote?: string; // Ghi chú

  //Thông tin thu nợ
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  debtContactPerson?: string; // Người liên hệ

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  debtEmail?: string; // Email thu nợ

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  debtPhone?: string; // Số điện thoại

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  debtMobile?: string; // Số di động

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  debtAddress?: string; // Địa chỉ thu nợ

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  debtNote?: string; // Ghi chú

  @ApiProperty({ type: [CreateContractDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateContractDto)
  @IsOptional()
  contract?: CreateContractDto[];

  @ApiProperty({ type: [CreatePriceListDto] })
  @ValidateNested({ each: true })
  @Type(() => CreatePriceListDto)
  @IsOptional()
  priceList?: CreatePriceListDto[];

  @ApiProperty({ type: [CreateManagementStaffDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateManagementStaffDto)
  @IsOptional()
  managementStaff?: CreateManagementStaffDto[];
}
