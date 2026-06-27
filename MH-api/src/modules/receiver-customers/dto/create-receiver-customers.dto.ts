import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateReceiverCustomerDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  postalCode: string;

  @ApiProperty()
  @IsString()
  detailAddress: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  state: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note: string;
}
