import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
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
import { SupplierChangeRequestsService } from './supplier-change-requests.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';

/**
 * mhcom endpoint phục vụ màn "Đề nghị thay đổi" (change request) của NCC.
 * Proxy CRUD yêu cầu thay đổi cost PNL sang hệ thống A theo supplier
 * + target (mhvn|gp) lấy từ header `X-A-Target`.
 */
@ApiTags('supplier-change-requests')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-A-Target',
  required: true,
  description: "Target hệ A: 'mhvn' | 'gp'. Bắt buộc.",
})
@Controller('api/supplier/change-requests')
@UseGuards(JwtAuthGuard, ActiveTargetGuard)
export class SupplierChangeRequestsController {
  constructor(private readonly service: SupplierChangeRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách yêu cầu thay đổi cost của supplier' })
  async findAll(@GetActiveContext() ctx: ActiveAContext) {
    return this.service.findAll(ctx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết yêu cầu thay đổi cost' })
  async findOne(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(ctx, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu thay đổi cost' })
  async create(
    @GetActiveContext() ctx: ActiveAContext,
    @Body() dto: CreateChangeRequestDto[],
  ) {
    return this.service.create(ctx, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy yêu cầu thay đổi cost (chỉ khi PENDING)' })
  async remove(
    @GetActiveContext() ctx: ActiveAContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(ctx, id);
  }
}
