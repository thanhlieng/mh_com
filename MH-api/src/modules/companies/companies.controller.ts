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
import { CompaniesService } from './companies.service';
import { CreateCompaniesDto } from './dto/create-companies.dto';
import { UpdateCompaniesDto } from './dto/update-companies.dto';
import { ResponseCompaniesDto } from './dto/response-companies.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCompaniesDto })
  create(@Body() createCompaniesDto: CreateCompaniesDto) {
    return this.companiesService.create(createCompaniesDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseCompaniesDto] })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCompaniesDto })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCompaniesDto })
  update(
    @Param('id') id: string,
    @Body() updateCompaniesDto: UpdateCompaniesDto,
  ) {
    return this.companiesService.update(id, updateCompaniesDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
