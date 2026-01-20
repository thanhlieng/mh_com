import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShippingItemDto } from './dto/create-shipping-items.dto';
import { UpdateShippingItemDto } from './dto/update-shipping-items.dto';
import { ShippingItemEntity } from './entities/shipping-items.entity';

@Injectable()
export class ShippingItemService {
  constructor(
    @InjectRepository(ShippingItemEntity)
    private readonly shippingItemRepository: Repository<ShippingItemEntity>,
  ) {}

  getShippingItemDefault() {
    return this.shippingItemRepository.findOne({
      where: {
        isDefault: true,
      },
    });
  }

  async create(createShippingItemDto: CreateShippingItemDto) {
    return this.shippingItemRepository.save(createShippingItemDto);
  }

  findAll() {
    return this.shippingItemRepository.find();
  }

  async findOne(id: string) {
    const checkShippingItem = await this.shippingItemRepository.findOneBy({
      id,
    });
    if (!checkShippingItem) {
      throw new NotFoundException();
    } else {
      return checkShippingItem;
    }
  }

  async update(id: string, updateShippingItemDto: UpdateShippingItemDto) {
    const checkShippingItem = await this.shippingItemRepository.findOneBy({
      id,
    });
    if (!checkShippingItem) {
      throw new NotFoundException();
    } else {
      return this.shippingItemRepository.update(id, updateShippingItemDto);
    }
  }

  async remove(id: string) {
    const checkShippingItem = await this.shippingItemRepository.findOneBy({
      id,
    });
    if (!checkShippingItem) {
      throw new NotFoundException();
    } else {
      return this.shippingItemRepository.delete(id);
    }
  }
}
