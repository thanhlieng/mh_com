import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { Repository } from 'typeorm';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { CustomerService } from '../customers/customers.service';
import { CreateCustomerContractDto } from './dto/create-customer-contracts.dto';
import { GetMyContractDto } from './dto/get-my-contract.dto';
import { GetContractDto } from './dto/search-contract.dto';
import { UpdateCustomerContractDto } from './dto/update-customer-contracts.dto';
import { CustomerContractEntity } from './entities/customer-contracts.entity';

@Injectable()
export class CustomerContractService {
  constructor(
    @InjectRepository(CustomerContractEntity)
    private readonly customerContractRepository: Repository<CustomerContractEntity>,

    private readonly customerService: CustomerService,
  ) {}

  create(createCustomerContractDto: CreateCustomerContractDto) {
    return this.customerContractRepository.save(createCustomerContractDto);
  }

  async findAll(getContractDto: GetContractDto) {
    const { search, customerId } = getContractDto;

    const contractsQuery = this.customerContractRepository
      .createQueryBuilder('contract')
      .leftJoinAndMapOne(
        'contract.customer',
        'customers',
        'c',
        'c.id = contract.customer_id',
      );

    if (search) {
      contractsQuery.where('UPPER(contract.company_name) LIKE :companyName', {
        companyName: `%${search.toUpperCase()}%`,
      });
    }

    if (customerId) {
      contractsQuery.andWhere('c.id = :id', { id: customerId });
    }

    contractsQuery.addOrderBy('contract.createdAt', 'DESC');

    return CommonPagination(getContractDto, contractsQuery);
  }

  async findOne(id: string) {
    const contract = await this.customerContractRepository
      .createQueryBuilder('contract')
      .leftJoinAndMapOne(
        'contract.customer',
        'customers',
        'c',
        'contract.customer_id = c.id',
      )
      .where('contract.id = :id', { id: id })
      .getOne();

    if (!contract) throw new NotFoundException();

    return contract;
  }

  async myContract(payload: IJwtPayload, getMyContractDto: GetMyContractDto) {
    const { search } = getMyContractDto;
    const customer = await this.customerService.getCustomerByPayload(payload);

    const contractsQuery = this.customerContractRepository
      .createQueryBuilder('contract')
      .leftJoinAndMapOne(
        'contract.customer',
        'customers',
        'c',
        'c.id = contract.customer_id',
      )
      .andWhere('contract.customer_id = :customerId', {
        customerId: customer.id,
      });

    if (search) {
      contractsQuery.andWhere(
        'UPPER(contract.company_name) LIKE :companyName',
        {
          companyName: `%${search.toUpperCase()}%`,
        },
      );
    }

    contractsQuery.addOrderBy('contract.createdAt', 'DESC');

    return CommonPagination(getMyContractDto, contractsQuery);
  }

  update(id: string, updateCustomerContractDto: UpdateCustomerContractDto) {
    return this.customerContractRepository.update(
      id,
      updateCustomerContractDto,
    );
  }

  remove(id: string) {
    return this.customerContractRepository.delete(id);
  }
}
