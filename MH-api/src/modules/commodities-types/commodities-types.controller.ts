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
import { CommoditiesTypeService } from './commodities-types.service';
import { CreateCommoditiesTypeDto } from './dto/create-commodities-types.dto';
import { UpdateCommoditiesTypeDto } from './dto/update-commodities-types.dto';
import { ResponseCommoditiesTypeDto } from './dto/response-commodities-types.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('CommoditiesType')
@Controller('commodities-type')
export class CommoditiesTypeController {
  constructor(
    private readonly commoditiesTypeService: CommoditiesTypeService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCommoditiesTypeDto })
  @ApiBearerAuth()
  create(@Body() createCommoditiesTypeDto: CreateCommoditiesTypeDto) {
    return this.commoditiesTypeService.create(createCommoditiesTypeDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseCommoditiesTypeDto] })
  findAll() {
    return this.commoditiesTypeService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseCommoditiesTypeDto })
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.commoditiesTypeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCommoditiesTypeDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateCommoditiesTypeDto: UpdateCommoditiesTypeDto,
  ) {
    return this.commoditiesTypeService.update(id, updateCommoditiesTypeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.commoditiesTypeService.remove(id);
  }
}
