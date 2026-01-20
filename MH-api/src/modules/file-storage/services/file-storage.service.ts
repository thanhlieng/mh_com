import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, statSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface StorageResult {
  location: string;
  key: string;
  bucket?: string;
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'cloudflare' | 'backblaze';
  local?: {
    storagePath: string;
    baseUrl: string;
  };
  s3?: {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
  };
  cloudflare?: {
    accountId: string;
    token: string;
    bucket: string;
  };
  backblaze?: {
    endpoint: string;
    applicationKeyId: string;
    applicationKey: string;
    bucket: string;
  };
}

@Injectable()
export class FileStorageService {
  private readonly config: StorageConfig;

  constructor() {
    this.config = this.buildStorageConfig();
  }

  private buildStorageConfig(): StorageConfig {
    const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
    
    return {
      provider: provider as any,
      local: {
        storagePath: process.env.LOCAL_STORAGE_PATH || './uploads',
        baseUrl: process.env.LOCAL_STORAGE_URL || 'http://localhost:3002/uploads',
      },
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        bucket: process.env.AWS_S3_BUCKET || '',
        region: process.env.AWS_REGION || 'ap-southeast-1',
      },
      cloudflare: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        token: process.env.CLOUDFLARE_TOKEN || '',
        bucket: process.env.CLOUDFLARE_BUCKET || '',
      },
      backblaze: {
        endpoint: process.env.BACKBLAZE_ENDPOINT || '',
        applicationKeyId: process.env.BACKBLAZE_KEY_ID || '',
        applicationKey: process.env.BACKBLAZE_KEY || '',
        bucket: process.env.BACKBLAZE_BUCKET || '',
      },
    };
  }

  async uploadFile(file: UploadedFile): Promise<StorageResult> {
    switch (this.config.provider) {
      case 'local':
        return this.uploadToLocal(file);
      case 's3':
        return this.uploadToS3(file);
      case 'cloudflare':
        return this.uploadToCloudflare(file);
      case 'backblaze':
        return this.uploadToBackblaze(file);
      default:
        return this.uploadToLocal(file);
    }
  }

  private async uploadToLocal(file: UploadedFile): Promise<StorageResult> {
    const { storagePath, baseUrl } = this.config.local!;
    const filename = this.generateUniqueFilename(file.originalname);
    const relativePath = `images/${filename}`;
    const fullPath = join(storagePath, relativePath);

    // Ensure directory exists
    const dir = join(storagePath, 'images');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Write file
    writeFileSync(fullPath, file.buffer);

    return {
      location: `${baseUrl}/${relativePath}`,
      key: relativePath,
    };
  }

  private async uploadToS3(file: UploadedFile): Promise<StorageResult> {
    const AWS = require('aws-sdk');
    const { accessKeyId, secretAccessKey, bucket, region } = this.config.s3!;
    
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
    });

    const filename = this.generateUniqueFilename(file.originalname);
    const key = `images/${filename}`;

    const result = await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      })
      .promise();

    return {
      location: result.Location,
      key: key,
      bucket: bucket,
    };
  }

  private async uploadToCloudflare(file: UploadedFile): Promise<StorageResult> {
    // Cloudflare R2 implementation
    const filename = this.generateUniqueFilename(file.originalname);
    const key = `images/${filename}`;
    
    // Implementation for Cloudflare R2 would go here
    // For now, fallback to local
    return this.uploadToLocal(file);
  }

  private async uploadToBackblaze(file: UploadedFile): Promise<StorageResult> {
    // Backblaze B2 implementation
    const filename = this.generateUniqueFilename(file.originalname);
    const key = `images/${filename}`;
    
    // Implementation for Backblaze B2 would go here
    // For now, fallback to local
    return this.uploadToLocal(file);
  }

  private generateUniqueFilename(originalname: string): string {
    const splitOriginalname = originalname.split('.');
    const typeFile = splitOriginalname[splitOriginalname.length - 1];
    const filename = splitOriginalname
      .slice(0, splitOriginalname.length - 1)
      .join('');

    return `${filename}_${uuidv4()}.${typeFile}`;
  }

  async deleteFile(key: string): Promise<boolean> {
    switch (this.config.provider) {
      case 'local':
        return this.deleteLocalFile(key);
      case 's3':
        return this.deleteS3File(key);
      default:
        return this.deleteLocalFile(key);
    }
  }

  private async deleteLocalFile(key: string): Promise<boolean> {
    try {
      const fullPath = join(this.config.local!.storagePath, key);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting local file:', error);
      return false;
    }
  }

  private async deleteS3File(key: string): Promise<boolean> {
    try {
      const AWS = require('aws-sdk');
      const { accessKeyId, secretAccessKey, bucket, region } = this.config.s3!;
      
      const s3 = new AWS.S3({
        accessKeyId,
        secretAccessKey,
        region,
      });

      await s3.deleteObject({
        Bucket: bucket,
        Key: key,
      }).promise();

      return true;
    } catch (error) {
      console.error('Error deleting S3 file:', error);
      return false;
    }
  }

  async getFileStats(key: string): Promise<{ size: number; exists: boolean }> {
    switch (this.config.provider) {
      case 'local':
        return this.getLocalFileStats(key);
      default:
        return { size: 0, exists: false };
    }
  }

  private async getLocalFileStats(key: string): Promise<{ size: number; exists: boolean }> {
    try {
      const fullPath = join(this.config.local!.storagePath, key);
      if (existsSync(fullPath)) {
        const stats = statSync(fullPath);
        return { size: stats.size, exists: true };
      }
      return { size: 0, exists: false };
    } catch (error) {
      return { size: 0, exists: false };
    }
  }

  getStorageConfig(): StorageConfig {
    return this.config;
  }

  getStoragePath(): string {
    return this.config.local?.storagePath || './uploads';
  }
}