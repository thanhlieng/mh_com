import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ICheckpoints } from '../interface/checkpoints.interface';

export class ResponseCheckpointsDto implements ICheckpoints {
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
  @IsDateString()
  checkpointTime: string;

  @ApiProperty()
  @IsOptional()
  coordinates: any[];

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
}
