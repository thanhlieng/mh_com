import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmReceiptGoodsDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  bookingIds: string[];
}
