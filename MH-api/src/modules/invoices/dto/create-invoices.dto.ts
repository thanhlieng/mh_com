import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
  ValidateNested,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { CreateInvoiceDetailDto } from './create-invoice-detail.dto';
import {
  InvoiceItemType,
  InvoiceType,
} from 'src/common/constants/common.constants';

export class CreateInvoiceDto {
  @ApiProperty({ required: false })
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateInvoiceDetailDto)
  invoiceDetail: CreateInvoiceDetailDto[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  bookingId: string;

  @ApiProperty({ enum: InvoiceItemType })
  @IsEnum(InvoiceItemType)
  typeItemInvoice: string;

  @ApiProperty({ enum: InvoiceType })
  @IsEnum(InvoiceType)
  invoiceType: string;

  // @ApiProperty()
  // @IsString()
  // invoiceCode: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  senderInformation: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  receiverInformation: string;

  @ApiProperty()
  @IsDateString()
  invoiceDate: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  importers: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalNetWeight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalBulkyWeight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  goodsSize: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalBaleNumber: number;

  @ApiProperty()
  @IsUUID()
  currencyId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  reasonExport: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  noteInvoice: string;
}

export class CreateTemplateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  deliveryConditionId: string;

  @ApiProperty()
  @IsString()
  templateName: string;
}
