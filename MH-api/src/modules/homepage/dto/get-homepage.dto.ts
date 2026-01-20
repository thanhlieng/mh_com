import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EHomePage } from 'src/common/constants/common.constants';

export class GetHomepageDto {
  @ApiProperty({ enum: EHomePage, required: false })
  @IsEnum(EHomePage)
  @IsOptional()
  type: EHomePage;
}
