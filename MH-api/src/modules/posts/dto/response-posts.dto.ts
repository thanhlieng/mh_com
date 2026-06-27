import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/common';
import { IPosts } from '../posts.interface';

export class ResponsePostsDto implements IPosts {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  content: string;
}

export class ResponseListPostDto {
  @ApiProperty()
  data: ResponsePostsDto[];

  @ApiProperty()
  pagination: PaginationDto;
}
