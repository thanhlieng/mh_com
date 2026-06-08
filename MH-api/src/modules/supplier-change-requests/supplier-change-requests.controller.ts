import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../users/user.entity';
import { SupplierChangeRequestsService } from './supplier-change-requests.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';

/**
 * System B endpoint phục vụ màn "Đề nghị thay đổi" (change request) của NCC.
 * Proxy CRUD yêu cầu thay đổi cost PNL sang hệ thống A theo supplier.
 */
@ApiTags('supplier-change-requests')
@ApiBearerAuth()
@Controller('api/supplier/change-requests')
@UseGuards(JwtAuthGuard)
export class SupplierChangeRequestsController {
  constructor(
    private readonly service: SupplierChangeRequestsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách yêu cầu thay đổi cost của supplier' })
  async findAll(@GetUser() user: UserEntity) {
    const { a_supplier_id } = user;
    if (!a_supplier_id) {
      throw new ConflictException(
        'Tài khoản chưa được liên kết với nhà cung cấp. Vui lòng liên hệ quản trị viên.',
      );
    }
    return this.service.findAll(a_supplier_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết yêu cầu thay đổi cost' })
  async findOne(
    @GetUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const { a_supplier_id } = user;
    if (!a_supplier_id) {
      throw new ConflictException(
        'Tài khoản chưa được liên kết với nhà cung cấp. Vui lòng liên hệ quản trị viên.',
      );
    }
    return this.service.findOne(a_supplier_id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu thay đổi cost' })
  async create(
    @GetUser() user: UserEntity,
    @Body() dto: CreateChangeRequestDto,
  ) {
    const { a_supplier_id } = user;
    if (!a_supplier_id) {
      throw new ConflictException(
        'Tài khoản chưa được liên kết với nhà cung cấp. Vui lòng liên hệ quản trị viên.',
      );
    }
    return this.service.create(a_supplier_id, dto);
  }
}
