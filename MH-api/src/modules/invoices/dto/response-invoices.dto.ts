import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
  IsEnum,
} from 'class-validator';
import {
  InvoiceItemType,
  InvoiceType,
} from 'src/common/constants/common.constants';
import { IInvoice } from '../interface/invoices.interface';

export class ResponseInvoiceDto implements IInvoice {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  bookingId: string;

  @ApiProperty()
  isAdditional: boolean;

  @ApiProperty({ enum: InvoiceItemType })
  @IsEnum(InvoiceItemType)
  typeItemInvoice: string;

  @ApiProperty({ enum: InvoiceType })
  @IsEnum(InvoiceType)
  invoiceType: string;

  @ApiProperty()
  @IsString()
  invoiceCode: string;

  @ApiProperty()
  @IsString()
  senderInformation: string;

  @ApiProperty()
  @IsString()
  receiverInformation: string;

  @ApiProperty()
  @IsDate()
  invoiceDate: Date;

  @ApiProperty()
  @IsString()
  importers: string;

  @ApiProperty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty()
  @IsString()
  serviceId: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  totalNetWeight: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  totalBulkyWeight: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  goodsSize: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  totalBaleNumber: number;

  @ApiProperty()
  @IsString()
  currencyId: string;

  @ApiProperty()
  @IsString()
  reasonExport: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  note: string;
}
