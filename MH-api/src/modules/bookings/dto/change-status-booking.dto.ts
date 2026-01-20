import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BookingStatus } from 'src/common/constants/common.constants';

export class ChangeStatusBookingDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
