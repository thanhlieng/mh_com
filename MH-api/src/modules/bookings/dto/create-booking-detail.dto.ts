import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CalculationUnit } from 'src/common/constants/common.constants';
import { IBookingDetail } from '../interface/booking-detail.interface';

export class CreateBookingDetailDto implements IBookingDetail {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @ApiProperty({ enum: CalculationUnit })
  @IsEnum(CalculationUnit)
  calculationUnit: string;

  @ApiProperty()
  @IsUUID()
  commoditiesTypeId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  shippingItemViId: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  originItem: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  shippingItemEn?: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  weight: number;

  @ApiProperty()
  @IsOptional()
  height?: number;

  @ApiProperty()
  @IsOptional()
  width?: number;

  @ApiProperty()
  @IsOptional()
  longs?: number;

  @ApiProperty()
  @IsOptional()
  bulkyWeight?: number;

  @ApiProperty()
  @IsOptional()
  note?: string;
}
