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
import { DeliveryConditionsService } from './delivery-conditions.service';
import { CreateDeliveryConditionsDto } from './dto/create-delivery-conditions.dto';
import { UpdateDeliveryConditionsDto } from './dto/update-delivery-conditions.dto';
import { ResponseDeliveryConditionsDto } from './dto/response-delivery-conditions.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('DeliveryConditions')
@Controller('delivery-conditions')
export class DeliveryConditionsController {
  constructor(
    private readonly deliveryConditionsService: DeliveryConditionsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseDeliveryConditionsDto })
  @ApiBearerAuth()
  create(@Body() createDeliveryConditionsDto: CreateDeliveryConditionsDto) {
    return this.deliveryConditionsService.create(createDeliveryConditionsDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseDeliveryConditionsDto] })
  findAll() {
    return this.deliveryConditionsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseDeliveryConditionsDto })
  findOne(@Param('id') id: string) {
    return this.deliveryConditionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseDeliveryConditionsDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateDeliveryConditionsDto: UpdateDeliveryConditionsDto,
  ) {
    return this.deliveryConditionsService.update(
      id,
      updateDeliveryConditionsDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.deliveryConditionsService.remove(id);
  }
}
