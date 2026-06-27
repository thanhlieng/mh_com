import { Module } from '@nestjs/common';
import { FileStorageService } from './services/file-storage.service';
import { FileStorageController } from './controllers/file-storage.controller';

@Module({
  controllers: [FileStorageController],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}