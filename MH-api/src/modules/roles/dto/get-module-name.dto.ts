import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GetModuleNameDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  roleId: string;
}
