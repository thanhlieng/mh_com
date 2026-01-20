import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Enter your username',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Enter your password',
    example: 'string',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
