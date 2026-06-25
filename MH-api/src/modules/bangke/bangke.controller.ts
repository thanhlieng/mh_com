import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
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
import { BangKeService } from './bangke.service';

@ApiTags('bangke')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/bangke')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class BangKeController {
  constructor(private bangKeService: BangKeService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bảng kê' })
  async getBangKeList(
    @GetActiveContext() ctx: ActiveAContext,
    @Query() query: any,
  ) {
    return this.bangKeService.getBangKe(ctx, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết bảng kê' })
  async getBangKeById(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id') id: string,
  ) {
    if (!id) {
      throw new BadRequestException('Bangke ID is required');
    }
    return this.bangKeService.getBangKeById(ctx, id);
  }
}
