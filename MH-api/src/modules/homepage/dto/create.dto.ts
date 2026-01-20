import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ETypeLinkHomepage } from 'src/common/constants/common.constants';
import { EHomePage } from 'src/common/constants/common.constants';

export class CreateHomePageDto {
  @ApiProperty()
  @IsString()
  nameVi: string;

  @ApiProperty()
  @IsString()
  nameEn: string;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty({ enum: ETypeLinkHomepage })
  @IsEnum(ETypeLinkHomepage)
  typeLink: string;

  @ApiProperty({ enum: EHomePage })
  @IsEnum(EHomePage)
  type: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  categoryId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  postId: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  position: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active: boolean;
}
