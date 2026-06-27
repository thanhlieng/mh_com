import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}

export class AdminResetPassDto {
  @ApiProperty({ example: 'password', required: true, type: String })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'e6590e60-6508-4c11-ab99-27e962488e81',
    required: true,
    type: String,
  })
  @IsUUID()
  userId: string;
}
