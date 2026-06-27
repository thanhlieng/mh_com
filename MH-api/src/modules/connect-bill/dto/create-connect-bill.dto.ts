import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  EExportForm,
  ETransportationType,
} from 'src/common/constants/common.constants';
import { IConnectBill } from '../interface/connect-bill.interface';

export class CreateConnectBillDto implements IConnectBill {
  @ApiProperty({ enum: EExportForm })
  @IsEnum(EExportForm)
  exportForm: string;

  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsUUID()
  partnerId: string;

  @ApiProperty()
  @IsUUID()
  connectionPartnerId: string;

  @ApiProperty({ enum: ETransportationType })
  @IsEnum(ETransportationType)
  transportationType: string;

  @ApiProperty()
  @IsString()
  mawbCode: string;

  @ApiProperty()
  @IsString()
  flightCode: string;

  @ApiProperty()
  @IsDateString()
  flightTime: Date;

  @ApiProperty()
  @IsString()
  sendingAirport: string;

  @ApiProperty()
  @IsString()
  receivingAirport: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID('all', { each: true })
  itemDeliveries: string[];
}
