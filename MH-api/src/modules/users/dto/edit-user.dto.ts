import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class EditUserDto extends OmitType(CreateUserDto, [
  'password',
  'username',
]) {
  @ApiProperty()
  @IsString()
  status: string;
}
