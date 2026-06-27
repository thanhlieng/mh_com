import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsEnum,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { BookingType } from 'src/common/constants/common.constants';
import { CreateInvoiceDto } from 'src/modules/invoices/dto/create-invoices.dto';
import { IBooking } from '../interface/bookings.interface';
import { CreateBookingDetailDto } from './create-booking-detail.dto';

export class CreateBookingDto implements IBooking {
  @ApiProperty()
  @IsString()
  @IsOptional()
  partnerBillCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  referenceCode: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isInvoice: boolean;

  @ApiProperty({ enum: BookingType })
  @IsEnum(BookingType)
  type: string;

  @ApiProperty()
  @IsUUID()
  serviceBookingId: string;

  @ApiProperty()
  @IsDateString()
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
  payment?: string;

  @ApiProperty()
  @IsUUID()
  typeOfPaymentId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  oderAccountForeign?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isCustomerCreateDeclaration: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isCustomsDeclaration: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  customsDeclarationNumber?: string;

  ////////////////////////////////////

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderNameVi: string;

  @ApiProperty()
  @IsString()
  @MaxLength(60)
  senderNameEn?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderAddressVi: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderCountry: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  senderProvince: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  senderTown: string;

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
  @MaxLength(35)
  senderAddressEn1?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  senderAddressEn2?: string = '';

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  senderAddressEn3?: string = '';

  @ApiProperty()
  @IsString()
  senderContactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderDepartment?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(14)
  senderPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderPhoneNumber2: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderNote?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderOtherShippingAddress?: string;

  ////////////////////////////////////////////

  @ApiProperty()
  @IsString()
  @MaxLength(60)
  receiverName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverAddress: string;

  @ApiProperty()
  @IsString()
  @MaxLength(35)
  receiverAddress1: string;

  @ApiProperty()
  @IsString()
  @MaxLength(35)
  @IsOptional()
  receiverAddress2: string = '';

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  receiverAddress3: string = '';

  @ApiProperty()
  @IsString()
  receiverPostalCode: string;

  @ApiProperty()
  @IsString()
  receiverCountry: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverProvince: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  receiverTown: string;

  @ApiProperty()
  @IsString()
  receiverContactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverDepartment?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(14)
  receiverPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverPhoneNumber2: string;

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
  bookingDetail?: CreateBookingDetailDto[];
}

export class CreateBookingInvoiceDto {
  @ApiProperty({ type: CreateBookingDto })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBookingDto)
  booking: CreateBookingDto;

  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateInvoiceDto)
  invoice: CreateInvoiceDto;
}
