import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetHistory } from 'src/common/decorators/history-info.decorator';
import { Permission } from 'src/common/decorators/permission.decorator';
import { GetUser } from 'src/common/decorators/user.decorator';
import { EModulePermissionName, EPermissionActionKey, EPermissionDescription } from 'src/common/guards/permission';
import { RolesGuard } from 'src/common/guards/roles.guard';
import IJwtPayload, { IHistoryInfo } from '../auth/payloads/jwt-payload';
import { ExportStaffDto, FilterStaffDto } from './dto/filter-staff.dto';
import { ResponseListStaffDto, ResponseStaffsDto } from './dto/response-staffs.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateStaffsDto } from './dto/update-staffs.dto';
import { StaffsService } from './staffs.service';

const moduleName = EModulePermissionName.STAFF;

@ApiTags('Staffs')
@ApiBearerAuth()
@Controller('staffs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @Get()
  @Permission({
    action: EPermissionActionKey.GET_LIST_STAFF,
    description: EPermissionDescription.GET_LIST_STAFF,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseListStaffDto })
  findAll(@Query() filterStaffDto: FilterStaffDto) {
    return this.staffsService.findAll(filterStaffDto);
  }

  @Get('roles-staff/:id')
  getRolesStaff(@Param('id') id: string) {
    return this.staffsService.getRolesStaff(id);
  }

  @Get('find-all-staff')
  findAllStaff() {
    return this.staffsService.findAllStaff();
  }

  @Get('/my-profile')
  @ApiOkResponse({ type: ResponseStaffsDto })
  myProfile(@GetUser() payload: IJwtPayload) {
    return this.staffsService.getStaffByPayload(payload);
  }

  @Get('export-staffs')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission({
    action: EPermissionActionKey.GET_LIST_STAFF,
    description: EPermissionDescription.GET_LIST_STAFF,
    moduleName: moduleName,
  })
  exportStaffs(@Query() dto: ExportStaffDto) {
    return this.staffsService.exportStaffExcelFile(dto);
  }

  @Get(':id')
  @Permission({
    action: EPermissionActionKey.GET_STAFF_DETAIL,
    description: EPermissionDescription.GET_STAFF_DETAIL,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseStaffsDto })
  findOne(@Param('id') id: string) {
    return this.staffsService.findOne(id);
  }

  @Patch(':id')
  @Permission({
    action: EPermissionActionKey.UPDATE_STAFF,
    description: EPermissionDescription.UPDATE_STAFF,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseStaffsDto })
  update(@Param('id') id: string, @Body() updateStaffsDto: UpdateStaffsDto, @GetHistory() info: IHistoryInfo) {
    return this.staffsService.update(id, updateStaffsDto, info);
  }

  @Patch('/update-role/:id')
  @Permission({
    action: EPermissionActionKey.UPDATE_STAFF,
    description: EPermissionDescription.UPDATE_STAFF,
    moduleName: moduleName,
  })
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.staffsService.updateRole(id, updateRoleDto);
  }
}
