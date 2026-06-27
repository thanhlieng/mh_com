import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { TokenTypes } from '../constants/token.constant';
import { ETypeUser } from 'src/common/constants/common.constants';

export class CreateTokenDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty()
  @IsString()
  type: TokenTypes;

  @ApiProperty()
  @IsEnum(ETypeUser)
  typeUser: string;
}
