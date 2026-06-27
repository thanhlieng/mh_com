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
import { RolesService } from './roles.service';
import { CreateRolesDto } from './dto/create-roles.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { ResponseRolesDto } from './dto/response-roles.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { GetRolesDto } from './dto/get-roles.dto';
import { GetModuleNameDto } from './dto/get-module-name.dto';
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from 'src/common/guards/permission';

const moduleName = EModulePermissionName.ROLE;
@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permission({
    action: EPermissionActionKey.CREATE_ROLE,
    description: EPermissionDescription.CREATE_ROLE,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseRolesDto })
  create(@Body() createRolesDto: CreateRolesDto) {
    return this.rolesService.create(createRolesDto);
  }

  @Get()
  @Permission({
    action: EPermissionActionKey.GET_LIST_ROLE,
    description: EPermissionDescription.GET_LIST_ROLE,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: [ResponseRolesDto] })
  findAll(@Query() getRolesDto: GetRolesDto) {
    return this.rolesService.findAll(getRolesDto);
  }

  @Get('roles-active')
  getRolesActive() {
    return this.rolesService.getRolesActive();
  }

  @Get('module-name')
  @Permission({
    action: EPermissionActionKey.GET_LIST_ROLE,
    description: EPermissionDescription.GET_LIST_ROLE,
    moduleName: moduleName,
  })
  getAllModuleName(@Query() getModuleNameDto: GetModuleNameDto) {
    return this.rolesService.getAllCategoryRoleName(getModuleNameDto);
  }

  @Get(':id')
  @Permission({
    action: EPermissionActionKey.GET_ROLE_DETAIL,
    description: EPermissionDescription.GET_ROLE_DETAIL,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseRolesDto })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permission({
    action: EPermissionActionKey.UPDATE_ROLE,
    description: EPermissionDescription.UPDATE_ROLE,
    moduleName: moduleName,
  })
  @ApiOkResponse({ type: ResponseRolesDto })
  update(@Param('id') id: string, @Body() updateRolesDto: UpdateRolesDto) {
    return this.rolesService.update(id, updateRolesDto);
  }

  @Delete(':id')
  @ApiOkResponse()
  @Permission({
    action: EPermissionActionKey.DELETE_ROLE,
    description: EPermissionDescription.DELETE_ROLE,
    moduleName: moduleName,
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
