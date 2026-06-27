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
import { UnitsService } from './units.service';
import { CreateUnitsDto } from './dto/create-units.dto';
import { UpdateUnitsDto } from './dto/update-units.dto';
import { ResponseUnitsDto } from './dto/response-units.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetUnitDto } from './dto/get-units.dto';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseUnitsDto })
  create(@Body() createUnitsDto: CreateUnitsDto) {
    return this.unitsService.create(createUnitsDto);
  }

  @Get('get-all-with-filter')
  @ApiOkResponse({ type: [ResponseUnitsDto] })
  findAll(@Query() getUnitDto: GetUnitDto) {
    return this.unitsService.findAll(getUnitDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseUnitsDto] })
  find() {
    return this.unitsService.find();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseUnitsDto })
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseUnitsDto })
  update(@Param('id') id: string, @Body() updateUnitsDto: UpdateUnitsDto) {
    return this.unitsService.update(id, updateUnitsDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}
