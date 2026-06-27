import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateBookingDto } from './create-bookings.dto';

export class StaffCreateBookingDto extends CreateBookingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  customerId: string;
}
