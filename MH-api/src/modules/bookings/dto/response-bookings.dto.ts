import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
  ValidateNested,
  IsEnum,
  Matches,
  IsBoolean,
} from 'class-validator';
import {
  BookingType,
  CurrencyUnit,
  DeliveryConditions,
  TypeOfPayment,
} from 'src/common/constants/common.constants';
import { ICustomer } from 'src/modules/customers/interface/customers.interface';
import { IInvoice } from 'src/modules/invoices/interface/invoices.interface';
import { IBooking } from '../interface/bookings.interface';
import { CreateBookingDetailDto } from './create-booking-detail.dto';

export class ResponseBookingDto implements IBooking {
  @ApiProperty()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  partnerBillCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isInvoice: boolean;

  @ApiProperty({ enum: BookingType })
  @IsEnum(BookingType)
  type: string;

  @ApiProperty()
  @IsString()
  bookingCode: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isCustomerCreateDeclaration?: boolean;

  @ApiProperty()
  @IsString()
  customsDeclarationNumber?: string;

  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty()
  @IsUUID()
  serviceBookingId: string;

  @ApiProperty()
  @IsString()
  estimatedDate: Date;

  @ApiProperty({ example: '12:00' })
  @IsString()
  @Matches('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
  estimateHour: string;

  @ApiProperty()
  @IsUUID()
  deliveryConditionId: string;

  @ApiProperty()
  @IsOptional()
  otherDeliveryConditions?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  payment: string;

  @ApiProperty()
  @IsUUID()
  typeOfPaymentId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  oderAccountForeign?: string;

  @ApiProperty()
  @IsBoolean()
  isCustomsDeclaration: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  customsDeclarationNumer?: string;

  @ApiProperty()
  @IsString()
  senderNameVi: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderNameEn?: string;

  @ApiProperty()
  @IsString()
  senderAddressVi: string;

  @ApiProperty()
  @IsString()
  senderCountry: string;

  @ApiProperty()
  @IsString()
  senderProvince: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderPostalCode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderAddressEn?: string;

  @ApiProperty()
  @IsString()
  senderContactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderDepartment?: string;

  @ApiProperty()
  @IsString()
  senderPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderNote?: string;

  @ApiProperty()
  @IsString()
  receiverName: string;

  @ApiProperty()
  @IsString()
  receiverAddress: string;

  @ApiProperty()
  @IsString()
  receiverPostalCode: string;

  @ApiProperty()
  @IsString()
  receiverCountry: string;

  @ApiProperty()
  @IsString()
  receiverProvince: string;

  @ApiProperty()
  @IsString()
  receiverContactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverDepartment?: string;

  @ApiProperty()
  @IsString()
  receiverPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverNote?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  vat?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ type: [CreateBookingDetailDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingDetailDto)
  bookingDetail: CreateBookingDetailDto[];
}
