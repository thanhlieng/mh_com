import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Status } from 'src/common/constants/common.constants';

export class ChangeStatusDto {
  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  status: Status;
}
