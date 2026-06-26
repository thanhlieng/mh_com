import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import {
  ActiveAContext,
  ActiveTargetGuard,
} from 'src/common/guards/active-target.guard';
import { GetActiveContext } from 'src/common/decorators/active-context.decorator';
import { SupplierQualityReportsService } from './supplier-quality-reports.service';

/**
 * Báo cáo chất lượng cho NCC (phía mhcom). Proxy sang Django:
 *   /api/mhcom/supplier/quality-reports/*
 *
 * 2 tab: "Báo cáo đã gửi" (NCC tạo) và "Báo cáo đã nhận" (MHVN tạo về NCC).
 */
@ApiTags('supplier-quality-reports')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/supplier/quality-reports')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class SupplierQualityReportsController {
  constructor(
    private readonly service: SupplierQualityReportsService,
  ) {}

  @Get('options')
  @ApiOperation({ summary: 'Lấy meta (severity, status, allowed actions)' })
  options(@GetActiveContext() ctx: ActiveAContext) {
    return this.service.options(ctx);
  }

  @Get()
  @ApiOperation({ summary: 'List báo cáo (tab=sent|received) + filter + pagination' })
  list(
    @GetActiveContext() ctx: ActiveAContext,
    @Query('tab') tab?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return this.service.list(ctx, {
      tab,
      page: page ? Number(page) : undefined,
      page_size: pageSize ? Number(pageSize) : undefined,
      from,
      to,
      status,
      severity,
    });
  }

  @Post()
  @ApiOperation({ summary: 'NCC tạo báo cáo mới (status mặc định: sent)' })
  create(
    @GetActiveContext() ctx: ActiveAContext,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.create(ctx, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết báo cáo' })
  detail(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.detail(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'NCC sửa báo cáo NCC tự tạo (chỉ khi đang ở trạng thái sent)',
  })
  update(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.update(ctx, id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'NCC xóa báo cáo NCC tự tạo (chỉ khi đang ở trạng thái sent)',
  })
  remove(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(ctx, id);
  }

  @Post(':id/status')
  @ApiOperation({
    summary:
      'NCC chuyển trạng thái cho báo cáo MHVN đã tạo (received | processed | rejected)',
  })
  changeStatus(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    return this.service.changeStatus(ctx, id, body?.status);
  }
}
