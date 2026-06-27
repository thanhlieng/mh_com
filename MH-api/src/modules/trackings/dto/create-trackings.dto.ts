import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

class CreateAftershipEstimatedDeliveryDateDto {
  @ApiProperty()
  @IsOptional()
  estimatedDeliveryDate?: Date;

  @ApiProperty()
  @IsOptional()
  confidenceScore?: any;

  @ApiProperty()
  @IsOptional()
  estimatedDeliveryDateMin?: Date;

  @ApiProperty()
  @IsOptional()
  estimatedDeliveryDateMax?: Date;
}

class CreateLatestEstimatedDeliveryDto {
  @ApiProperty()
  @IsOptional()
  type?: string;

  @ApiProperty()
  @IsOptional()
  source?: string;

  @ApiProperty()
  @IsOptional()
  datetime?: Date;

  @ApiProperty()
  @IsOptional()
  datetimeMin?: Date;

  @ApiProperty()
  @IsOptional()
  datetimeMax?: Date;
}

export class CreateTrackingsDto {
  @ApiProperty()
  @IsOptional()
  trackingNumber: string;

  @ApiProperty()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsOptional()
  note: string;

  @ApiProperty()
  @IsOptional()
  originCountryIso3: string;

  @ApiProperty()
  @IsOptional()
  descriptionCountryIso3: string;

  @ApiProperty()
  @IsOptional()
  courierDestinationCountryIso3: string;

  @ApiProperty()
  @IsOptional()
  shipmentPackageCount: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsOptional()
  orderId: string;

  @ApiProperty()
  @IsOptional()
  orderIdPath: string;

  @ApiProperty()
  @IsOptional()
  orderDate: Date;

  @ApiProperty()
  @IsOptional()
  customerName: string;

  @ApiProperty()
  @IsOptional()
  source: string;

  @ApiProperty()
  @IsOptional()
  tag: string;

  @ApiProperty()
  @IsOptional()
  subtag: string;

  @ApiProperty()
  @IsOptional()
  subtagMessage: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  trackedCount: number;

  @ApiProperty()
  @IsOptional()
  expectedDelivery: Date;

  @ApiProperty()
  @IsOptional()
  shipmentType: string;

  @ApiProperty()
  @IsOptional()
  slug: string;

  @ApiProperty()
  @IsOptional()
  uniqueToken: string;

  @ApiProperty()
  @IsOptional()
  path: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  shipmentWeight: number;

  @ApiProperty()
  @IsOptional()
  shipmentWeightUnit: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deliveryTime: number;

  @ApiProperty()
  @IsOptional()
  language: string;

  @ApiProperty()
  @IsOptional()
  shipmentPickupDate: string;

  @ApiProperty()
  @IsOptional()
  shipmentDeliveryDate: string;

  @ApiProperty()
  @IsOptional()
  orderPromisedDeliveryDate: Date;

  @ApiProperty()
  @IsOptional()
  deliveryType: string;

  @ApiProperty()
  @IsOptional()
  pickupLocation: string;

  @ApiProperty()
  @IsOptional()
  pickupNote: string;

  @ApiProperty()
  @IsOptional()
  trackingAccountNumber: string;

  @ApiProperty()
  @IsOptional()
  trackingOriginCountry: string;

  @ApiProperty()
  @IsOptional()
  trackingDestinationCountry: string;

  @ApiProperty()
  @IsOptional()
  trackingKey: string;

  @ApiProperty()
  @IsOptional()
  trackingPostalCode: string;

  @ApiProperty()
  @IsOptional()
  trackingShipDate: Date;

  @ApiProperty()
  @IsOptional()
  trackingState: string;

  @ApiProperty()
  @IsOptional()
  onTimeStatus: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  onTimeDifference: number;

  @ApiProperty({ type: CreateAftershipEstimatedDeliveryDateDto })
  @IsOptional()
  aftershipEstimatedDeliveryDate: CreateAftershipEstimatedDeliveryDateDto;

  @ApiProperty()
  @IsOptional()
  orderNumber: string;

  @ApiProperty({ type: CreateLatestEstimatedDeliveryDto })
  @IsOptional()
  latestEstimatedDelivery: CreateLatestEstimatedDeliveryDto;
}
