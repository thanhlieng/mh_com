import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { IPuDeliveriesDetail } from '../interface/pu-deliveries-detail.interface';

export class CreatePUDeliveriesDetailDto implements IPuDeliveriesDetail {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  weight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  bulkyWeight: number;

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
