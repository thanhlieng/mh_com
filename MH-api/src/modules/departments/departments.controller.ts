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
import { DepartmentService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-departments.dto';
import { UpdateDepartmentDto } from './dto/update-departments.dto';
import { ResponseDepartmentDto } from './dto/response-departments.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetDepartmentDto } from './dto/get-departments.dto';

@ApiTags('Department')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOkResponse({ type: ResponseDepartmentDto })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseDepartmentDto] })
  findAll(@Query() getDepartmentDto: GetDepartmentDto) {
    return this.departmentService.findAll(getDepartmentDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseDepartmentDto })
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ResponseDepartmentDto })
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
