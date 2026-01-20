import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { IDepartment } from '../departments.interface';

export class ResponseDepartmentDto implements IDepartment {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
