import { Module } from '@nestjs/common';
import { SystemAIntegrationModule } from '../system-a-integration/system-a-integration.module';
import { AuthModule } from '../auth/auth.module';
import { ServicesCatalogService } from './services-catalog.service';
import { ServicesCatalogController } from './services-catalog.controller';

@Module({
  imports: [SystemAIntegrationModule, AuthModule],
  providers: [ServicesCatalogService],
  controllers: [ServicesCatalogController],
})
export class ServicesCatalogModule {}
