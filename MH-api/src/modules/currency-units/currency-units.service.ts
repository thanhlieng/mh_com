import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCurrencyUnitDto } from './dto/create-currency-units.dto';
import { UpdateCurrencyUnitDto } from './dto/update-currency-units.dto';
import { CurrencyUnitEntity } from './entities/currency-units.entity';

@Injectable()
export class CurrencyUnitService {
  constructor(
    @InjectRepository(CurrencyUnitEntity)
    private readonly currencyUnitRepository: Repository<CurrencyUnitEntity>,
  ) {}

  async create(createCurrencyUnitDto: CreateCurrencyUnitDto) {
    return this.currencyUnitRepository.save(createCurrencyUnitDto);
  }

  async findAll() {
    return this.currencyUnitRepository.find();
  }

  async findOne(id: string) {
    const checkCurrencyUnit = await this.currencyUnitRepository.findOne({
      where: { id },
    });
    if (!checkCurrencyUnit) {
      throw new NotFoundException();
    } else {
      return checkCurrencyUnit;
    }
  }

  async update(id: string, updateCurrencyUnitDto: UpdateCurrencyUnitDto) {
    const checkCurrencyUnit = await this.currencyUnitRepository.findOneBy({
      id,
    });
    if (!checkCurrencyUnit) {
      throw new NotFoundException();
    } else {
      return this.currencyUnitRepository.update(id, updateCurrencyUnitDto);
    }
  }

  async remove(id: string) {
    const checkCurrencyUnit = await this.currencyUnitRepository.findOneBy({
      id,
    });
    if (!checkCurrencyUnit) {
      throw new NotFoundException();
    } else {
      return this.currencyUnitRepository.delete(id);
    }
  }
}
