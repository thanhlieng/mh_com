import { FileStorageService } from '../modules/file-storage/services/file-storage.service';
import { UploadedFile } from '../modules/file-storage/services/file-storage.service';

// Legacy AWS S3 configuration - now uses FileStorageService
// This file is deprecated - use FileStorageService instead
// import * as AWS from 'aws-sdk';
// import { awsConfig } from './configs.constants';

export class FileUploader {
  constructor(private fileStorageService: FileStorageService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadedFile: UploadedFile = {
      originalname: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    };

    const result = await this.fileStorageService.uploadFile(uploadedFile);
    return result.location;
  }
}

// Export a function for backward compatibility
export const uploadFile = async (
  file: Express.Multer.File,
  fileStorageService?: FileStorageService,
): Promise<string> => {
  if (!fileStorageService) {
    throw new Error('FileStorageService instance is required. Please inject FileStorageService and use the uploadFile method.');
  }
  
  const uploader = new FileUploader(fileStorageService);
  return uploader.uploadFile(file);
};
