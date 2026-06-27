import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { BookingType } from 'src/common/constants/common.constants';
import { CreatePUDeliveriesDetailDto } from './create-pu-deliveries-detail.dto';

export class CreatePuDeliveriesDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty()
  @IsEnum(BookingType)
  type: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty()
  @IsUUID()
  serviceBookingId: string;

  @ApiProperty()
  @IsUUID()
  requirePartnerServiceId?: string;

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

  @ApiProperty({ type: [CreatePUDeliveriesDetailDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePUDeliveriesDetailDto)
  details: CreatePUDeliveriesDetailDto[];
}
