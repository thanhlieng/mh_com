import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../users/user.entity';
import { ActiveLinkService } from 'src/common/services/active-link.service';
import { SupplierChangeRequestsService } from './supplier-change-requests.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';

/**
 * System B endpoint phục vụ màn "Đề nghị thay đổi" (change request) của NCC.
 * Proxy CRUD yêu cầu thay đổi cost PNL sang hệ thống A theo supplier.
 */
@ApiTags('supplier-change-requests')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Active-Supplier-Id',
  required: false,
  description:
    'Id supplier (bên A) đang thao tác. Bắt buộc khi account liên kết nhiều supplier.',
})
@Controller('api/supplier/change-requests')
@UseGuards(JwtAuthGuard)
export class SupplierChangeRequestsController {
  constructor(
    private readonly service: SupplierChangeRequestsService,
    private readonly activeLinkService: ActiveLinkService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách yêu cầu thay đổi cost của supplier' })
  async findAll(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.service.findAll(a_supplier_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết yêu cầu thay đổi cost' })
  async findOne(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.service.findOne(a_supplier_id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu thay đổi cost' })
  async create(
    @GetUser() user: UserEntity,
    @Headers('x-active-supplier-id') activeSupplierId: string,
    @Body() dto: CreateChangeRequestDto,
  ) {
    const a_supplier_id = await this.activeLinkService.resolveSupplier(
      user,
      activeSupplierId,
    );
    return this.service.create(a_supplier_id, dto);
  }
}
