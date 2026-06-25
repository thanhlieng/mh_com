import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import {
  ActiveTargetGuard,
  ActiveAContext,
} from 'src/common/guards/active-target.guard';
import { GetActiveContext } from 'src/common/decorators/active-context.decorator';
import { ServicesCatalogService } from './services-catalog.service';

@ApiTags('services-catalog')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/services-catalog')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class ServicesCatalogController {
  constructor(private servicesCatalogService: ServicesCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy services catalog từ hệ A theo target' })
  async getServicesCatalog(
    @GetActiveContext() ctx: ActiveAContext,
    @Query() query: any,
  ) {
    return this.servicesCatalogService.getServicesCatalog(ctx.target, query);
  }
}
