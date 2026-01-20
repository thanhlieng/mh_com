import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { BookingType } from 'src/common/constants/common.constants';
import { IPuDeliveries } from '../interface/pu-deliveries.interface';
import { CreatePUDeliveriesDetailDto } from './create-pu-deliveries-detail.dto';

export class ResponsePuDeliveriesDto implements IPuDeliveries {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty()
  @IsEnum(BookingType)
  type: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsUUID()
  serviceBookingId: string;

  @ApiProperty()
  @IsUUID()
  requirePartnerServiceId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contentDetail: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  customsDeclarationNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({ type: CreatePUDeliveriesDetailDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePUDeliveriesDetailDto)
  details: CreatePUDeliveriesDetailDto[];
}
