import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetPostCodeDto {
  @ApiProperty({ required: false, default: 'Japan' })
  @IsString()
  @IsOptional()
  country: string;
}
