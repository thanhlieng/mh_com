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
  Query,
} from '@nestjs/common';
import { CheckpointsService } from './checkpoints.service';
import { CreateCheckpointsDto } from './dto/create-checkpoints.dto';
import { UpdateCheckpointsDto } from './dto/update-checkpoints.dto';
import { ResponseCheckpointsDto } from './dto/response-checkpoints.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BillCodeDto } from './dto/bill-code.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from 'src/common/guards/permission';
import { CreateMultipleCheckpointDto } from './dto/create-multiple-checkpoint.dto';
const moduleName = EModulePermissionName.TRACKING_CHECKPOINT;

@ApiTags('Checkpoints')
@Controller('checkpoints')
@Permission({
  action: EPermissionActionKey.MANAGE_TRACKING_CHECKPOINT,
  description: EPermissionDescription.MANAGE_TRACKING_CHECKPOINT,
  moduleName: moduleName,
})
export class CheckpointsController {
  constructor(private readonly checkpointsService: CheckpointsService) {}

  @Patch()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateMessage() {
    return this.checkpointsService.updateMessage();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCheckpointsDto })
  create(@Body() createCheckpointsDto: CreateCheckpointsDto) {
    return this.checkpointsService.create(createCheckpointsDto);
  }

  @Post('multiple')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  createMultipleCheckpoint(
    @Body() createMultipleCheckpointDto: CreateMultipleCheckpointDto,
  ) {
    return this.checkpointsService.createMultipleCheckpoints(
      createMultipleCheckpointDto,
    );
  }

  @Get('checkpoints-by-bill-code')
  getCheckpointsByBillCode(@Query() billCodeDto: BillCodeDto) {
    return this.checkpointsService.getCheckpointByBillCode(billCodeDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: [ResponseCheckpointsDto] })
  findAll() {
    return this.checkpointsService.findAll();
  }

  @Get('checkpoints-by-mawb-code/:code')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getAllCheckpointsByMAWBCode(@Param('code') mawbCode: string) {
    return this.checkpointsService.getAllCheckpointsByMAWBCode(mawbCode);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: ResponseCheckpointsDto })
  findOne(@Param('id') id: string) {
    return this.checkpointsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCheckpointsDto })
  update(
    @Param('id') id: string,
    @Body() updateCheckpointsDto: UpdateCheckpointsDto,
  ) {
    return this.checkpointsService.update(id, updateCheckpointsDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.checkpointsService.remove(id);
  }
}
