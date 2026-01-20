import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { INetworkCustomerType } from '../interface/network-customer-types.interface';

export class ResponseNetworkCustomerTypeDto implements INetworkCustomerType {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
