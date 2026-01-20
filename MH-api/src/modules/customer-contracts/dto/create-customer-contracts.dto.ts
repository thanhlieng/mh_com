import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
  IsDateString,
} from 'class-validator';

export class CreateCustomerContractDto {
  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  bankAccountNumber: string;

  @ApiProperty()
  @IsString()
  bankCode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  taxCode: string;

  @ApiProperty()
  @IsString()
  nomineeName: string;

  @ApiProperty()
  @IsString()
  position: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  paymentDate: Date;
}
