import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MlExchangeRateService } from './ml-exchange-rate.service';
import { MLExchangeRateEntity } from './entities/ml-exchange-rate.entity';

@Controller('ml-exchange-rate')
export class MlExchangeRateController {
    constructor(private readonly mlExchangeRateService: MlExchangeRateService) {}

  @Post()
  async create(@Body() createDto: Partial<MLExchangeRateEntity>): Promise<MLExchangeRateEntity> {
    return this.mlExchangeRateService.create(createDto);
  }

  @Get()
  async findAll(): Promise<MLExchangeRateEntity[]> {
    return this.mlExchangeRateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MLExchangeRateEntity> {
    return this.mlExchangeRateService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<MLExchangeRateEntity>): Promise<MLExchangeRateEntity> {
    return this.mlExchangeRateService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.mlExchangeRateService.remove(id);
  }
}
