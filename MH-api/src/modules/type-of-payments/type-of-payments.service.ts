import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateTypeOfPaymentDto } from './dto/create-type-of-payments.dto';
import { UpdateTypeOfPaymentDto } from './dto/update-type-of-payments.dto';
import { TypeOfPaymentEntity } from './entities/type-of-payments.entity';

@Injectable()
export class TypeOfPaymentService {
  constructor(
    @InjectRepository(TypeOfPaymentEntity)
    private readonly typeOfPaymentRepository: Repository<TypeOfPaymentEntity>,
  ) {}

  getTypeOfPaymentDefault() {
    return this.typeOfPaymentRepository.findOne({
      where: {
        isDefault: true,
      },
    });
  }

  async create(createTypeOfPaymentDto: CreateTypeOfPaymentDto) {
    return this.typeOfPaymentRepository.save(createTypeOfPaymentDto);
  }

  async findAll() {
    return this.typeOfPaymentRepository.find({
      where: {
        name: Not(IsNull()),
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const checkTypeOfPayment = await this.typeOfPaymentRepository.findOneBy({
      id,
    });
    if (!checkTypeOfPayment) {
      throw new NotFoundException();
    } else {
      return checkTypeOfPayment;
    }
  }

  async update(id: string, updateTypeOfPaymentDto: UpdateTypeOfPaymentDto) {
    const checkTypeOfPayment = await this.typeOfPaymentRepository.findOneBy({
      id,
    });
    if (!checkTypeOfPayment) {
      throw new NotFoundException();
    } else {
      return this.typeOfPaymentRepository.update(id, updateTypeOfPaymentDto);
    }
  }

  async remove(id: string) {
    const checkTypeOfPayment = await this.typeOfPaymentRepository.findOneBy({
      id,
    });
    if (!checkTypeOfPayment) {
      throw new NotFoundException();
    } else {
      return this.typeOfPaymentRepository.delete(id);
    }
  }
}
