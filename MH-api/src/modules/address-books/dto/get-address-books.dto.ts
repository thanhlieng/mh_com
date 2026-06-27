import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EAddressBookingType } from 'src/common/constants/common.constants';

export class GetAddressBookDto {
  @ApiProperty({ enum: EAddressBookingType })
  @IsOptional()
  @IsEnum(EAddressBookingType)
  type: string;
}
