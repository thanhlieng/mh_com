import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum } from 'class-validator';
import { ETypeUser } from 'src/common/constants/common.constants';
import { ResponseRolesDto } from 'src/modules/roles/dto/response-roles.dto';

export class ResponseUsersDto {
  @ApiProperty()
  @IsEmail()
  username: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsEnum(ETypeUser)
  typeUser: string;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({ nullable: true, description: 'ID nhà cung cấp — có giá trị nếu user là supplier' })
  a_supplier_id: string | null;

  @ApiProperty({ nullable: true, description: 'ID khách hàng — có giá trị nếu user là customer' })
  a_customer_id: string | null;
}
