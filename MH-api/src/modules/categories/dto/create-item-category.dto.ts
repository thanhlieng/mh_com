import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ECategoryKey } from '../categories.constant';

export class CreateItemCategoryDto {
  @ApiProperty({ enum: ECategoryKey })
  @IsEnum(ECategoryKey)
  categoryKey: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  key?: string;
}
