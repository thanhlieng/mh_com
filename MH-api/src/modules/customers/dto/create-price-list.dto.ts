import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { IPriceList } from '../interface/price-list.interface';
import { CreateOtherPriceDto } from './create-other-price.dto';

export class CreatePriceListDto implements IPriceList {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty()
  @IsUUID()
  serviceRequestId: string; // Dịch vụ yêu cầu /service/small-service

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  potentialRevenueFrom: number; // Doanh thu tiềm năng từ

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  potentialRevenueTo: number; // Doanh thu tiềm năng đến

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fixedPriceCode?: string; // Mã bảng giá cố định // Enum EFixedPriceCode

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  priceCodeDocument?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lightPriceCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  heavyPriceCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  surcharge?: string; // Phụ phí xăng dầu áp dụng

  @ApiProperty()
  @IsOptional()
  exchangeRate?: string; //Tỷ giá

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  timeApplyFrom?: Date; // Từ ngày

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  timeApplyTo?: Date; // Đến ngày

  @ApiProperty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOtherPriceDto)
  otherPrices?: CreateOtherPriceDto[]; // Giá khác

  @ApiProperty()
  @IsOptional()
  otherPrice: string;

  @ApiProperty()
  @IsOptional()
  discountRate?: string; // Tỷ lệ giảm giá (Đánh tỷ lệ %)

  @ApiProperty()
  @IsOptional()
  @IsString()
  notePriceList?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notePriceList2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lkdRate?: number; // Tỷ lệ LKD/Giá bán gốc chưa phụ phí

  @ApiProperty()
  @IsOptional()
  @IsString()
  priceListRequested: string; // 'Bảng giá yêu cầu'

  @ApiProperty()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty()
  @IsOptional()
  updatedAt: Date;

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  files: string[];
}
