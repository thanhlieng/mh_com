import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permission.decorator';
import { EModulePermissionName, EPermissionActionKey, EPermissionDescription } from 'src/common/guards/permission';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AftershipUpdateCheckpointsDto } from '../checkpoints/dto/aftership-update-checkpoints.dto';
import { CreateCheckPointAdminDto } from './dto/create-checkpoint-admin.dto';
import { CreateTrackingsDto } from './dto/create-trackings.dto';
import { GetTrackingAdminDto } from './dto/get-tracking-admin.dto';
import { GetTrackingDto } from './dto/get-tracking.dto';
import { ResponseTrackingsDto } from './dto/response-trackings.dto';
import { UpdateCheckpointAdminDto } from './dto/update-checkpoint-admin.dto';
import { UpdateTrackingsDto } from './dto/update-trackings.dto';
import { TrackingsService } from './trackings.service';
const moduleName = EModulePermissionName.TRACKING_CHECKPOINT;

@ApiTags('Trackings')
@Controller('trackings')
export class TrackingsController {
  constructor(private readonly trackingsService: TrackingsService) {}

  @Get('update-last-tag-checkpoint/:month')
  updateLastTagCheckpoint(@Param('month') month: number) {
    return this.trackingsService.updateLastTagCheckpoint(month);
  }

  @Post('webhook-aftership-update-checkpoints')
  @HttpCode(HttpStatus.OK)
  afterShipUpdateCheckpoints(@Body() aftershipUpdateCheckpointsDto: AftershipUpdateCheckpointsDto) {
    return this.trackingsService.webhookAftershipUpdateTracking(aftershipUpdateCheckpointsDto);
  }

  @Post()
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseTrackingsDto })
  create(@Body() createTrackingsDto: CreateTrackingsDto) {
    return this.trackingsService.create(createTrackingsDto);
  }

  @Get()
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: [ResponseTrackingsDto] })
  findAll(@Query() getTrackingDto: GetTrackingDto) {
    return this.trackingsService.findTrackingByBillCodes(getTrackingDto);
  }

  @Get('checkpoint/:billCode')
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  getCheckpoint(@Param('billCode') billCode: string) {
    return this.trackingsService.getCheckpointByBillCode(billCode);
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  getAllTracking(@Query() getTrackingAdminDto: GetTrackingAdminDto) {
    return this.trackingsService.findAll(getTrackingAdminDto);
  }

  @Post('admin/checkpoint/:id')
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  createCheckPoint(@Body() createCheckPointAdminDto: CreateCheckPointAdminDto, @Param('id') id: string) {
    return this.trackingsService.createCheckpoint(createCheckPointAdminDto, id);
  }

  @Get('async-data-aftership')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  asyncDataAftership() {
    return this.trackingsService.asyncDataAftership();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseTrackingsDto })
  findOne(@Param('id') id: string) {
    return this.trackingsService.findOne(id);
  }

  @Patch('admin/checkpoint/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  updateCheckpoint(@Body() updateCheckpointAdminDto: UpdateCheckpointAdminDto, @Param('id') id: string) {
    return this.trackingsService.updateCheckpoint(updateCheckpointAdminDto, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseTrackingsDto })
  update(@Param('id') id: string, @Body() updateTrackingsDto: UpdateTrackingsDto) {
    return this.trackingsService.update(id, updateTrackingsDto);
  }

  @Delete('admin/checkpoint/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  removeCheckpoint(@Param('id') id: string) {
    return this.trackingsService.removeCheckpoint(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
    description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
    moduleName: moduleName,
  })
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.trackingsService.remove(id);
  }
}
