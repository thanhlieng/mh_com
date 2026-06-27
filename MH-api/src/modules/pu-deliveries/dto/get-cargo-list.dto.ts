import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class GetCargoListDto extends CommonPaginationDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  from: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  to: string;
}

export class GetBookingPaidDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  from: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  to: string;
}
