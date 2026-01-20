import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CommonError,
  CommonSuccess,
  EAddressBookingType,
} from 'src/common/constants/common.constants';
import { commonResponse } from 'src/common/helper/common-response';
import { Repository, Not, In } from 'typeorm';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { CustomerService } from '../customers/customers.service';
import { CreateSenderAddressDto } from './dto/create-sender-address.dto';
import { GetAddressBookDto } from './dto/get-address-books.dto';
import { AddressBookEntity } from './entities/address-books.entity';
import { CreateReceiverAddressDto } from './dto/create-receiver-address.dto';
import { UpdateSenderAddressDto } from './dto/update-sender-address.dto';
import { UpdateReceiverAddressDto } from './dto/update-receiver-address.dto';

@Injectable()
export class AddressBookService {
  constructor(
    @InjectRepository(AddressBookEntity)
    private readonly addressBookRepository: Repository<AddressBookEntity>,

    private readonly customerService: CustomerService,
  ) {}

  async getAllAddress(
    payload: IJwtPayload,
    getAddressBookDto: GetAddressBookDto,
  ) {
    const { type } = getAddressBookDto;
    const customer = await this.customerService.getCustomerByPayload(payload);
    let conditions = {
      customerId: customer.id,
    };
    if (type) {
      conditions['type'] = type;
    }

    return this.addressBookRepository.find({
      where: conditions,
      order: {
        default: 'DESC',
      },
    });
  }

  async createSenderAddress(
    createSenderAddressDto: CreateSenderAddressDto,
    payload: IJwtPayload,
  ) {
    let {
      senderAddressEn,
      senderAddressEn1,
      senderAddressEn2,
      senderAddressEn3,
    } = createSenderAddressDto;
    const customer = await this.customerService.getCustomerByPayload(payload);
    const total = await this.addressBookRepository.count({
      where: {
        customerId: customer.id,
        type: EAddressBookingType.SENDER_ADDRESS,
        default: true,
      },
    });

    if (!senderAddressEn) {
      senderAddressEn =
        senderAddressEn1 + ' ' + senderAddressEn2 + ' ' + senderAddressEn3;
    }

    return this.addressBookRepository.save({
      ...createSenderAddressDto,
      senderAddressEn: senderAddressEn,
      type: EAddressBookingType.SENDER_ADDRESS,
      customerId: customer.id,
      default: total === 0 ? true : false,
    });
  }

  async createReceiverAddress(
    createReceiverAddressDto: CreateReceiverAddressDto,
    payload: IJwtPayload,
  ) {
    let {
      receiverAddress,
      receiverAddress1,
      receiverAddress2,
      receiverAddress3,
    } = createReceiverAddressDto;
    const customer = await this.customerService.getCustomerByPayload(payload);
    const total = await this.addressBookRepository.count({
      where: {
        customerId: customer.id,
        type: EAddressBookingType.RECEIVER_ADDRESS,
        default: true,
      },
    });
    if (!receiverAddress) {
      receiverAddress =
        receiverAddress1 + ' ' + receiverAddress2 + ' ' + receiverAddress3;
    }

    return this.addressBookRepository.save({
      ...createReceiverAddressDto,
      receiverAddress: receiverAddress,
      type: EAddressBookingType.RECEIVER_ADDRESS,
      customerId: customer.id,
      default: total === 0 ? true : false,
    });
  }

  async setAddressIsDefault(id: string, payload: IJwtPayload) {
    const [addressBook, customer] = await Promise.all([
      this.addressBookRepository.findOne({ where: { id } }),
      this.customerService.getCustomerByPayload(payload),
    ]);
    if (!addressBook || addressBook.customerId != customer.id) {
      throw new NotFoundException(CommonError.ADDRESS_BOOK_NOT_FOUND);
    }
    addressBook.default = true;
    await Promise.all([
      addressBook.save(),
      this.addressBookRepository.update(
        {
          customerId: customer.id,
          type: addressBook.type,
          id: Not(addressBook.id),
        },
        {
          default: false,
        },
      ),
    ]);

    return commonResponse(
      CommonSuccess.SET_DEFAULT_ADDRESS_BOOK_SUCCESSFULLY,
      null,
    );
  }

  async remove(id: string, payload: IJwtPayload) {
    const customer = await this.customerService.getCustomerByPayload(payload);
    const result = await this.addressBookRepository.delete({
      customerId: customer.id,
      id,
      default: false,
    });
    if (result?.affected === 0) {
      throw new NotFoundException(CommonError.REMOVE_ADDRESS_BOOK_FAIL);
    }

    return commonResponse(CommonSuccess.REMOVE_ADDRESS_SUCCESSFULLY, null);
  }

  async updateSenderAddress(
    id: string,
    payload: IJwtPayload,
    updateSenderAddressDto: UpdateSenderAddressDto,
  ) {
    const resp = await this.addressBookRepository.update(
      id,
      updateSenderAddressDto,
    );

    if (!resp.affected) {
      throw new NotFoundException(CommonError.ADDRESS_BOOK_NOT_FOUND);
    }

    return commonResponse(CommonSuccess.UPDATE_ADDRESS_SUCCESSFULLY, null);
  }

  async updateReceiverAddress(
    id: string,
    payload: IJwtPayload,
    updateReceiverAddressDto: UpdateReceiverAddressDto,
  ) {
    const resp = await this.addressBookRepository.update(
      id,
      updateReceiverAddressDto,
    );

    if (!resp.affected) {
      throw new NotFoundException(CommonError.ADDRESS_BOOK_NOT_FOUND);
    }

    return commonResponse(CommonSuccess.UPDATE_ADDRESS_SUCCESSFULLY, null);
  }
}
