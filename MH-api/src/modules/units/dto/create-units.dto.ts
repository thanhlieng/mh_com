import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateUnitsDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  companyId: string;

  @ApiProperty()
  @IsString()
  name: string;
}
