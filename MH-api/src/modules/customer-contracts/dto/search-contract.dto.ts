import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class GetContractDto extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  customerId: string;
}
