import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { ICompanies } from '../companies.interface';

export class ResponseCompaniesDto implements ICompanies {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address: string;
}
