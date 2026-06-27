import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiFile } from '../decorators/api-file.decorator';

export class UploadFileDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  @ApiFile()
  files: Array<Express.Multer.File>;
}

export class UploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  @ApiFile()
  upload: Array<Express.Multer.File>;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ckCsrfToken: string;
}
