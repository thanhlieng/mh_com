import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthMessage } from './constants/auth-message.enum';
import { LoginDto } from './dto/login.dto';
import {
  RefreshTokenDto,
  ResponseRefreshTokenDto,
} from './dto/refresh-token.dto';
import { ResponseLogInDto } from './dto/response-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AuthMessage.LOGGED_IN,
    type: ResponseLogInDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: AuthMessage.LOGGIN_FAILED,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AuthMessage.LOGGIN_FAILED,
  })
  async logIn(@Body() logInDto: LoginDto): Promise<ResponseLogInDto> {
    return this.authService.userLogin(logInDto);
  }

  @Post('refresh-tokens')
  @ApiOperation({ summary: 'get a new access and refresh token' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: AuthMessage.REFRESHED_TOKEN_OK,
    type: ResponseRefreshTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: AuthMessage.REFRESH_TOKEN_NOT_FOUND,
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ResponseRefreshTokenDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
