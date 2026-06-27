import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReceiverAddressDto {
  @ApiProperty()
  @IsString()
  receiverName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  receiverAddress1: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  receiverAddress2: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  receiverAddress3: string;

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
  @IsOptional()
  @IsString()
  receiverTown: string;

  @ApiProperty()
  @IsString()
  receiverContactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverDepartment?: string;

  @ApiProperty()
  @IsString()
  receiverPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverPhoneNumber2: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverNote?: string;
}
