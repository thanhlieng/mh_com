import { ApiProperty } from '@nestjs/swagger';
import { ECategoryKey } from '../categories.constant';
import { IsEnum } from 'class-validator';

export class GetItemCategoryDto {
  @ApiProperty({ enum: ECategoryKey })
  @IsEnum(ECategoryKey)
  key: string;
}
