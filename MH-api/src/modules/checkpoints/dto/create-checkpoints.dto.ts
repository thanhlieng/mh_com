import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateCheckpointsDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  trackingId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  countryName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  message: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  countryIso3: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tag: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sugtag: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sugtagMessage: string;

  @ApiProperty()
  @IsOptional()
  checkpointTime: string;

  @ApiProperty()
  @IsOptional()
  coordinates: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  state: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zip: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rawTag: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  timezone: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isAftershipData: boolean;
}
