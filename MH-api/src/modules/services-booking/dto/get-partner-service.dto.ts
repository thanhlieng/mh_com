import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EZoneService } from 'src/common/constants/common.constants';

export class GetPartnerServiceDto {
  @ApiProperty({ enum: EZoneService, required: false })
  @IsOptional()
  @IsEnum(EZoneService)
  zone?: string;
}
