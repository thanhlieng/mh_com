import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsBooleanString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { BookingStatus, BookingType } from 'src/common/constants/common.constants';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class GetBookingDto extends CommonPaginationDto {
  @ApiProperty({ required: false, example: 'true', type: Boolean })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => String(value) === 'true')
  isHandedFilter: boolean;

  @ApiProperty({ required: false })
  @IsBooleanString()
  @IsOptional()
  isHandle: boolean;

  @ApiProperty({ required: false, enum: BookingStatus })
  @IsEnum(BookingStatus)
  @IsOptional()
  status: BookingStatus;

  @ApiProperty({ required: false, enum: BookingType })
  @IsEnum(BookingType)
  @IsOptional()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  serviceBookingId: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  createBookingFrom: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  createBookingTo: Date;
}
