import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import {
  ETypeService,
  EZoneService,
} from 'src/common/constants/common.constants';

export class CreateServiceDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  key: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  codeAftership: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  coefficient?: number;

  @ApiProperty({ enum: ETypeService })
  @IsEnum(ETypeService)
  typeService: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  icon: string;

  @ApiProperty({ enum: EZoneService })
  @IsOptional()
  @IsEnum(EZoneService)
  zone: string;
}
