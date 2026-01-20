import { Controller, Get, Post, UploadedFile, UseInterceptors, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from '../services/file-storage.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('File Storage')
@Controller('file-storage')
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      const result = await this.fileStorageService.uploadFile(file);
      
      return {
        message: 'File uploaded successfully',
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error uploading file',
        error: error.message,
      };
    }
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('key') key: string) {
    try {
      const success = await this.fileStorageService.deleteFile(key);
      
      return {
        message: success ? 'File deleted successfully' : 'File not found',
        success,
      };
    } catch (error) {
      return {
        message: 'Error deleting file',
        error: error.message,
      };
    }
  }

  @Get('stats/:key')
  @ApiOperation({ summary: 'Get file statistics' })
  @ApiResponse({ status: 200, description: 'File statistics retrieved' })
  async getFileStats(@Param('key') key: string) {
    try {
      const stats = await this.fileStorageService.getFileStats(key);
      
      return {
        key,
        ...stats,
      };
    } catch (error) {
      return {
        message: 'Error getting file stats',
        error: error.message,
      };
    }
  }

  @Get('config')
  @ApiOperation({ summary: 'Get storage configuration' })
  @ApiResponse({ status: 200, description: 'Storage configuration' })
  getStorageConfig() {
    const config = this.fileStorageService.getStorageConfig();
    
    // Remove sensitive information
    const safeConfig = {
      provider: config.provider,
      local: config.local,
    };

    return {
      config: safeConfig,
    };
  }
}