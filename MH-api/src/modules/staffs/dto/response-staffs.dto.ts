import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/common';
import { ResponseDepartmentDto } from 'src/modules/departments/dto/response-departments.dto';
import { ResponseUnitsDto } from 'src/modules/units/dto/response-units.dto';
import { IStaffs } from '../staffs.interface';

export class ResponseStaffsDto implements IStaffs {
  @ApiProperty()
  @IsString()
  unitId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  staffCode: string;

  @ApiProperty()
  @IsString()
  departmentId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  position: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dayOfBirth: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  placeOfBirth: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  temporaryAddress: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  permanentAddress: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  ethnic: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  religion: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nationality: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  level: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  marital: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  element: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  phoneCode: string;

  @ApiProperty()
  @IsString()
  peopleId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  issueDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  issuePlace: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  region: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  taxCode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bankAccountNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bankCode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  socialInsuranceId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  healthInsuranceId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  unionBookNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  insuranceParticipationDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  issueInsuranceDate: Date;

  @ApiProperty()
  department: ResponseDepartmentDto;

  @ApiProperty()
  unit: ResponseUnitsDto;
}

export class ResponseListStaffDto {
  @ApiProperty({ type: [ResponseStaffsDto] })
  data: ResponseStaffsDto[];

  @ApiProperty()
  pagination: PaginationDto;
}
