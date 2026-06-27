import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseUsersDto } from 'src/modules/users/dto/response-users.dto';

export class ResponseTokenDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  expires?: Date;
}

export class TokenDto {
  @ApiProperty()
  access: ResponseTokenDto;

  @ApiProperty()
  refresh: ResponseTokenDto;
}

export class ResponseLogInDto {
  @ApiProperty()
  user: ResponseUsersDto;

  @ApiProperty()
  tokens: TokenDto;

}
