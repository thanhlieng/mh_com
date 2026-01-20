import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class GetUsersDto extends CommonPaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  roleId?: string;
}
