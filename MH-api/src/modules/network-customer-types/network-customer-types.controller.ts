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
import { NetworkCustomerTypeService } from './network-customer-types.service';
import { CreateNetworkCustomerTypeDto } from './dto/create-network-customer-types.dto';
import { UpdateNetworkCustomerTypeDto } from './dto/update-network-customer-types.dto';
import { ResponseNetworkCustomerTypeDto } from './dto/response-network-customer-types.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('NetworkCustomerType')
@Controller('network-customer-type')
export class NetworkCustomerTypeController {
  constructor(
    private readonly networkCustomerTypeService: NetworkCustomerTypeService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseNetworkCustomerTypeDto })
  @ApiBearerAuth()
  create(@Body() createNetworkCustomerTypeDto: CreateNetworkCustomerTypeDto) {
    return this.networkCustomerTypeService.create(createNetworkCustomerTypeDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseNetworkCustomerTypeDto] })
  findAll() {
    return this.networkCustomerTypeService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseNetworkCustomerTypeDto })
  findOne(@Param('id') id: string) {
    return this.networkCustomerTypeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseNetworkCustomerTypeDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateNetworkCustomerTypeDto: UpdateNetworkCustomerTypeDto,
  ) {
    return this.networkCustomerTypeService.update(
      id,
      updateNetworkCustomerTypeDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.networkCustomerTypeService.remove(id);
  }
}
