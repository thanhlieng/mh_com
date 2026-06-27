import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { ICustomerType } from '../interface/customer-types.interface';

export class ResponseCustomerTypeDto implements ICustomerType {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
