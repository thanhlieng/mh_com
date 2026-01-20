import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  roleId?: string;
}
