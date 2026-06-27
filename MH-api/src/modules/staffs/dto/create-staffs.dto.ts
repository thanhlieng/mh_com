import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Gender, LevelStaff, Status } from 'src/common/constants/common.constants';

export class CreateStaffsDto {
  @ApiProperty({ required: false, enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsUUID()
  unitId: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  departmentId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  position: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: string;

  @ApiProperty()
  @IsString()
  dayOfBirth: Date;

  @ApiProperty()
  @IsString()
  placeOfBirth: string;

  @ApiProperty()
  @IsString()
  temporaryAddress: string;

  @ApiProperty()
  @IsString()
  permanentAddress: string;

  @ApiProperty()
  @IsString()
  ethnic: string;

  @ApiProperty()
  @IsString()
  religion: string;

  @ApiProperty()
  @IsString()
  nationality: string;

  @ApiProperty({ enum: LevelStaff })
  @IsString()
  level: string;

  @ApiProperty()
  @IsString()
  marital: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  element: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsEmail()
  emailCompany: string;

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
  @IsString()
  issueDate: Date;

  @ApiProperty()
  @IsString()
  issuePlace: string;

  @ApiProperty()
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
  @IsOptional()
  @IsString()
  latestPromotionDate: Date;

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  files: string[];
}
