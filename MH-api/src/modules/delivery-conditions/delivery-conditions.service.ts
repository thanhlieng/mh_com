import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeliveryConditionsDto } from './dto/create-delivery-conditions.dto';
import { UpdateDeliveryConditionsDto } from './dto/update-delivery-conditions.dto';
import { DeliveryConditionsEntity } from './entities/delivery-conditions.entity';

@Injectable()
export class DeliveryConditionsService {
  constructor(
    @InjectRepository(DeliveryConditionsEntity)
    private readonly deliveryConditionsRepository: Repository<DeliveryConditionsEntity>,
  ) {}

  async create(createDeliveryConditionsDto: CreateDeliveryConditionsDto) {
    return this.deliveryConditionsRepository.save(createDeliveryConditionsDto);
  }

  async findAll() {
    return this.deliveryConditionsRepository.find({
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  getDeliveryConditionDefault() {
    return this.deliveryConditionsRepository.findOne({
      where: {
        isDefault: true,
      },
    });
  }

  async findOne(id: string) {
    const checkDeliveryConditions =
      await this.deliveryConditionsRepository.findOneBy({ id });
    if (!checkDeliveryConditions) {
      throw new NotFoundException();
    } else {
      return checkDeliveryConditions;
    }
  }

  async update(
    id: string,
    updateDeliveryConditionsDto: UpdateDeliveryConditionsDto,
  ) {
    const checkDeliveryConditions =
      await this.deliveryConditionsRepository.findOneBy({ id });
    if (!checkDeliveryConditions) {
      throw new NotFoundException();
    } else {
      return this.deliveryConditionsRepository.update(
        id,
        updateDeliveryConditionsDto,
      );
    }
  }

  async remove(id: string) {
    const checkDeliveryConditions =
      await this.deliveryConditionsRepository.findOneBy({ id });
    if (!checkDeliveryConditions) {
      throw new NotFoundException();
    } else {
      return this.deliveryConditionsRepository.delete(id);
    }
  }
}
