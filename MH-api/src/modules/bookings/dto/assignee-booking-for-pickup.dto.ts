import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AssigneeBookingForPickupDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  bookingIds: string[];

  @ApiProperty()
  @IsUUID()
  staffId: string;
}
