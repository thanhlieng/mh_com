import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSenderAddressDto {
  @ApiProperty()
  @IsString()
  senderNameEn: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderCountry: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  senderProvince: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  senderTown: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderPostalCode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderAddressEn?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  senderAddressEn1?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  senderAddressEn2?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  senderAddressEn3?: string;

  @ApiProperty()
  @IsString()
  senderContactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderDepartment?: string;

  @ApiProperty()
  @IsString()
  senderPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderPhoneNumber2: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senderNote?: string;
}
