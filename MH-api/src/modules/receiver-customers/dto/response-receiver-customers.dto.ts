import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/common';
import { IReceiverCustomer } from '../receiver-customers.interface';

export class ResponseReceiverCustomerDto implements IReceiverCustomer {
  @ApiProperty()
  @IsString()
  senderId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  contactPersonName: string;

  @ApiProperty()
  @IsString()
  mobile: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  phoneCode: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  district: string;

  @ApiProperty()
  @IsString()
  province: string;

  @ApiProperty()
  @IsString()
  commune: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  postalCode: string;

  @ApiProperty()
  @IsString()
  detailAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  note: string;
}

export class ResponseListReceiverCustomerDto {
  @ApiProperty()
  data: ResponseReceiverCustomerDto;

  @ApiProperty()
  pagination: PaginationDto;
}
