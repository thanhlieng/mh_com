import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { ITypeOfPayment } from '../interface/type-of-payments.interface';

export class ResponseTypeOfPaymentDto implements ITypeOfPayment {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
