import { Module } from '@nestjs/common';
import { MhvnIntegrationModule } from '../mhvn-integration/mhvn-integration.module';
import { AuthModule } from '../auth/auth.module';
import { ServicesCatalogService } from './services-catalog.service';
import { ServicesCatalogController } from './services-catalog.controller';

@Module({
  imports: [MhvnIntegrationModule, AuthModule],
  providers: [ServicesCatalogService],
  controllers: [ServicesCatalogController],
})
export class ServicesCatalogModule {}
