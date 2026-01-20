import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  CustomerType,
  ECustomerGroup,
  ECustomerStatus,
  EIdentifierType,
  EServiceRequest,
  ETypeContract,
  ETypePayment,
  NetWorkCustomerType,
} from 'src/common/constants/common.constants';
import { PaginationDto } from 'src/common/dto/common';
import { ICustomer } from '../interface/customers.interface';

export class ResponseCustomerDto implements ICustomer {
  @ApiProperty({ required: true })
  @IsEnum(ECustomerStatus)
  status: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullNameEn?: string;

  @ApiProperty({ enum: ECustomerGroup })
  @IsEnum(ECustomerGroup)
  customerGroup: string;

  @ApiProperty()
  @IsString()
  mobile: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fax?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ enum: EIdentifierType })
  @IsEnum(EIdentifierType)
  identifierType: string;

  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty({ enum: EServiceRequest })
  @IsEnum(EServiceRequest)
  serviceRequest: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  potentialRevenue: number;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  paymentSchedule: Date;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  commitmentRate: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  expertise: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  appraisalStaff: string;

  @ApiProperty()
  @IsString()
  contractCode: string;

  @ApiProperty()
  @IsString()
  contractName: string;

  @ApiProperty({ enum: ETypeContract })
  @IsEnum(ETypeContract)
  typeContract: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  noteContract?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  unitId: string;

  @ApiProperty()
  @IsString()
  fullName: string;

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
  phoneCode: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ enum: CustomerType })
  @IsString()
  typeCustomer: string;

  @ApiProperty()
  @IsArray()
  service: string[];

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

  // Update 28/11
  @ApiProperty({ enum: ETypePayment })
  @IsEnum(ETypePayment)
  @IsOptional()
  typeOfPayment: string;
}

export class ResponseListCustomerDto {
  @ApiProperty({ type: [ResponseCustomerDto] })
  data: ResponseCustomerDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
