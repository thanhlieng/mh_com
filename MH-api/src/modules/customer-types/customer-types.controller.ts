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
import { CustomerTypeService } from './customer-types.service';
import { CreateCustomerTypeDto } from './dto/create-customer-types.dto';
import { UpdateCustomerTypeDto } from './dto/update-customer-types.dto';
import { ResponseCustomerTypeDto } from './dto/response-customer-types.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('CustomerType')
@Controller('customer-type')
export class CustomerTypeController {
  constructor(private readonly customerTypeService: CustomerTypeService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCustomerTypeDto })
  @ApiBearerAuth()
  create(@Body() createCustomerTypeDto: CreateCustomerTypeDto) {
    return this.customerTypeService.create(createCustomerTypeDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseCustomerTypeDto] })
  findAll() {
    return this.customerTypeService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseCustomerTypeDto })
  findOne(@Param('id') id: string) {
    return this.customerTypeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCustomerTypeDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateCustomerTypeDto: UpdateCustomerTypeDto,
  ) {
    return this.customerTypeService.update(id, updateCustomerTypeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.customerTypeService.remove(id);
  }
}
