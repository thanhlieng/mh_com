import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateSmallBillDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(30)
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;
}
