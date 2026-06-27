import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServiceService } from './services.service';
import { CreateServiceDto } from './dto/create-services.dto';
import { UpdateServiceDto } from './dto/update-services.dto';
import { ResponseServiceDto } from './dto/response-services.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateZoneSmallServiceDto } from './dto/create-zone-small-service.dto';
import { GetUser } from 'src/common/decorators/user.decorator';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { Query } from '@nestjs/common/decorators/http/route-params.decorator';
import { GetPartnerServiceDto } from './dto/get-partner-service.dto';
import { CreatePartnerServiceDto } from './dto/create-partner-service.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from 'src/common/guards/permission';
import { CalculateBulkyWeightDto } from './dto/calculate-bulky-weight.dto';

const moduleName = EModulePermissionName.CATEGORY;
@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission({
    action: EPermissionActionKey.MANAGE_CATEGORY,
    description: EPermissionDescription.MANAGE_CATEGORY,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseServiceDto })
  @ApiBearerAuth()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Post('partner-service')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission({
    action: EPermissionActionKey.MANAGE_CATEGORY,
    description: EPermissionDescription.MANAGE_CATEGORY,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseServiceDto })
  @ApiBearerAuth()
  createPartnerService(
    @Body() createPartnerServiceDto: CreatePartnerServiceDto,
  ) {
    return this.serviceService.createPartnerService(createPartnerServiceDto);
  }

  @Post('create-zone-small-service/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission({
    action: EPermissionActionKey.MANAGE_CATEGORY,
    description: EPermissionDescription.MANAGE_CATEGORY,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseServiceDto })
  @ApiBearerAuth()
  createZoneSmallService(
    @Body() createZoneSmallServiceDto: CreateZoneSmallServiceDto,
    @Param('id') id: string,
  ) {
    return this.serviceService.createZoneSmallService(
      createZoneSmallServiceDto,
      id,
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResponseServiceDto] })
  findAll(@GetUser() payload: IJwtPayload) {
    return this.serviceService.findAll(payload);
  }

  @Get('calculate-bulky-weight')
  calculateBulkyWeight(
    @Query() calculateBulkyWeightDto: CalculateBulkyWeightDto,
  ) {
    return this.serviceService.calculateBulkyWeight(calculateBulkyWeightDto);
  }

  @Get('partner-service')
  @ApiOkResponse({ type: [ResponseServiceDto] })
  findPartnerService(@Query() getPartnerServiceDto: GetPartnerServiceDto) {
    return this.serviceService.findPartnerService(getPartnerServiceDto);
  }

  @Get('connect-partner-service')
  @ApiOkResponse({ type: [ResponseServiceDto] })
  findConnectPartnerService() {
    return this.serviceService.findConnectServicePartner();
  }

  @Get('small-service')
  @ApiOkResponse({ type: [ResponseServiceDto] })
  findSmallService() {
    return this.serviceService.findSmallService();
  }

  @Get('zone-small-service/:id')
  findZoneSmallService(@Param('id') id: string) {
    return this.serviceService.findZoneSmallService(id);
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseServiceDto })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne({
      where: {
        id: id,
      },
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseServiceDto })
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.MANAGE_CATEGORY,
    description: EPermissionDescription.MANAGE_CATEGORY,
    moduleName: moduleName,
  })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.MANAGE_CATEGORY,
    description: EPermissionDescription.MANAGE_CATEGORY,
    moduleName: moduleName,
  })
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
