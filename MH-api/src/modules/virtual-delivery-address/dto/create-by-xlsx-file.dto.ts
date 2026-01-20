import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ApiFile } from 'src/common/decorators/api-file.decorator';

export class CreateVirtualAddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @ApiFile()
  file: Express.Multer.File;
}
