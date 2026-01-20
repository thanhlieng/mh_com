import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { IOtherPrice } from '../interface/other-price.interface';

export class CreateOtherPriceDto implements IOtherPrice {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  priceListId: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  countryContractId?: string; // Country hoặc Zone // /service/zone-small-service/:id

  @ApiProperty()
  @IsOptional()
  discountRate?: string; // Tỷ lệ giảm giá (Đánh tỷ lệ %)

  @ApiProperty()
  @IsOptional()
  noteOtherPrice?: string;

  @ApiProperty()
  @IsOptional()
  country_contract: any;
}
