import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { ApiTags } from '@nestjs/swagger';
import { GetItemCategoryDto } from './dto/get-item-categories.dto';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto';
import { JapanAddressService } from './services/japan-address.service';
import { CreateJapanAddressDto } from './dto/create-japan-address.dto';
import { UpdateJapanAddressDto } from './dto/update-japan-address.dto';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly japanAddressService: JapanAddressService,
  ) {}

  @Get()
  getItemCategories(@Query() getItemCategoriesDto: GetItemCategoryDto) {
    return this.categoriesService.getItemCategories(getItemCategoriesDto);
  }

  @Get('japan-address')
  getAllJapanAddress(@Query() dto: CommonPaginationDto) {
    return this.japanAddressService.getAll(dto);
  }

  @Post()
  createItemCategories(@Body() createItemCategoryDto: CreateItemCategoryDto) {
    return this.categoriesService.createItemCategory(createItemCategoryDto);
  }

  @Post('japan-address')
  createJapanAddress(@Body() createJapanAddressDto: CreateJapanAddressDto) {
    return this.japanAddressService.create(createJapanAddressDto);
  }

  @Patch('japan-address/:id')
  updateJapanAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJapanAddressDto: UpdateJapanAddressDto,
  ) {
    return this.japanAddressService.update(id, updateJapanAddressDto);
  }

  @Patch(':id')
  updateItemCategories(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemCategoryDto: UpdateItemCategoryDto,
  ) {
    return this.categoriesService.updateItemCategory(id, updateItemCategoryDto);
  }

  @Delete('japan-address/:id')
  removeJapanAddress(@Param('id', ParseUUIDPipe) id: string) {
    return this.japanAddressService.remove(id);
  }

  @Delete(':id')
  removeItemCategories(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.removeItemCategory(id);
  }
}
