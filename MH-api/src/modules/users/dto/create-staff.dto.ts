import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { CreateStaffsDto } from 'src/modules/staffs/dto/create-staffs.dto';

export class CreateAccountStaffDto extends CreateStaffsDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  roleId?: string;
}
