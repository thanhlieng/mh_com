import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateJapanAddressDto {
  @ApiProperty()
  @IsString()
  consigneeNameEnglish?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  consigneeNameJapanese: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  consigneeCode: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  registeredCompanyName: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  address: string;
}
