import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerTypeDto } from './dto/create-customer-types.dto';
import { UpdateCustomerTypeDto } from './dto/update-customer-types.dto';
import { CustomerTypeEntity } from './entities/customer-types.entity';

@Injectable()
export class CustomerTypeService {
  constructor(
    @InjectRepository(CustomerTypeEntity)
    private readonly customerTypeRepository: Repository<CustomerTypeEntity>,
  ) {}

  async create(createCustomerTypeDto: CreateCustomerTypeDto) {
    return this.customerTypeRepository.save(createCustomerTypeDto);
  }

  async findAll() {
    return this.customerTypeRepository.find();
  }

  async findOne(id: string) {
    const checkCustomerType = await this.customerTypeRepository.findOneBy({
      id,
    });
    if (!checkCustomerType) {
      throw new NotFoundException();
    } else {
      return checkCustomerType;
    }
  }

  async update(id: string, updateCustomerTypeDto: UpdateCustomerTypeDto) {
    const checkCustomerType = await this.customerTypeRepository.findOneBy({
      id,
    });
    if (!checkCustomerType) {
      throw new NotFoundException();
    } else {
      return this.customerTypeRepository.update(id, updateCustomerTypeDto);
    }
  }

  async remove(id: string) {
    const checkCustomerType = await this.customerTypeRepository.findOneBy({
      id,
    });
    if (!checkCustomerType) {
      throw new NotFoundException();
    } else {
      return this.customerTypeRepository.delete(id);
    }
  }
}
