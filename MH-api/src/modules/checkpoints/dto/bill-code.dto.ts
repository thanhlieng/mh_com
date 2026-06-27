import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BillCodeDto {
  @ApiProperty()
  @IsString()
  billCode: string;
}
