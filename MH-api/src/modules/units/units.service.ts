import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { Repository } from 'typeorm';
import { CreateUnitsDto } from './dto/create-units.dto';
import { GetUnitDto } from './dto/get-units.dto';
import { UpdateUnitsDto } from './dto/update-units.dto';
import { UnitsEntity } from './entities/units.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(UnitsEntity)
    private readonly unitsRepository: Repository<UnitsEntity>,
  ) {}

  createListUnit(names: string[]) {
    return this.unitsRepository.save(
      names.map((name) => {
        const company = new UnitsEntity();
        company.name = name;
        return company;
      }),
    );
  }

  create(createUnitsDto: CreateUnitsDto) {
    return this.unitsRepository.save(createUnitsDto);
  }

  async find() {
    return this.unitsRepository.find();
  }

  async findAll(getUnitDto: GetUnitDto) {
    const { search } = getUnitDto;

    const query = this.unitsRepository.createQueryBuilder('unit');

    if (search) {
      query.andWhere(`unit.name LIKE :search`, {
        search: `%${search}%`,
      });
    }

    query.addOrderBy('unit.createdAt', 'DESC');

    return CommonPagination(getUnitDto, query);
  }

  findOne(id: string) {
    return this.unitsRepository.findOne({ where: { id } });
  }

  update(id: string, updateUnitsDto: UpdateUnitsDto) {
    return this.unitsRepository.update(id, updateUnitsDto);
  }

  async remove(id: string) {
    try {
      await this.unitsRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(
        'Lựa chọn này đã được sử dụng trong hệ thống! Không thể xóa !',
      );
    }
  }
}
