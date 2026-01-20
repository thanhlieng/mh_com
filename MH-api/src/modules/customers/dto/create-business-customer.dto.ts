import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class BusinessCustomerDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  tel: string;

  @ApiProperty()
  @IsString()
  detailAddress: string;

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
  position: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}