import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ECurrency } from '../pu-deliveries.constants';

export class SendCargoListViaEmailDto {
  @ApiProperty()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  @IsOptional()
  month: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  year: number;

  @ApiProperty({ enum: ECurrency })
  @IsEnum(ECurrency)
  currency: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  from: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  to: string;
}
