import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ETypeStaff } from 'src/common/constants/common.constants';
import { IManagementStaff } from '../interface/management-staff.interface';

export class CreateManagementStaffDto implements IManagementStaff {
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
  staffId: string;

  @ApiProperty({ enum: ETypeStaff })
  @IsEnum(ETypeStaff)
  typeStaff: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  updatedAt?: Date;
}
