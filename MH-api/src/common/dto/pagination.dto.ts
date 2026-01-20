import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';
import { DefaultPagination } from '../constants/common.constants';

export class CommonPaginationDto {
  @ApiProperty({ required: false, example: 'createdAt_DESC' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ default: DefaultPagination.PAGE })
  @IsNotEmpty()
  @IsNumberString()
  @IsOptional()
  page: string = DefaultPagination.PAGE.toString();

  @ApiProperty({ default: DefaultPagination.PAGE_SIZE })
  @IsNotEmpty()
  @IsNumberString()
  @IsOptional()
  pageSize: string = DefaultPagination.PAGE_SIZE.toString();
}
