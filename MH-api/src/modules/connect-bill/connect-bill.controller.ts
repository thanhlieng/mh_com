import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetHistory } from 'src/common/decorators/history-info.decorator';
import { Permission } from 'src/common/decorators/permission.decorator';
import { EModulePermissionName, EPermissionActionKey, EPermissionDescription } from 'src/common/guards/permission';
import IJwtPayload, { IHistoryInfo } from '../auth/payloads/jwt-payload';
import { ConnectBillService } from './connect-bill.service';
import { CreateConnectBillDto } from './dto/create-connect-bill.dto';
import { GetAnalyticsPOD, GetOrderRemaining, UpdateOrderRemaining } from './dto/get-analytic-pod.dto';
import { GetConnectBillDto } from './dto/get-connect-bill.dto';
import { GetUser } from 'src/common/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Connect-Bill')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('connect-bill')
export class ConnectBillController {
  constructor(private readonly connectBillService: ConnectBillService) {}

  @Get('analytic-pod')
  getAnalyticsPOD(@Query() inputDTO: GetAnalyticsPOD) {
    return this.connectBillService.getAnalyticsPOD(inputDTO);
  }

  @Get('export-analytic-pod')
  exportAnalyticsPOD(@Query() inputDTO: GetAnalyticsPOD) {
    return this.connectBillService.exportAnalyticsPOD(inputDTO);
  }

  @Get('order-remaining')
  getOrderRemaining(@Query() inputDTO: GetOrderRemaining) {
    return this.connectBillService.getOrderRemaining(inputDTO);
  }

  @Patch('order-remaining/:id')
  updateOrderRemaining(@Param('id') id: string, @Body() inputDTO: UpdateOrderRemaining) {
    return this.connectBillService.updateOrderRemaining(id, inputDTO);
  }

  @Get('export-order-remaining')
  exportOrderRemaining(@Query() inputDTO: GetOrderRemaining) {
    return this.connectBillService.exportOrderRemaining(inputDTO);
  }

  @Get()
  @Permission({
    action: EPermissionActionKey.MANAGE_MANIFEST,
    description: EPermissionDescription.MANAGE_MANIFEST,
    moduleName: EModulePermissionName.OPERATE,
  })
  getAll(@Query() getConnectBilLDto: GetConnectBillDto) {
    return this.connectBillService.exportConnectBillPickup(getConnectBilLDto);
  }

  @Get('op')
  @Permission({
    action: EPermissionActionKey.MANAGE_MANIFEST,
    description: EPermissionDescription.MANAGE_MANIFEST,
    moduleName: EModulePermissionName.OPERATE,
  })
  getAllWithOp(@Query() getConnectBilLDto: GetConnectBillDto) {
    return this.connectBillService.exportAllWithOp(getConnectBilLDto);
  }

  @Get('multi-parcel-op')
  @Permission({
    action: EPermissionActionKey.MANAGE_MANIFEST,
    description: EPermissionDescription.MANAGE_MANIFEST,
    moduleName: EModulePermissionName.OPERATE,
  })
  getMultiParcelOP(@Query() getConnectBilLDto: GetConnectBillDto) {
    return this.connectBillService.exportMultiParcelOP(getConnectBilLDto);
  }

  @Get('multi-parcel-pickup')
  @Permission({
    action: EPermissionActionKey.MANAGE_MANIFEST,
    description: EPermissionDescription.MANAGE_MANIFEST,
    moduleName: EModulePermissionName.OPERATE,
  })
  getMultiParcelPickup(@Query() getConnectBilLDto: GetConnectBillDto) {
    return this.connectBillService.exportMultiParcelPickup(getConnectBilLDto);
  }

  @Post()
  @Permission({
    action: EPermissionActionKey.MANAGE_MANIFEST,
    description: EPermissionDescription.MANAGE_MANIFEST,
    moduleName: EModulePermissionName.OPERATE,
  })
  createConnectBill(
    @Body() createConnectBillDto: CreateConnectBillDto, 
    @GetHistory() info: IHistoryInfo,
    @GetUser() payload: IJwtPayload,
  ) {
    return this.connectBillService.createConnectBill(createConnectBillDto, info, payload);
  }
}
