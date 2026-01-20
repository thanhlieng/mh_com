import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNetworkCustomerTypeDto } from './dto/create-network-customer-types.dto';
import { UpdateNetworkCustomerTypeDto } from './dto/update-network-customer-types.dto';
import { NetworkCustomerTypeEntity } from './entities/network-customer-types.entity';

@Injectable()
export class NetworkCustomerTypeService {
  constructor(
    @InjectRepository(NetworkCustomerTypeEntity)
    private readonly networkCustomerTypeRepository: Repository<NetworkCustomerTypeEntity>,
  ) {}

  async create(createNetworkCustomerTypeDto: CreateNetworkCustomerTypeDto) {
    return this.networkCustomerTypeRepository.save(
      createNetworkCustomerTypeDto,
    );
  }

  async findAll() {
    return this.networkCustomerTypeRepository.find();
  }

  async findOne(id: string) {
    const checkNetworkCustomerType =
      await this.networkCustomerTypeRepository.findOneBy({ id });
    if (!checkNetworkCustomerType) {
      throw new NotFoundException();
    } else {
      return checkNetworkCustomerType;
    }
  }

  async update(
    id: string,
    updateNetworkCustomerTypeDto: UpdateNetworkCustomerTypeDto,
  ) {
    const checkNetworkCustomerType =
      await this.networkCustomerTypeRepository.findOneBy({ id });
    if (!checkNetworkCustomerType) {
      throw new NotFoundException();
    } else {
      return this.networkCustomerTypeRepository.update(
        id,
        updateNetworkCustomerTypeDto,
      );
    }
  }

  async remove(id: string) {
    const checkNetworkCustomerType =
      await this.networkCustomerTypeRepository.findOneBy({ id });
    if (!checkNetworkCustomerType) {
      throw new NotFoundException();
    } else {
      return this.networkCustomerTypeRepository.delete(id);
    }
  }
}
