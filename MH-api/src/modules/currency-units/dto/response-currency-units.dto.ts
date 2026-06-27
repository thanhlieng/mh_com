import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { ICurrencyUnit } from '../interface/currency-units.interface';

export class ResponseCurrencyUnitDto implements ICurrencyUnit {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
