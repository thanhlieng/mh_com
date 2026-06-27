import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GenerateExcelFileDto {
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  createBookingFrom?: Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  createBookingTo?: Date;
}
