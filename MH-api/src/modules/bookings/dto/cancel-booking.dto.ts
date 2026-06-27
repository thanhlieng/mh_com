import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
