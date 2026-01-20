import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class GetManifestDto extends CommonPaginationDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  permissionActionKey: string;
}
