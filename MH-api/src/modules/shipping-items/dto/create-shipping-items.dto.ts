import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateShippingItemDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
