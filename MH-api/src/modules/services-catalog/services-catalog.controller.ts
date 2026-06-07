import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { ServicesCatalogService } from './services-catalog.service';

@Controller('api/services-catalog')
@UseGuards(JwtAuthGuard)
export class ServicesCatalogController {
  constructor(private servicesCatalogService: ServicesCatalogService) {}

  @Get()
  async getServicesCatalog(@Query() query: any) {
    return this.servicesCatalogService.getServicesCatalog(query);
  }
}
