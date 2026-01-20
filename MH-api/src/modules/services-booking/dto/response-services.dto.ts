import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ETypeContract } from 'src/common/constants/common.constants';
import { IService } from '../interface/services.interface';

export class ResponseServiceDto implements IService {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ enum: ETypeContract })
  @IsEnum(ETypeContract)
  typeService: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isPartnerService: boolean;
}
