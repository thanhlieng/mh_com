import { Status } from '@constants/common.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class FilterStaffDto extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  unitId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  departmentId: string;

  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status: string;
}

export class ExportStaffDto extends CommonPaginationDto  {
  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status: string;
}
