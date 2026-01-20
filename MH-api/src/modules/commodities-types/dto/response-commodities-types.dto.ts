import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { ICommoditiesType } from '../interface/commodities-types.interface';

export class ResponseCommoditiesTypeDto implements ICommoditiesType {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
