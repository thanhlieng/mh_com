import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompaniesDto } from './dto/create-companies.dto';
import { UpdateCompaniesDto } from './dto/update-companies.dto';
import { CompaniesEntity } from './entities/companies.entity';
import { commonResponse } from 'src/common/helper/common-response';
import { CommonResponse } from 'src/common/constants/common.constants';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompaniesEntity)
    private readonly companiesRepository: Repository<CompaniesEntity>,
  ) {}

  createListCompany(names: string[]) {
    return this.companiesRepository.save(
      names.map((name) => {
        const company = new CompaniesEntity();
        company.name = name;
        return company;
      }),
    );
  }

  create(createCompaniesDto: CreateCompaniesDto) {
    return this.companiesRepository.save(createCompaniesDto);
  }

  async findAll() {
    const result = await this.companiesRepository.find();
    return result;
  }

  findOne(id: string) {
    return this.companiesRepository.findOne({ where: { id } });
  }

  update(id: string, updateCompaniesDto: UpdateCompaniesDto) {
    return this.companiesRepository.update(id, updateCompaniesDto);
  }

  async remove(id: string) {
    try {
      await this.companiesRepository.delete(id);

      return commonResponse(CommonResponse.SUCCESS, null);
    } catch (error) {

      throw new BadRequestException()
    }
  }
}
