import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JapanAddressEntity } from '../entities/japan-address.entity';
import { Repository } from 'typeorm';
import { CreateJapanAddressDto } from '../dto/create-japan-address.dto';
import { UpdateJapanAddressDto } from '../dto/update-japan-address.dto';
import { commonResponse } from 'src/common/helper/common-response';
import { CommonResponse } from '@constants/common.constants';
import { CommonPaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class JapanAddressService {
  constructor(
    @InjectRepository(JapanAddressEntity)
    private readonly japanAddressRepository: Repository<JapanAddressEntity>,
  ) {}

  getAll(dto: CommonPaginationDto) {
    const { search } = dto;
    if (!search) {
      return this.japanAddressRepository.find();
    }

    return this.japanAddressRepository
      .createQueryBuilder('japan_address')
      .where('LOWER(consignee_name_englsh) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      })
      .getMany();
  }

  create(createJapanAddressDto: CreateJapanAddressDto) {
    return this.japanAddressRepository.save(createJapanAddressDto);
  }

  async checkExistsAndCreate(createJapanAddressDto: CreateJapanAddressDto) {
    let isUpdate = false;

    const checkExists = await this.japanAddressRepository
      .createQueryBuilder('japan_address')
      .where('LOWER(consignee_name_englsh) = :consigneeNameEnglish', {
        consigneeNameEnglish:
          createJapanAddressDto.consigneeNameEnglish.toLowerCase(),
      })
      .getOne();

    if (!checkExists) {
      return this.create(createJapanAddressDto);
    }

    if (
      !checkExists.consigneeNameJapanese ||
      checkExists.consigneeNameJapanese === ''
    ) {
      isUpdate = true;
      checkExists.consigneeNameJapanese =
        createJapanAddressDto.consigneeNameJapanese;
    }

    if (
      !checkExists.registeredCompanyName ||
      checkExists.registeredCompanyName === ''
    ) {
      isUpdate = true;
      checkExists.registeredCompanyName =
        createJapanAddressDto.registeredCompanyName;
    }

    if (!checkExists.consigneeCode || checkExists.consigneeCode === '') {
      isUpdate = true;
      checkExists.consigneeCode = createJapanAddressDto.consigneeCode;
    }

    if (!checkExists.address || checkExists.address === '') {
      isUpdate = true;
      checkExists.address = createJapanAddressDto.address;
    }

    if (isUpdate) {
      await checkExists.save();
    }

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  update(id: string, updateDto: UpdateJapanAddressDto) {
    return this.japanAddressRepository.update(id, updateDto);
  }

  remove(id: string) {
    return this.japanAddressRepository.delete(id);
  }
}
