import { CommonResponse } from '@constants/common.constants';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { commonResponse } from 'src/common/helper/common-response';
import { Repository } from 'typeorm';
import IJwtPayload, { IHistoryInfo } from '../auth/payloads/jwt-payload';
import { BookingRepository } from '../bookings/repositories/booking.repository';
import { CustomerService } from '../customers/customers.service';
import { CreateInvoiceDetailDto } from './dto/create-invoice-detail.dto';
import { CreateInvoiceDto, CreateTemplateInvoiceDto } from './dto/create-invoices.dto';
import { GetInvoiceDto } from './dto/get-invoice.dto';
import { UpdateInvoiceDetailDto } from './dto/update-invoice-detail.dto';
import { UpdateInvoiceDto } from './dto/update-invoices.dto';
import { InvoiceDetailEntity } from './entities/invoices-detail.entity';
import { InvoiceEntity } from './entities/invoices.entity';
import { IInvoiceDetail } from './interface/invoice-detail.interface';
import { IStatisticalManifestInvoice } from './interface/statistical-manifest.interface';
import { EInvoiceMessage, ETypeInvoice } from './invoices.constants';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(InvoiceDetailEntity)
    private readonly invoiceDetailRepository: Repository<InvoiceDetailEntity>,

    private readonly bookingRepository: BookingRepository,

    private readonly customerService: CustomerService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateInvoiceDetailByBookingId(bookingId: string, payload: Partial<InvoiceDetailEntity>) {
    const invoice = await this.invoiceRepository.findOne({
      where: { bookingId },
    });
    if (!invoice) {
      throw new BadRequestException(`Invoice not exists`);
    }

    const invoiceDetail = await this.invoiceDetailRepository.findOne({
      where: { invoiceId: invoice.id },
    });

    if (!invoiceDetail) {
      throw new BadRequestException(`Invoice detail not exists`);
    }

    await this.invoiceDetailRepository.save({ ...invoiceDetail, ...payload });
    return true;
  }

  async getActiveInvoice(id: string, payload: IJwtPayload) {
    const customer = await this.customerService.getCustomerByPayload(payload);

    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('booking', 'booking', 'booking.id = invoice.booking_id')
      .leftJoin('customers', 'customers', `customers.id = booking.customer_id AND customers.id = ${customer.id}`)
      .where('invoice.id = :id', { id })
      .getOne();

    if (!invoice) throw new NotFoundException();

    return invoice;
  }

  async getActiveInvoiceDetail(id: string, payload: IJwtPayload) {
    const invoiceDetail = await this.invoiceDetailRepository
      .createQueryBuilder('idt')
      .where('idt.id = :id', { id })
      .getOne();

    if (!invoiceDetail) throw new NotFoundException();

    return invoiceDetail;
  }

  async create(createInvoiceDto: CreateInvoiceDto, payload: IJwtPayload) {
    const createInvoiceDetailDto = createInvoiceDto.invoiceDetail;
    if (!createInvoiceDto.bookingId) {
      throw new BadRequestException('bookingId is required!');
    }
    const invoiceEntity = new InvoiceEntity();

    Object.assign(invoiceEntity, createInvoiceDto);
    invoiceEntity.isAdditional = true;
    invoiceEntity.invoiceDate = new Date(invoiceEntity.invoiceDate);
    const oldInvoice = await this.invoiceRepository.findOne({
      where: {
        bookingId: createInvoiceDto.bookingId,
      },
    });
    if (oldInvoice) {
      await this.invoiceDetailRepository.delete({
        invoiceId: oldInvoice.id,
      });
      await this.invoiceRepository.delete({
        id: oldInvoice.id,
      });
    }
    const [invoice, booking] = await Promise.all([
      this.invoiceRepository.save(invoiceEntity),
      this.bookingRepository.update(createInvoiceDto.bookingId, {
        isInvoice: true,
      }),
    ]);
    if (!booking.affected) {
      throw new NotFoundException('Booking not found');
    }

    const invoiceDetail = [];
    if (createInvoiceDetailDto?.length) {
      for (let i = 0; i < createInvoiceDetailDto.length; i++) {
        const invoiceDetailEntity = new InvoiceDetailEntity();
        Object.assign(invoiceDetailEntity, createInvoiceDetailDto[i]);
        invoiceDetailEntity.invoiceId = invoice.id;
        delete invoiceDetailEntity.id;

        const iDetail = await this.invoiceDetailRepository.save(invoiceDetailEntity);
        invoiceDetail.push(iDetail);
      }
    }

    const result = {
      ...invoice,
      invoiceDetail,
    };

    return result;
  }

  async createNotUseTransaction(updateInvoiceDto: UpdateInvoiceDto) {
    const createInvoiceDetailDto = updateInvoiceDto?.invoiceDetail;
    const invoiceEntity = new InvoiceEntity();
    Object.assign(invoiceEntity, updateInvoiceDto);
    invoiceEntity.invoiceDate = new Date(invoiceEntity.invoiceDate);
    const invoice = await this.invoiceRepository.save(invoiceEntity);

    const invoiceDetail = [];
    if (createInvoiceDetailDto?.length) {
      for (let i = 0; i < createInvoiceDetailDto.length; i++) {
        const invoiceDetailEntity = new InvoiceDetailEntity();

        Object.assign(invoiceDetailEntity, createInvoiceDetailDto[i]);

        invoiceDetailEntity.invoiceId = invoice.id;

        const iDetail = await this.invoiceDetailRepository.save(invoiceDetailEntity);
        invoiceDetail.push(iDetail);
      }
    }

    const result = {
      ...invoice,
      invoiceDetail,
    };

    return result;
  }

  async createInvoiceDetail(createInvoiceDetailDto: CreateInvoiceDetailDto, payload: IJwtPayload, id: string) {
    const invoice = await this.getActiveInvoice(id, payload);

    const invoiceDetail = new InvoiceDetailEntity();

    Object.assign(invoiceDetail, createInvoiceDetailDto);

    invoiceDetail.invoiceId = invoice.id;

    return await invoiceDetail.save();
  }

  async findAll(getInvoiceDto: GetInvoiceDto) {
    const { search } = getInvoiceDto;

    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndMapMany(
        'invoice.invoiceDetail',
        'invoice_detail',
        'invoiceDetail',
        'invoice.id = invoiceDetail.invoice_id',
      )
      .where('invoice.type = :typeInvoice', {
        typeInvoice: ETypeInvoice.OFFICIAL,
      });

    if (search) {
      query.andWhere(`(invoice.bill_id LIKE '%${search}%' OR invoice.id = :search)`, {
        search,
      });
    }

    query.addOrderBy('invoice.createdAt', 'DESC');

    return CommonPagination(getInvoiceDto, query);
  }

  findOne(id: string) {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndMapMany(
        'invoice.invoiceDetail',
        'invoice_detail',
        'invoiceDetail',
        'invoice.id = invoiceDetail.invoice_id',
      )
      .where('invoice.id = :id', { id })
      .getOne();
    return query;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, info?: IHistoryInfo) {
    const { invoiceDetail = [], ...dataUpdate } = updateInvoiceDto;
    let existInvoice;

    if (id) {
      existInvoice = await this.invoiceRepository.findOne({
        where: {
          id,
        },
      });
    } else if (updateInvoiceDto?.bookingId) {
      existInvoice = await this.invoiceRepository.findOne({
        where: {
          bookingId: updateInvoiceDto.bookingId,
        },
      });
    }

    if (!existInvoice) {
      await this.createNotUseTransaction(updateInvoiceDto);
    } else {
      Object.assign(existInvoice, dataUpdate);
      const newInvoice = await existInvoice.save();
      await this.invoiceDetailRepository.delete({ invoiceId: newInvoice.id });
      if (invoiceDetail?.length) {
        for (let i = 0; i < invoiceDetail.length; i++) {
          const invoiceDetailEntity = new InvoiceDetailEntity();
          Object.assign(invoiceDetailEntity, invoiceDetail[i]);
          invoiceDetailEntity.invoiceId = existInvoice.id;
          invoiceDetailEntity.totalMoney = invoiceDetailEntity.price * invoiceDetailEntity.quantity;

          await this.invoiceDetailRepository.save(invoiceDetailEntity);
        }
      }
    }

    return updateInvoiceDto;
  }

  async updateInvoiceDetail(payload: IJwtPayload, updateInvoiceDetailDto: UpdateInvoiceDetailDto, id: string) {
    const invoiceDetail = await this.getActiveInvoiceDetail(id, payload);

    Object.assign(invoiceDetail, updateInvoiceDetailDto);

    return invoiceDetail.save();
  }

  async createInvoiceTemplate(createTemplateInvoiceDto: CreateTemplateInvoiceDto) {
    const { invoiceDetail, ...invoiceDto } = createTemplateInvoiceDto;
    const invoice = await this.invoiceRepository.save({
      ...invoiceDto,
      type: ETypeInvoice.TEMPLATE,
    });

    if (invoiceDetail && invoiceDetail.length) {
      await this.invoiceDetailRepository.save(
        invoiceDetail.map((item) => ({
          ...item,
          invoiceId: invoice.id,
        })),
      );
    }

    return commonResponse(CommonResponse.SUCCESS, invoice);
  }

  async getInvoiceTemplates() {
    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndMapMany(
        'invoice.invoiceDetail',
        'invoice_detail',
        'invoiceDetail',
        'invoice.id = invoiceDetail.invoice_id',
      )
      .where('invoice.type = :typeInvoice', {
        typeInvoice: ETypeInvoice.TEMPLATE,
      })
      .orderBy('invoice.created_at', 'DESC')
      .getMany();
  }

  async removeInvoiceTemplate(id: string) {
    const checkExists = await this.invoiceRepository.findOne({
      where: {
        id,
        type: ETypeInvoice.TEMPLATE,
      },
    });

    if (!checkExists) {
      throw new HttpException(EInvoiceMessage.INVOICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.invoiceDetailRepository.delete({
      invoiceId: id,
    });
    await checkExists.remove();

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async statisticalInvoiceByBookingId(bookingId: string): Promise<IStatisticalManifestInvoice> {
    const resultDefault: IStatisticalManifestInvoice = {
      originOfCountry: null,
      qty: null,
      uom: 'EA',
      unitPrice: null,
      invoiceCur: null,
    };

    const respQuery = (await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndMapMany(
        'invoice.invoice_detail',
        'invoice_detail',
        'invoice_detail',
        'invoice.id = invoice_detail.invoice_id',
      )
      .leftJoinAndMapOne('invoice.currency', 'currency_unit', 'currency_unit', 'currency_unit.id = invoice.currency_id')
      .where('invoice.booking_id = :bookingId', {
        bookingId: bookingId,
      })
      .getOne()) as any;

    if (!respQuery) {
      return resultDefault;
    }

    const currencyName = respQuery?.currency?.name.split('-');
    resultDefault.invoiceCur = currencyName?.length >= 2 ? currencyName[0] : '';
    if (!respQuery.invoice_detail?.length) {
      return resultDefault;
    }

    let totalQuantity = 0;
    respQuery.invoice_detail.forEach((invoiceDetail: IInvoiceDetail) => {
      totalQuantity += +invoiceDetail.quantity;
      invoiceDetail.originOfGoods;
    });

    resultDefault.qty = totalQuantity;
    resultDefault.unitPrice = respQuery.invoice_detail[0].price;
    resultDefault.originOfCountry = respQuery.invoice_detail[0].originOfGoods;
    resultDefault.uom = respQuery.invoice_detail[0].unitOfMeasure === 'Set' ? 'SET' : 'EA';

    return resultDefault;
  }
}
