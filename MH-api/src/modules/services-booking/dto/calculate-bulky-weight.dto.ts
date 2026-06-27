import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class CalculateBulkyWeightDto {
  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  height: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  width: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  longs: number;
}
