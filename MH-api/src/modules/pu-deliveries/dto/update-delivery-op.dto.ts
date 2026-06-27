import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { BookingType } from 'src/common/constants/common.constants';
import { CreatePUDeliveriesDetailDto } from './create-pu-deliveries-detail.dto';
import { Type } from 'class-transformer';

export class UpdateDeliveryOPDto {
  @ApiProperty()
  @IsEnum(BookingType)
  type: string;

  @ApiProperty()
  @IsUUID()
  serviceBookingId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  customsDeclarationNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bookingPartnerBillCode?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  bookingPartnerService?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contentDetailInvoice?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  informationReceiverAddress?: string;

  @ApiProperty({ type: [CreatePUDeliveriesDetailDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePUDeliveriesDetailDto)
  details: CreatePUDeliveriesDetailDto[];
}
