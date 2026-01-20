import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AuthMessage } from '../constants/auth-message.enum';
import { ResponseLogInDto } from './response-login.dto';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ResponseRefreshTokenDto extends ResponseLogInDto {}

export class LogOutDto extends RefreshTokenDto {}

export class ResponseLogOutDto {
  @ApiProperty({ default: AuthMessage.LOGGED_OUT })
  message: string;
}
