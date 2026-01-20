import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateLevelStaffsDto {
  @ApiProperty()
  @IsString()
  name: string;
}
