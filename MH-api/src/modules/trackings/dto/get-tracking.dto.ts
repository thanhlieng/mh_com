import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';
import { trimArrayString } from 'src/common/helper/helper';

export class GetTrackingDto extends CommonPaginationDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @Transform((data) => trimArrayString(data.value))
  billCodes: string[];
}
