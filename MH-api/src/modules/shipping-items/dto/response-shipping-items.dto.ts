import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { IShippingItem } from '../interface/shipping-items.interface';

export class ResponseShippingItemDto implements IShippingItem {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
