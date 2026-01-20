import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permission.decorator';
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from 'src/common/guards/permission';
import { HistoryOpsQuery, HistoryQuery } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('history')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('History')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @Permission({
    action: EPermissionActionKey.MANAGE_HISTORY,
    description: EPermissionDescription.MANAGE_HISTORY,
    moduleName: EModulePermissionName.HISTORY,
  })
  findAll(@Query() query: HistoryQuery) {
    return this.historyService.findAll(query);
  }
}
