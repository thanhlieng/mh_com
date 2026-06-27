import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateVirtualAddressDto } from './dto/create-by-xlsx-file.dto';
import { VirtualDeliveryAddressEntity } from './entities/virtual-delivery-address.entity';
import xlsx from 'node-xlsx';
import {
  CommonError,
  CommonResponse,
} from 'src/common/constants/common.constants';
import { commonResponse } from 'src/common/helper/common-response';
import { convertCountryNameToSymbol } from 'src/common/helper/helper';

@Injectable()
export class VirtualDeliveryAddressService {
  constructor(
    @InjectRepository(VirtualDeliveryAddressEntity)
    private readonly virtualDeliveryAddressRepository: Repository<VirtualDeliveryAddressEntity>,
  ) {}

  async virtualDeliveryAddressByXlsxFile(
    createVirtualAddressDto: CreateVirtualAddressDto,
  ) {
    const { file } = createVirtualAddressDto;

    if (!file) throw new BadRequestException();
    const data = xlsx.parse(file.buffer);
    if (!data.length) return commonResponse(CommonResponse.SUCCESS, null);
    await this.virtualDeliveryAddressRepository.clear();

    const listVirtualAddress = data[0].data;
    const dataSave: VirtualDeliveryAddressEntity[] = [];

    for (let i = 1; i < listVirtualAddress.length; i++) {
      if (listVirtualAddress[i][0]) {
        const virtualAddress = new VirtualDeliveryAddressEntity();
        virtualAddress.name = listVirtualAddress[i][0];
        virtualAddress.address = listVirtualAddress[i][1];
        virtualAddress.province = listVirtualAddress[i][2];
        virtualAddress.country = convertCountryNameToSymbol(
          listVirtualAddress[i][3],
        );
        virtualAddress.postalCode = listVirtualAddress[i][4].toString();
        virtualAddress.phoneNumber = listVirtualAddress[i][5];
        virtualAddress.weight = 3;

        dataSave.push(virtualAddress);
      }
    }
    let length = dataSave.length;
    let start = 0;
    let end = 0;
    while (length > 0) {
      if (length >= 1000) {
        end += 1000;
        await this.virtualDeliveryAddressRepository.save(
          dataSave.slice(start, end),
        );
        length -= 1000;
        start = end;
      } else {
        await this.virtualDeliveryAddressRepository.save(dataSave.slice(start));
        length = 0;
      }
    }

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async getVirtualAddressMakeSmallBill(quantity: number, weight: number) {
    if (quantity <= 0) {
      return [];
    }

    const virtualAddress = await this.virtualDeliveryAddressRepository.find({
      where: {
        weight: MoreThanOrEqual(weight),
      },
      order: {
        id: 'DESC',
      },
      take: quantity,
    });

    if (virtualAddress.length < quantity) {
      throw new BadRequestException(
        CommonError.VIRTUAL_DELIVERY_ADDRESS_NOT_ENOUGHT,
      );
    }

    virtualAddress.forEach((address) => {
      address.weight -= weight;
    });

    return this.virtualDeliveryAddressRepository.save(virtualAddress);
  }

  async refreshDataEveryWeek() {
    return this.virtualDeliveryAddressRepository.update({}, { weight: 3 });
  }
}
