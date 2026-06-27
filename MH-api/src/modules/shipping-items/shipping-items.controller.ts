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
import { ShippingItemService } from './shipping-items.service';
import { CreateShippingItemDto } from './dto/create-shipping-items.dto';
import { UpdateShippingItemDto } from './dto/update-shipping-items.dto';
import { ResponseShippingItemDto } from './dto/response-shipping-items.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
@ApiTags('ShippingItem')
@Controller('shipping-item')
export class ShippingItemController {
  constructor(private readonly shippingItemService: ShippingItemService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseShippingItemDto })
  @ApiBearerAuth()
  create(@Body() createShippingItemDto: CreateShippingItemDto) {
    return this.shippingItemService.create(createShippingItemDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseShippingItemDto] })
  findAll() {
    return this.shippingItemService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseShippingItemDto })
  findOne(@Param('id') id: string) {
    return this.shippingItemService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ResponseShippingItemDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateShippingItemDto: UpdateShippingItemDto,
  ) {
    return this.shippingItemService.update(id, updateShippingItemDto);
  }

  @Delete(':id')
  @ApiOkResponse()
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.shippingItemService.remove(id);
  }
}
