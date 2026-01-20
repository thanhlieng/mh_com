import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  CustomerType,
  NetWorkCustomerType,
  ServiceEnum,
} from 'src/common/constants/common.constants';

export class CreateAccountCustomerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  unitId: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    minLength: 6,
    maxLength: 15,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(15)
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  detailAddress: string;

  @ApiProperty()
  @IsString()
  commune: string;

  @ApiProperty()
  @IsString()
  district: string;

  @ApiProperty()
  @IsString()
  province: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  taxCode: string;

  @ApiProperty()
  @IsString()
  contactPerson: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  mobile: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ enum: CustomerType })
  @IsString()
  typeCustomer: string;

  @ApiProperty({ enum: ServiceEnum })
  @IsString()
  service: string;

  @ApiProperty({ enum: NetWorkCustomerType })
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  postCode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  state: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty()
  @IsNotEmpty()
  phoneCode: string;
}
