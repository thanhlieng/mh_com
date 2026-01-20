import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CommonIdParams {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class ResHashPasswordDto {
  @ApiProperty()
  @IsString()
  salt: string;

  @ApiProperty()
  @IsString()
  hashPassword: string;
}

export class PaginationDto {
  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPage: number;

  @ApiProperty()
  totalCount: number;
}

export class ParamsDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
