import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAllManifestYamatoDto {
  @ApiProperty()
  @IsString()
  packageID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  manifestPermissionKey: string;
}
