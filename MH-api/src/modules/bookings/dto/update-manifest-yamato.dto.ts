import { BookingType } from '@constants/common.constants';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum EShipmentType {
  D = 'D',
  N = 'N',
}

export enum EShipmentTypeToBookingType {
  D = BookingType.LICENSE,
  N = BookingType.COMMODITY,
}

export const EBookingTypeToShipmentType = {
  [BookingType.LICENSE]: 'D',
  [BookingType.COMMODITY]: 'N',
};

export class UpdateManifestYamatoDto {
  @ApiProperty({ required: false, example: null, type: String })
  @IsOptional()
  @IsEnum(EShipmentType, {
    message: `shipment type must be a valid enum value: ${Object.values(EShipmentType)}`,
  })
  shipmentType?: string; //=== originOfCountry

  @ApiProperty({ required: false, example: null, type: String })
  @IsOptional()
  @IsString()
  partnerInvoiceManifest?: string; //=== originOfCountry

  @ApiProperty({ required: false, example: 'cn', type: String })
  @IsOptional()
  @IsString()
  originOfCountry?: string; //=== originOfCountry

  @ApiProperty()
  @IsOptional()
  @IsString()
  packageID: string; //=== Package ID

  @ApiProperty()
  @IsOptional()
  @IsString()
  trackingNo?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  referenceNoManifest: string; //=== Reference No

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gwManifest: number; //=== GW

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  freightChargeManifest: number; //=== Freight Charge

  @ApiProperty()
  @IsOptional()
  @IsString()
  itemNameManifest: string; //=== Item name

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lengthManifest: number; //=== Length

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  widthManifest: number; //=== Width

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  heightManifest: number; //=== Height

  @ApiProperty()
  @IsOptional()
  @IsString()
  consigneeNameJapaneseManifest: string; //=== Consignee Japan name

  @ApiProperty()
  @IsOptional()
  @IsString()
  consigneeCodeManifest: string; //=== Consignee code

  @ApiProperty()
  @IsOptional()
  @IsString()
  registeredCompanyNameManifest: string; //===  Registered company name

  @ApiProperty()
  @IsOptional()
  @IsString()
  addressManifest: string; //=== Address

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  qtyManifest: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  uomManifest: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitPriceManifest: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  invoiceCurManifest: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paymentTermManifest: number;
}
