import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateCommoditiesTypeDto } from './dto/create-commodities-types.dto';
import { UpdateCommoditiesTypeDto } from './dto/update-commodities-types.dto';
import { CommoditiesTypeEntity } from './entities/commodities-types.entity';

@Injectable()
export class CommoditiesTypeService {
  constructor(
    @InjectRepository(CommoditiesTypeEntity)
    private readonly commoditiesTypeRepository: Repository<CommoditiesTypeEntity>,
  ) {}

  getCommoditiesTypeDefault() {
    return this.commoditiesTypeRepository.findOne({
      where: {
        isDefault: true,
      },
    });
  }

  async create(createCommoditiesTypeDto: CreateCommoditiesTypeDto) {
    return this.commoditiesTypeRepository.save(createCommoditiesTypeDto);
  }

  async findAll() {
    return this.commoditiesTypeRepository.find({
      where: {
        isDeleted: false,
      },
    });
  }

  async find(options: FindManyOptions<CommoditiesTypeEntity>) {
    return this.commoditiesTypeRepository.find(options);
  }

  async findOne(id: string) {
    const checkCommoditiesType = await this.commoditiesTypeRepository.findOne({
      where: {
        id,
      },
    });
    if (!checkCommoditiesType) {
      throw new NotFoundException();
    } else {
      return checkCommoditiesType;
    }
  }

  async update(id: string, updateCommoditiesTypeDto: UpdateCommoditiesTypeDto) {
    const checkCommoditiesType = await this.commoditiesTypeRepository.findOneBy(
      { id },
    );
    if (!checkCommoditiesType) {
      throw new NotFoundException();
    } else {
      return this.commoditiesTypeRepository.update(
        id,
        updateCommoditiesTypeDto,
      );
    }
  }

  async remove(id: string) {
    const checkCommoditiesType = await this.commoditiesTypeRepository.findOneBy(
      { id },
    );
    if (!checkCommoditiesType) {
      throw new NotFoundException();
    } else {
      return this.commoditiesTypeRepository.delete(id);
    }
  }
}
