import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ApiFile } from 'src/common/decorators/api-file.decorator';

export class ImportStatisticalFileDto {
  @ApiProperty()
  @ApiFile()
  @IsOptional()
  file: Express.Multer.File;
}
