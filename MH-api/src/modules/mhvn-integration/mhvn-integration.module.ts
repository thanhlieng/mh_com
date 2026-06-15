import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { SystemAIntegrationService } from './system-a-integration.service';

@Module({
  imports: [HttpModule, ConfigModule, AuthModule],
  providers: [SystemAIntegrationService],
  exports: [SystemAIntegrationService],
})
export class SystemAIntegrationModule {}
