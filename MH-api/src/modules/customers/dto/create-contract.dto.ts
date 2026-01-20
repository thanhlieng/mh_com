import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ETypeContract } from 'src/common/constants/common.constants';
import { ApiFile } from 'src/common/decorators/api-file.decorator';
import { IContract } from '../interface/contract.interface';

export class CreateContractDto implements IContract {
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
  @IsOptional()
  service?: string;

  @ApiProperty()
  @IsBoolean()
  expertise: boolean;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  appraisalStaff: string;

  @ApiProperty()
  @IsString()
  contractCode: string;

  @ApiProperty()
  @IsString()
  contractName: string;

  @ApiProperty({ enum: ETypeContract })
  @IsEnum(ETypeContract)
  typeContract: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  contractTermFrom?: Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  contractTermTo?: Date;

  @ApiProperty()
  @IsString()
  paymentSchedule: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  noteContract?: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  files: string[];

  @ApiProperty()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty()
  @IsOptional()
  updatedAt: Date;
}
