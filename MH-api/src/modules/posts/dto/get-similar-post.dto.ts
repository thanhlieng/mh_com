import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetSimilarPostDto {
  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  limit: number;
}
