import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  nameVi: string;

  @ApiProperty()
  @IsString()
  nameEn: string;

  @ApiProperty()
  @IsString()
  thumbnail: string;
}
