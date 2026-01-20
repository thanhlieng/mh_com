import { Injectable } from '@nestjs/common';
import { CommonResponse } from './common/constants/common.constants';
import { UploadDto, UploadFileDto } from './common/dto/upload-file.dto';
import { commonResponse } from './common/helper/common-response';
import { FileStorageService } from './modules/file-storage/services/file-storage.service';
import { UploadedFile } from './modules/file-storage/services/file-storage.service';

@Injectable()
export class AppService {
  constructor(private fileStorageService: FileStorageService) {}

  healCheck(): string {
    return 'OK! SohanDEV';
  }

  async uploadFile(uploadFileDto: UploadFileDto) {
    const { files } = uploadFileDto;

    const result = [];
    for (let i = 0; i < files?.length; i++) {
      const uploadedFile: UploadedFile = {
        originalname: files[i].originalname,
        buffer: files[i].buffer,
        mimetype: files[i].mimetype,
        size: files[i].size,
      };
      const uploadResult = await this.fileStorageService.uploadFile(uploadedFile);
      result.push(uploadResult.location);
    }

    return commonResponse(CommonResponse.SUCCESS, result);
  }

  async upload(uploadDto: UploadDto) {
    const { upload } = uploadDto;
    const result = [];
    for (let i = 0; i < upload?.length; i++) {
      const uploadedFile: UploadedFile = {
        originalname: upload[i].originalname,
        buffer: upload[i].buffer,
        mimetype: upload[i].mimetype,
        size: upload[i].size,
      };
      const uploadResult = await this.fileStorageService.uploadFile(uploadedFile);
      result.push(uploadResult.location);
    }

    return {
      uploaded: result.length,
      url: result,
    };
  }
}
