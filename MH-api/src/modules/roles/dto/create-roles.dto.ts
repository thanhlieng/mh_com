import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

export class CreateRolesDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsBoolean()
  @Type(() => Boolean)
  active: boolean;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  permissions: string[];
}
