import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChangeRequestDto {
  @ApiProperty({ description: 'ID của PNL cần thay đổi cost', example: 123 })
  @IsNumber()
  @IsNotEmpty()
  pnl: number;

  @ApiProperty({ description: 'ID của Order chứa PNL', example: 456 })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiProperty({ description: 'Cost mới (trước VAT)', example: 1500000.0 })
  @IsNumber()
  @IsNotEmpty()
  requested_cost: number;

  @ApiPropertyOptional({ description: 'Lý do thay đổi', example: 'Giá xăng tăng 20%' })
  @IsString()
  @IsOptional()
  reason?: string;
}
