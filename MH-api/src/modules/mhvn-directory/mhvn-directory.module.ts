import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { AuthModule } from '../auth/auth.module';
import { MhvnDirectoryService } from './mhvn-directory.service';
import { MhvnDirectoryController } from './mhvn-directory.controller';

@Module({
  imports: [MhvnIntegrationModule, AuthModule],
  providers: [MhvnDirectoryService],
  controllers: [MhvnDirectoryController],
  exports: [MhvnDirectoryService],
})
export class MhvnDirectoryModule {}
