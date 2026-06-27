import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-departments.dto';
import { GetDepartmentDto } from './dto/get-departments.dto';
import { UpdateDepartmentDto } from './dto/update-departments.dto';
import { DepartmentEntity } from './entities/departments.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentRepository.save(createDepartmentDto);
  }

  findAll(getDepartmentDto: GetDepartmentDto) {
    const { search } = getDepartmentDto;

    const query = this.departmentRepository.createQueryBuilder('department');

    if (search) {
      query.andWhere(`department.name LIKE :search`, {
        search: `%${search}%`,
      });
    }

    query.addOrderBy('department.createdAt', 'DESC');

    return CommonPagination(getDepartmentDto, query);
  }

  findOne(id: string) {
    return this.departmentRepository.findOne({ where: { id } });
  }

  update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentRepository.update(id, updateDepartmentDto);
  }

  remove(id: string) {
    return this.departmentRepository.delete(id);
  }
}
