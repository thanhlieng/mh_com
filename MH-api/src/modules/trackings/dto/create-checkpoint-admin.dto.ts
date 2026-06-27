import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { ICheckpoints } from 'src/modules/checkpoints/interface/checkpoints.interface';

export class CreateCheckPointAdminDto implements ICheckpoints {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  trackingId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  countryName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  countryIso3?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sugtag?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sugtagMessage?: string;

  @ApiProperty({ type: Date })
  @IsOptional()
  @IsDateString()
  checkpointTime?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rawTag?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  timezone?: string;
}
