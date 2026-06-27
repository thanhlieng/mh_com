import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

export class GetAnalyticsPOD extends CommonPaginationDto {
  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  from: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  to: Date;

  @IsString()
  @IsOptional()
  ServiceID: string;
}

export class GetOrderRemaining extends CommonPaginationDto {
  @IsString()
  @IsOptional()
  ServiceID: string;
}

export class UpdateOrderRemaining {
  @IsString()
  @IsOptional()
  note: string;
}

export class GetAnalyticsPODResponse {
  dateOut: string;
  total: number;
  totalDeliveried: number;
  percentDeliveried: string;
  totalDeliveried1: number;
  percentDeliveried1: string;
  totalDeliveried2: number;
  percentDeliveried2: string;
  totalDeliveried3: number;
  percentDeliveried3: string;
  totalDeliveried4: number;
  percentDeliveried4: string;
  totalDeliveried5: number;
  percentDeliveried5: string;
  totalDeliveried6: number;
  percentDeliveried6: string;
  totalDeliveried7: number;
  percentDeliveried7: string;
  totalDeliveried8: number;
  percentDeliveried8: string;
  totalDeliveried9: number;
  percentDeliveried9: string;
  totalDeliveried10: number;
  percentDeliveried10: string;
  totalDeliveriedPlus: number;
  percentDeliveriedPlus: string;
}

export class GetOrderRemainingResponse {
  id: string;
  booking_code: string;
  partner_bill_code: string;
  partner_connection: string;
  customer_code: string;
  customer_name: string;
  pickup_date: string;
  export_date: string;
  remaining_days: string;
  note: string;
}
