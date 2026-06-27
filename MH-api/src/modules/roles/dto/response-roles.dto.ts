import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsDateString, IsUUID } from 'class-validator';
import { IRoles } from '../interfaces/roles.interface';

export class ResponseRolesDto implements IRoles {
  @ApiProperty()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;
}
