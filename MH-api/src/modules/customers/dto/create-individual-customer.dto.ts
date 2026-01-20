import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Gender } from "src/common/constants/common.constants";

export class IndividualCustomerDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty({ required: false, enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dob: Date;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  detailAddress: string;
}