import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateBookingDetailDto } from './create-booking-detail.dto';

export class UpdateBookingDetailDto extends CreateBookingDetailDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  bookingId: string;
}
