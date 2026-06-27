import { ApiProperty } from '@nestjs/swagger';
import { CreatePUDeliveriesDetailDto } from './create-pu-deliveries-detail.dto';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChildrenSplitBookingDto extends CreatePUDeliveriesDetailDto {
  @ApiProperty()
  @IsString()
  partnerBookingBillCode: string;
}

export class SplitBookingDto {
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ChildrenSplitBookingDto)
  childrenBookings: ChildrenSplitBookingDto[];
}
