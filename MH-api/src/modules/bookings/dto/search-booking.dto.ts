import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class SearchBookingDto {
  @ApiProperty({ example: '893080920210000' })
  @IsString()
  bookingCode: string;
}
