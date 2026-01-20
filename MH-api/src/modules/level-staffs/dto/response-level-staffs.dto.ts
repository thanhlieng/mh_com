import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';
import { ILevelStaffs } from '../interface/level-staffs.interface';

export class ResponseLevelStaffsDto implements ILevelStaffs {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
