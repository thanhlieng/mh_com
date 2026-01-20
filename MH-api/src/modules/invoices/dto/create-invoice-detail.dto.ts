import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UnitOfMeasure } from 'src/common/constants/common.constants';

export class CreateInvoiceDetailDto {
  @ApiProperty()
  @IsString()
  goodsName: string;

  @ApiProperty()
  @IsString()
  describe: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ enum: UnitOfMeasure })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  weight: number;

  @ApiProperty()
  @IsString()
  originOfGoods: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  HSCode: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  invoiceId: string;
}
