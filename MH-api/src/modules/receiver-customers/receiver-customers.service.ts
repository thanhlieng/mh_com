import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { createQueryBuilder, Like, Repository } from 'typeorm';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { CustomerService } from '../customers/customers.service';
import { CustomersEntity } from '../customers/entities/customers.entity';
import { CreateReceiverCustomerDto } from './dto/create-receiver-customers.dto';
import { GetReceiverCustomerDto } from './dto/get-receiver-customer.dto';
import { UpdateReceiverCustomerDto } from './dto/update-receiver-customers.dto';
import { ReceiverCustomerEntity } from './entities/receiver-customers.entity';

@Injectable()
export class ReceiverCustomerService {
  constructor(
    @InjectRepository(ReceiverCustomerEntity)
    private readonly receiverCustomerRepository: Repository<ReceiverCustomerEntity>,
    private readonly customerService: CustomerService,
  ) {}

  async create(
    createReceiverCustomerDto: CreateReceiverCustomerDto,
    payload: IJwtPayload,
  ) {
    const receiverCustomer = this.receiverCustomerRepository.create(
      createReceiverCustomerDto,
    );
    const customer: CustomersEntity =
      await this.customerService.getCustomerByPayload(payload);

    receiverCustomer.senderId = customer.id;

    return receiverCustomer.save();
  }

  async searchReceiverCustomer(
    payload: IJwtPayload,
    getReceiverCustomerDto: GetReceiverCustomerDto,
  ) {
    const { search } = getReceiverCustomerDto;

    const customer = await this.customerService.getCustomerByPayload(payload);

    const query = await this.receiverCustomerRepository
      .createQueryBuilder('rc')
      .where('rc.sender_id = :customerId', { customerId: customer.id });

    if (search) {
      query.andWhere(`upper(rc.name) LIKE N'%${search.toUpperCase()}%'`);
    }

    return CommonPagination(getReceiverCustomerDto, query);
  }

  findAll() {
    return this.receiverCustomerRepository.find();
  }

  findOne(id: string) {
    return this.receiverCustomerRepository.findOne({ where: { id } });
  }

  update(id: string, updateReceiverCustomerDto: UpdateReceiverCustomerDto) {
    return this.receiverCustomerRepository.update(
      id,
      updateReceiverCustomerDto,
    );
  }

  remove(id: string) {
    return this.receiverCustomerRepository.delete(id);
  }
}
