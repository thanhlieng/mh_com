import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EZoneService } from 'src/common/constants/common.constants';

export class CreatePartnerServiceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false, enum: EZoneService })
  @IsEnum(EZoneService)
  @IsOptional()
  zone?: string;
}
