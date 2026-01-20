import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { EAddressBookingType } from 'src/common/constants/common.constants';
import { IAddressBook } from '../interface/address-books.interface';

export class ResponseAddressBookDto implements IAddressBook {
  @ApiProperty()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsString()
  senderNameVi: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderNameEn?: string;

  @ApiProperty()
  @IsString()
  senderAddressVi: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderCountry: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  senderProvince: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderPostalCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderAddressEn: string;

  @ApiProperty()
  @IsString()
  senderContactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderDepartment: string;

  @ApiProperty()
  @IsString()
  senderPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderNote: string;

  ////////
  @ApiProperty()
  @IsString()
  receiverName: string;

  @ApiProperty()
  @IsString()
  receiverAddress: string;

  @ApiProperty()
  @IsString()
  receiverPostalCode: string;

  @ApiProperty()
  @IsString()
  receiverCountry: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverProvince: string;

  @ApiProperty()
  @IsString()
  receiverContactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverDepartment: string;

  @ApiProperty()
  @IsString()
  receiverPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverNote: string;

  /////////

  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty()
  @IsEnum(EAddressBookingType)
  type: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  default: boolean;
}
