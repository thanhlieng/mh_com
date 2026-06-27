import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class GetBookingPickupDto extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  estimatedDate: Date;
}
