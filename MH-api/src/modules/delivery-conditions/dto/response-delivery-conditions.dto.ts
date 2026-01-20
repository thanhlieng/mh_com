import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { IDeliveryConditions } from '../interface/delivery-conditions.interface';

export class ResponseDeliveryConditionsDto implements IDeliveryConditions {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
