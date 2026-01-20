import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/common';
import { ICustomerContract } from '../customer-contracts.interface';

export class ResponseCustomerContractDto implements ICustomerContract {
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
  @IsString()
  paymentDate: string;
}

export class ResponseListContractDto {
  @ApiProperty()
  data: ResponseCustomerContractDto;

  @ApiProperty()
  pagination: PaginationDto;
}
