import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { UpdateInvoiceDto } from 'src/modules/invoices/dto/update-invoices.dto';
import { CreateBookingDto } from './create-bookings.dto';
import { UpdateBookingDetailDto } from './update-booking-detail.dto';

export class UpdateBookingDto extends CreateBookingDto {
  @ApiProperty({ type: [UpdateBookingDetailDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateBookingDetailDto)
  bookingDetail: UpdateBookingDetailDto[];
}

export class UpdateBookingInvoiceDto {
  @ApiProperty({ type: UpdateBookingDto })
  @Type(() => UpdateBookingDto)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  booking: UpdateBookingDto;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateInvoiceDto)
  invoice: UpdateInvoiceDto;
}
