import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { BookingType } from 'src/common/constants/common.constants';
import { Type } from 'class-transformer';
import { CreatePUDeliveriesDetailDto } from './create-pu-deliveries-detail.dto';

export class UpdatePuDeliveriesDto {
  @ApiProperty()
  @IsEnum(BookingType)
  type: string;

  @ApiProperty()
  @IsUUID()
  serviceBookingId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
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

  @ApiProperty({ type: [CreatePUDeliveriesDetailDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePUDeliveriesDetailDto)
  details: CreatePUDeliveriesDetailDto[];
}
