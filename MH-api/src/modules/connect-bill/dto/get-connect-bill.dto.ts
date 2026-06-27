import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetConnectBillDto {
  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  from: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  to: Date;
}
