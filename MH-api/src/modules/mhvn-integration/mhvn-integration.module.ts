import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { MhvnIntegrationService } from './mhvn-integration.service';

@Module({
  imports: [HttpModule, ConfigModule, AuthModule],
  providers: [MhvnIntegrationService],
  exports: [MhvnIntegrationService],
})
export class MhvnIntegrationModule {}
