import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreatePostsDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  categoryId: string;

  @ApiProperty()
  @IsString()
  titleVi: string;

  @ApiProperty()
  @IsString()
  titleEn: string;

  @ApiProperty()
  @IsString()
  descriptionVi: string;

  @ApiProperty()
  @IsString()
  descriptionEn: string;

  @ApiProperty()
  @IsString()
  thumbnail: string;

  @ApiProperty()
  @IsString()
  contentVi: string;

  @ApiProperty()
  @IsString()
  contentEn: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active: boolean;
}
