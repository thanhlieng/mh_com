import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePartnerBillCodeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  referenceCode: string;

  @ApiProperty()
  @IsString()
  @Transform((data) => data.value.trim())
  partnerBillCode: string;

  @ApiProperty()
  @IsUUID()
  partnerService: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  manufacture?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  partnerBillCodeDomestic?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  partnerServiceDomestic?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  manufactureDomestic?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  partnerBillCodeForeign?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  partnerServiceForeign?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  manufactureForeign?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  valueAddedService1?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  valueAddedService2?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  valueAddedService3?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  dhl?: number[];

  @ApiProperty()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  fedex?: number[];

  @ApiProperty()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  ups?: number[];
}
