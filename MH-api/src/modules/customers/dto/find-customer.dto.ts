import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindCustomerDto {
  @ApiProperty()
  @IsString()
  customerCode: string;
}
