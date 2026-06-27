import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { FilesToBodyInterceptor } from './common/decorators/api-file.decorator';
import { UploadDto, UploadFileDto } from './common/dto/upload-file.dto';

@Controller()
@ApiTags('MH service')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('heal-check')
  getHello(): string {
    return this.appService.healCheck();
  }

  @Post('upload-file')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'), FilesToBodyInterceptor)
  uploadFile(@Body() uploadFileDto: UploadFileDto) {
    return this.appService.uploadFile(uploadFileDto);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('upload'), FilesToBodyInterceptor)
  uploadSingleFile(@Body() uploadDto: UploadDto) {
    return this.appService.upload(uploadDto);
  }
}
