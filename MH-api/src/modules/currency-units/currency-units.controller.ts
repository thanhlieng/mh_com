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
import { CurrencyUnitService } from './currency-units.service';
import { CreateCurrencyUnitDto } from './dto/create-currency-units.dto';
import { UpdateCurrencyUnitDto } from './dto/update-currency-units.dto';
import { ResponseCurrencyUnitDto } from './dto/response-currency-units.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('CurrencyUnit')
@Controller('currency-unit')
export class CurrencyUnitController {
  constructor(private readonly currencyUnitService: CurrencyUnitService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCurrencyUnitDto })
  @ApiBearerAuth()
  create(@Body() createCurrencyUnitDto: CreateCurrencyUnitDto) {
    return this.currencyUnitService.create(createCurrencyUnitDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseCurrencyUnitDto] })
  findAll() {
    return this.currencyUnitService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseCurrencyUnitDto })
  findOne(@Param('id') id: string) {
    return this.currencyUnitService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCurrencyUnitDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateCurrencyUnitDto: UpdateCurrencyUnitDto,
  ) {
    return this.currencyUnitService.update(id, updateCurrencyUnitDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.currencyUnitService.remove(id);
  }
}
