import { ApiProperty } from '@nestjs/swagger';
import { HistoryAction, HistoryType } from '../history.const';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class HistoryQuery extends CommonPaginationDto {
  @ApiProperty({
    required: false,
    type: 'enum',
    enum: HistoryType,
    example: 'customer',
  })
  @IsOptional()
  @IsEnum(HistoryType)
  type: HistoryType;

  @ApiProperty({
    required: false,
    type: 'enum',
    enum: HistoryAction,
    example: 'create',
  })
  @IsOptional()
  @IsEnum(HistoryAction)
  action: HistoryAction;

  @ApiProperty({
    required: false,
    type: String,
    enum: HistoryType,
    example: '1',
  })
  @IsOptional()
  @IsString()
  code: string;
}

export class HistoryOpsQuery extends CommonPaginationDto {
  @ApiProperty({
    required: true,
    type: 'enum',
    enum: HistoryType,
    example: 'customer',
  })
  @IsEnum(HistoryType)
  @IsOptional()
  type: HistoryType;
}
