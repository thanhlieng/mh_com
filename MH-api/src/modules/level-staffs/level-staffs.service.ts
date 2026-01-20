import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLevelStaffsDto } from './dto/create-level-staffs.dto';
import { UpdateLevelStaffsDto } from './dto/update-level-staffs.dto';
import { LevelStaffsEntity } from './entities/level-staffs.entity';

@Injectable()
export class LevelStaffsService {
  constructor(
    @InjectRepository(LevelStaffsEntity)
    private readonly levelStaffsRepository: Repository<LevelStaffsEntity>,
  ) {}

  async create(createLevelStaffsDto: CreateLevelStaffsDto) {
    return this.levelStaffsRepository.save(createLevelStaffsDto);
  }

  async findAll() {
    return this.levelStaffsRepository.find();
  }

  async findOne(id: string) {
    const checkLevelStaffs = await this.levelStaffsRepository.findOneBy({ id });
    if (!checkLevelStaffs) {
      throw new NotFoundException();
    } else {
      return checkLevelStaffs;
    }
  }

  async update(id: string, updateLevelStaffsDto: UpdateLevelStaffsDto) {
    const checkLevelStaffs = await this.levelStaffsRepository.findOneBy({ id });
    if (!checkLevelStaffs) {
      throw new NotFoundException();
    } else {
      return this.levelStaffsRepository.update(id, updateLevelStaffsDto);
    }
  }

  async remove(id: string) {
    const checkLevelStaffs = await this.levelStaffsRepository.findOneBy({ id });
    if (!checkLevelStaffs) {
      throw new NotFoundException();
    } else {
      return this.levelStaffsRepository.delete(id);
    }
  }
}
