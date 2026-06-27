import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  roleIds: string[];
}
