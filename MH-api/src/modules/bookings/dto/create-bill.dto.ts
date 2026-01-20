import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBillDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  formatTime?: string;
}
