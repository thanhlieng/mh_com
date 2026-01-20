import { BookingStatus, BookingType, CommonResponse, ETypeService } from '@constants/common.constants';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import * as _ from 'lodash';
import xlsx from 'node-xlsx';
import puppeteer from 'puppeteer';
import { EPermissionKeyToServiceKey } from 'src/common/guards/permission';
import { CommonPaginationRaw } from 'src/common/helper/common-pagination';
import { commonResponse } from 'src/common/helper/common-response';
import { sendRawMessageToEmail } from 'src/common/helper/helper';
import { getFirstValueArray, removeAccents } from 'src/common/utils/util';
import { zipFiles } from 'src/common/utils/zip-files';
import { acfConfig, awsConfig } from 'src/configs/configs.constants';
import IJwtPayload, { IHistoryInfo } from 'src/modules/auth/payloads/jwt-payload';
import { CreateJapanAddressDto } from 'src/modules/categories/dto/create-japan-address.dto';
import { JapanAddressService } from 'src/modules/categories/services/japan-address.service';
import { CustomersEntity } from 'src/modules/customers/entities/customers.entity';
import { EVENT_CONST } from 'src/modules/events/event.const';
import { HistoryAction, HistoryType, TargetTable } from 'src/modules/history/history.const';
import { InvoiceService } from 'src/modules/invoices/invoices.service';
import { PUDeliveryRepository } from 'src/modules/pu-deliveries/repositories/pu-deliveries.repository';
import { ServiceBookingRepository } from 'src/modules/services-booking/repositories/service.repository';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { BookingMessage } from '../bookings.constant';
import { ImportBookingDto } from '../dto/import-booking.dto';
import { GetManifestDto } from '../dto/manifest.dto';
import { UpdateAllManifestYamatoDto } from '../dto/update-all-manifest-yamato.dto';
import {
  EBookingTypeToShipmentType,
  EShipmentTypeToBookingType,
  UpdateManifestYamatoDto,
} from '../dto/update-manifest-yamato.dto';
import { BookingDetailEntity } from '../entities/booking-detail.entity';
import { BookingEntity } from '../entities/bookings.entity';
import { IManifestYamato } from '../interface/manifest-yamato.interface';
import { BookingRepository } from '../repositories/booking.repository';
import { columnNameExportManifestYamato } from '../utils/columnName';
import { BookingService } from './bookings.service';

@Injectable()
export class ManageManifestService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly serviceBookingRepository: ServiceBookingRepository,
    private readonly puDeliveriesRepository: PUDeliveryRepository,

    @InjectRepository(BookingDetailEntity)
    private readonly bookingDetailRepository: Repository<BookingDetailEntity>,
    @InjectRepository(CustomersEntity)
    private readonly customerRep: Repository<CustomersEntity>,

    private readonly invoiceService: InvoiceService,
    private readonly bookingService: BookingService,
    private readonly japanAddressService: JapanAddressService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  getServiceKey(manifestPermissionKey: string, payload: IJwtPayload): string[] {
    if (manifestPermissionKey) {
      return [manifestPermissionKey];
    }

    return Array.from(
      new Set(
        payload.permissions
          .filter((permission) => EPermissionKeyToServiceKey[permission])
          .map((permission) => EPermissionKeyToServiceKey[permission])
          .flat(),
      ),
    );
  }

  async getPartnerServiceViaPayload(payload: IJwtPayload) {
    const serviceKeys = this.getServiceKey(null, payload);
    return this.serviceBookingRepository.find({
      where: {
        key: In(serviceKeys),
        typeService: ETypeService.SERVICE_PARTNER,
      },
    });
  }

  async getQueryFilterBookingManifest(
    manifestPermissionKey: string,
    payload: IJwtPayload,
  ): Promise<SelectQueryBuilder<BookingEntity>> {
    const serviceKeys = this.getServiceKey(manifestPermissionKey, payload);
    const partnerService = await this.serviceBookingRepository.find({
      where: {
        key: In(serviceKeys),
        typeService: ETypeService.SERVICE_PARTNER,
      },
    });
    const partnerServiceIds = partnerService.map((service) => service.id);
    if (partnerServiceIds.length === 0) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndMapOne('booking.invoice', 'invoice', 'invoice', 'booking.id = invoice.booking_id')
      .leftJoinAndMapOne('booking.pu_delivery', 'pu_deliveries', 'pu_delivery', 'pu_delivery.booking_id = booking.id')
      .leftJoinAndMapOne(
        'booking.type_of_payment',
        'type_of_payment',
        'type_of_payment',
        'type_of_payment.id = booking.type_of_payment_id',
      )
      .leftJoinAndMapOne(
        'booking.delivery_condition',
        'delivery_conditions',
        'delivery_condition',
        'delivery_condition.id = booking.delivery_condition_id',
      )
      .leftJoinAndMapMany(
        'booking.japan_address',
        'japan_address',
        'japan_address',
        'LOWER(TRIM(booking.receiver_name)) = LOWER(TRIM(japan_address.consignee_name_englsh))',
      )
      .where('booking.is_handle = :isHandle', {
        isHandle: false,
      })
      .andWhere('booking.partner_service IN (:...partnerServiceIds)', {
        partnerServiceIds,
      })
      .andWhere('booking.parent_booking IS NULL')
      .andWhere('booking.partner_bill_code IS NOT NULL')
      .andWhere('is_splited_booking_manifest = false')
      .andWhere('booking.status NOT IN (:...draftStatus)', {
        draftStatus: [BookingStatus.CANCEL, BookingStatus.NOT_YET_HANDED_OVER],
      })
      .orderBy('booking.created_at', 'DESC');

    return query;
  }

  mappingPaymentTerm(type_of_payment_key: string, delivery_condition_key: string): number {
    if (delivery_condition_key === 'DDU') {
      if (type_of_payment_key === 'PP') {
        return 2;
      }

      if (type_of_payment_key === 'CCX') {
        return 4;
      }
    }

    if (delivery_condition_key === 'DDP') {
      if (type_of_payment_key === 'PP') {
        return 3;
      }

      if (type_of_payment_key === 'CCX') {
        return 5;
      }
    }

    return null;
  }

  mappingFreightCharge(freightChargeManifest: number, paymentTerm: number): number {
    if (freightChargeManifest) return freightChargeManifest;

    if ([2, 3].includes(paymentTerm)) return 1;

    return null;
  }

  mappingItemCode(commoditiesTypeName: string) {
    if (commoditiesTypeName === 'Document') return 'DOC';
    if (commoditiesTypeName === 'Book') return 'BK';

    return 'OTH';
  }

  async mappingManifestYamatoData(data: any[], isSelect?: boolean): Promise<IManifestYamato[]> {
    const result: IManifestYamato[] = [];
    if (!data?.length) return result;

    for (let i = 0; i < data.length; i++) {
      const paymentTerm = this.mappingPaymentTerm(data[i].type_of_payment_key, data[i].delivery_condition_key);

      const [invoiceData, bookingDetailFirst] = await Promise.all([
        this.invoiceService.statisticalInvoiceByBookingId(data[i].id),
        this.bookingDetailRepository
          .createQueryBuilder('booking_detail')
          .leftJoinAndMapOne(
            'booking_detail.commodities_type',
            'commodities_type',
            'commodities_type',
            'commodities_type.id = booking_detail.commodities_type_id',
          )
          .select([
            'commodities_type.name as commodities_type_name',
            'booking_detail.shipping_item_en as shipping_item_en',
          ])
          .where('booking_detail.booking_id = :bookingId', {
            bookingId: data[i].id,
          })
          .getRawOne(),
      ]);
      const shipperAddress = [
        data[i].sender_address_en_1,
        data[i].sender_address_en_2,
        data[i].sender_address_en_3,
        `${data[i].sender_town} - ${data[i].sender_province} - ${data[i].sender_country}`,
      ].filter((item) => item);
      const cneeAddress = [
        data[i].receiver_address_1,
        data[i].receiver_address_2,
        data[i].receiver_town,
        `${data[i].receiver_province} - ${data[i].receiver_country}`,
      ].filter((item) => item);

      result.push({
        id: data[i].id,
        shipDate: new Date(),
        handlingType: 2,
        shipmentType: (data[i].pu_booking_type || data[i].booking_type) == BookingType.LICENSE ? 'D' : 'N',
        shipperName: removeAccents(data[i].sender_name_en),
        shipperAdd1: removeAccents(shipperAddress.shift()),
        shipperAdd2: removeAccents(shipperAddress.shift()),
        shipperAdd3: removeAccents(shipperAddress.shift()) || '',
        shipperAdd4: removeAccents(shipperAddress.shift()) || '',
        shipperPostalCode: (data[i].sender_postal_code || '').split('-').join(''),
        shipperPhone: data[i].sender_phone_number.replace(/[^\w\s]/g, ''),

        packageID: data[i].package_id_manifest || '',
        trackingNo: data[i].partner_bill_code || '',
        referenceNoManifest: data[i].reference_no_manifest || data[i].partner_bill_code,

        cneeCompany: removeAccents(data[i].receiver_name),
        cneeAdd1: removeAccents(cneeAddress.shift()),
        cneeAdd2: removeAccents(cneeAddress.shift()),
        cneeAdd3: removeAccents(cneeAddress.shift()) || '',
        cneeAdd4: removeAccents(cneeAddress.shift()) || '',
        cneeTel: data[i].receiver_phone_number.replace(/[^\w\s]/g, ''),
        cneePostalCode: (data[i].receiver_postal_code || '').split('-').join(''),
        cneeNameInKatakana: data[i].receiver_contact_person,

        gwManifest: data[i].gw_manifest || 0,
        unitOfWeight: 'KG',

        paymentTermManifest: data[i].payment_term_manifest || paymentTerm,
        freightChargeManifest: this.mappingFreightCharge(data[i].freight_charge_manifest, paymentTerm),
        itemCode: this.mappingItemCode(bookingDetailFirst?.commodities_type_name),
        itemNameManifest: data[i].item_name_manifest || bookingDetailFirst?.shipping_item_en,
        originOfCountry: invoiceData.originOfCountry || data[i]?.origin_of_country,
        qtyManifest: data[i].qty_manifest || invoiceData.qty,
        uomManifest: data[i].uom_manifest || invoiceData.uom,
        unitPriceManifest: data[i].unit_price_manifest || invoiceData.unitPrice,
        invoiceCurManifest: data[i].invoice_cur_manifest || invoiceData.invoiceCur || '',
        lengthManifest: data[i].length_manifest || 0,
        widthManifest: data[i].width_manifest || 0,
        heightManifest: data[i].height_manifest || 0,
        lengthUnit: 'CM',
        insurance: 'No',
        consigneeNameJapaneseManifest:
          data[i].consignee_name_japanese_manifest || getFirstValueArray(data[i].consignee_name_japanese),
        consigneeCodeManifest: data[i].consignee_code_manifest || getFirstValueArray(data[i].consignee_code),
        registeredCompanyNameManifest:
          data[i].registered_company_name_manifest || getFirstValueArray(data[i].registered_company_name),
        addressManifest: data[i].address_manifest || getFirstValueArray(data[i].japan_address),
        isUploadedPartnerInvoiceFile: isSelect && data[i].partner_invoice_manifest,
        isInvoice: data[i].is_invoice,
      });
    }

    return result;
  }

  selectFieldManifest(query: SelectQueryBuilder<BookingEntity>): SelectQueryBuilder<BookingEntity> {
    return query.select([
      'booking.id as id',
      'booking.origin_of_country as origin_of_country',
      'booking.is_invoice as is_invoice',

      'booking.partner_bill_code as partner_bill_code',

      'booking.type as booking_type',
      'pu_delivery.type as pu_booking_type',

      'booking.sender_name_en as sender_name_en',
      'booking.sender_address_en_1 as sender_address_en_1',
      'booking.sender_address_en_2 as sender_address_en_2',
      'booking.sender_address_en_3 as sender_address_en_3',
      'booking.sender_country as sender_country',
      'booking.sender_province as sender_province',
      'booking.sender_town as sender_town',
      'booking.sender_postal_code as sender_postal_code',
      'booking.sender_phone_number as sender_phone_number',

      'booking.receiver_name as receiver_name',
      'booking.receiver_address_1 as receiver_address_1',
      'booking.receiver_address_2 as receiver_address_2',
      'booking.receiver_address_3 as receiver_address_3',
      'booking.receiver_country as receiver_country',
      'booking.receiver_province as receiver_province',
      'booking.receiver_town as receiver_town',
      'booking.receiver_postal_code as receiver_postal_code',
      'booking.receiver_phone_number as receiver_phone_number',
      'booking.receiver_contact_person as receiver_contact_person',

      'booking.package_id_manifest as package_id_manifest',
      'booking.reference_no_manifest as reference_no_manifest',
      'booking.gw_manifest as gw_manifest',
      'booking.payment_term_manifest as payment_term_manifest',
      'booking.freight_charge_manifest as freight_charge_manifest',
      'booking.item_name_manifest as item_name_manifest',
      'booking.length_manifest as length_manifest',
      'booking.width_manifest as width_manifest',
      'booking.height_manifest as height_manifest',
      'booking.consignee_name_japanese_manifest as consignee_name_japanese_manifest',
      'booking.consignee_code_manifest as consignee_code_manifest',
      'booking.registered_company_name_manifest as registered_company_name_manifest',
      'booking.address_manifest as address_manifest',
      'booking.unit_price_manifest as unit_price_manifest',
      'booking.invoice_cur_manifest as invoice_cur_manifest',
      'booking.payment_term_manifest as payment_term_manifest',
      'booking.partner_invoice_manifest as partner_invoice_manifest',
      'booking.uom_manifest as uom_manifest',
      'booking.qty_manifest as qty_manifest',

      'type_of_payment.key as type_of_payment_key',
      'delivery_condition.key as delivery_condition_key',

      'array_agg(japan_address.consignee_name_japanese) as consignee_name_japanese',
      'array_agg(japan_address.consignee_code) as consignee_code',
      'array_agg(japan_address.registered_company_name) as registered_company_name',
    ]);
  }

  async getBookingsManifest(getManifestDto: GetManifestDto, payload: IJwtPayload) {
    const { permissionActionKey, search } = getManifestDto;
    let query = await this.getQueryFilterBookingManifest(permissionActionKey, payload);
    query = this.selectFieldManifest(query)
      .groupBy('booking.id')
      .addGroupBy('type_of_payment.id')
      .addGroupBy('delivery_condition.id')
      .addGroupBy('pu_delivery.id');

    if (search) {
      query.andWhere('booking.partner_bill_code LIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    const bookings = await CommonPaginationRaw(getManifestDto, query);

    return {
      ...bookings,
      data: await this.mappingManifestYamatoData(bookings.data, true),
    };
  }

  async syncDataJapanAddress(bookingId: string, japanAddressDto: CreateJapanAddressDto) {
    const booking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
      },
      select: {
        receiverName: true,
      },
    });
    if (booking) {
      await this.japanAddressService.checkExistsAndCreate({
        ...japanAddressDto,
        consigneeNameEnglish: booking.receiverName,
      });
    }
  }

  async updateManifestYamato(id: string, updateManifestYamatoDto: UpdateManifestYamatoDto, info?: IHistoryInfo) {
    const dataUpdate = updateManifestYamatoDto;
    if (updateManifestYamatoDto.trackingNo) {
      dataUpdate['partnerBillCode'] = updateManifestYamatoDto.trackingNo;
      delete dataUpdate.trackingNo;
    }

    const bookingType = await this.bookingRepository.getBookingType(id);
    const type = EBookingTypeToShipmentType[bookingType?.pu_booking_type ?? bookingType?.booking_type];
    if (updateManifestYamatoDto.shipmentType !== type) {
      if (!bookingType?.pu_booking_type) {
        throw new BadRequestException('Đơn hàng chưa được lấy hàng vui lòng kiểm tra lại');
      }

      await this.puDeliveriesRepository.update(
        {
          bookingId: id,
        },
        {
          type: EShipmentTypeToBookingType[updateManifestYamatoDto.shipmentType],
        },
      );
    }
    delete dataUpdate.shipmentType;

    // if (updateManifestYamatoDto.originOfCountry) {
    //   await this.invoiceService.updateInvoiceDetailByBookingId(id, {
    //     originOfGoods: updateManifestYamatoDto.originOfCountry,
    //   });

    //   delete updateManifestYamatoDto.originOfCountry;
    // }

    const oldBooking = await this.bookingRepository.findOne({ where: { id } });

    const result = await this.bookingRepository.update(id, dataUpdate);

    if (info) {
      const newBooking = await this.bookingRepository.findOne({
        where: { id },
      });
      this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
        ...info,
        type: HistoryType.ManifestYamato,
        action: HistoryAction.Edit,
        oldItem: oldBooking,
        newItem: newBooking,
        recordId: id,
        targetTable: TargetTable.Bookings,
      });
    }

    // not using sync
    this.syncDataJapanAddress(id, {
      consigneeNameJapanese: updateManifestYamatoDto.consigneeNameJapaneseManifest,
      consigneeCode: updateManifestYamatoDto.consigneeCodeManifest,
      registeredCompanyName: updateManifestYamatoDto.registeredCompanyNameManifest,
      address: updateManifestYamatoDto.addressManifest,
    });

    return commonResponse(CommonResponse.SUCCESS, result);
  }

  async exportManifest(getManifestDto: GetManifestDto, payload: IJwtPayload) {
    const { permissionActionKey } = getManifestDto;
    const data = [[...columnNameExportManifestYamato]];

    let query = await this.getQueryFilterBookingManifest(permissionActionKey, payload);
    query = this.selectFieldManifest(query)
      .groupBy('booking.id')
      .addGroupBy('type_of_payment.id')
      .addGroupBy('delivery_condition.id')
      .addGroupBy('pu_delivery.id');

    const resultQuery = await query.getRawMany();
    const resultMapping = await this.mappingManifestYamatoData(resultQuery);

    for (let i = 0; i < resultMapping.length; i++) {
      data.push(Object.values(resultMapping[i]).slice(1));
    }

    const buffer = xlsx.build([{ name: 'Xử lý manifest', data: data, options: null }]);

    const subject = `MANIFEST - ${dayjs().tz('asia/ho_chi_minh').format('YYYY/MM/DD HH:mm')}`;
    const params = {
      from: awsConfig.emailSend,
      to: awsConfig.emailReceiveManifestYamato,
      subject: subject,
      attachments: [
        {
          filename: `${subject}.xlsx`,
          content: buffer,
        },
      ],
    };
    sendRawMessageToEmail(params);

    return {
      buffer,
      filename: `${subject}.xlsx`,
    };
  }

  async generateAllInvoiceManifestYamato(getManifestDto: GetManifestDto, payload: IJwtPayload) {
    const { permissionActionKey } = getManifestDto;
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: acfConfig.pathChrome ? acfConfig.pathChrome : undefined,
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox', '--headless'],
      });

      const query = await this.getQueryFilterBookingManifest(permissionActionKey, payload);

      query
        // .andWhere('(invoice.id IS NOT NULL)')
        .select([
          `booking.id as "bookingId"`,
          `invoice.id as "invoiceId"`,
          `booking.partnerInvoiceManifest as "partnerInvoiceManifest"`,
          `booking.customerId as "customerId"`,
        ]);

      const resultQuery = await query.getRawMany();

      const { bookingNotInvoiceIds, bookingIds, customerIds } = resultQuery.reduce(
        (prev, curr) => {
          if (curr.partnerInvoiceManifest) {
            prev[`bookingNotInvoiceIds`]?.push(curr.bookingId);
          }

          if (!curr.partnerInvoiceManifest && curr.invoiceId) {
            prev[`bookingIds`]?.push(curr.bookingId);
          }
          prev[`customerIds`]?.push(curr.customerId);

          return prev;
        },
        {
          bookingNotInvoiceIds: [],
          bookingIds: [],
          customerIds: [],
        },
      );

      let invoiceFiles = [];

      while (bookingIds.length) {
        const maxProcessCreateFile =
          acfConfig.maxProcessCreatePdfFile <= bookingIds.length
            ? acfConfig.maxProcessCreatePdfFile
            : bookingIds.length;
        const files = await Promise.all(
          bookingIds.splice(0, maxProcessCreateFile).map((booking) =>
            this.bookingService.generatePartnerBillInvoice(
              {
                bookingId: booking,
                formatTime: 'YYYY_MM_DD HH:mm',
              },
              { browser, isGenerateManifest: true },
            ),
          ),
        );

        invoiceFiles = invoiceFiles.concat(files);
      }

      const bookings = await this.bookingRepository.find({
        where: { id: In(bookingNotInvoiceIds) },
      });

      const customer = await this.customerRep.find({
        where: { id: In(customerIds) },
      });
      const customerById = _.keyBy(customer, 'id');

      const partnerFile = bookings
        .filter((b) => !!b.partnerInvoiceManifest)
        .map((booking) => {
          const customerCode = customerById?.[booking?.customerId]?.customerCode || '';
          return {
            buffer: Buffer.from(booking.partnerInvoiceManifest, 'base64'),
            filename: `${booking.bookingCode} - ${booking.partnerBillCode} - ${dayjs()
              .tz('asia/ho_chi_minh')
              .format('YYYY_MM_DD HH:mm')} - ${customerCode}.pdf`,
          };
        });

      invoiceFiles = [...invoiceFiles, ...partnerFile];

      const bufferZipfile = await zipFiles(invoiceFiles);

      const subject = `MANIFEST - YAMATO - INVOICE ${dayjs().tz('asia/ho_chi_minh').format('YYYY/MM/DD HH:mm')}`;
      const params = {
        from: awsConfig.emailSend,
        to: awsConfig.emailReceiveManifestYamato,
        subject: subject,
        attachments: [
          {
            filename: `${subject}.zip`,
            content: bufferZipfile,
          },
        ],
      };
      sendRawMessageToEmail(params);

      return {
        buffer: bufferZipfile,
        filename: `MANIFEST - YAMATO - INVOICE ${dayjs().tz('asia/ho_chi_minh').format('YYYY/MM/DD HH:mm')}.zip`,
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    } finally {
      try {
        await browser?.close();
      } catch (error) {
        console.log(11111, error);
      }
    }
  }

  async generateAllBookingManifestYamato(getManifestDto: GetManifestDto, payload: IJwtPayload) {
    const { permissionActionKey } = getManifestDto;
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: acfConfig.pathChrome ? acfConfig.pathChrome : undefined,
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox', '--headless'],
      });

      const query = await this.getQueryFilterBookingManifest(permissionActionKey, payload);
      query.select(`booking.id as "bookingId"`);

      const resultQuery = await query.getRawMany();

      let bookingBillFiles = [];

      while (resultQuery.length) {
        const maxProcessCreateFile =
          acfConfig.maxProcessCreatePdfFile <= resultQuery.length
            ? acfConfig.maxProcessCreatePdfFile
            : resultQuery.length;

        const files = await Promise.all(
          resultQuery.splice(0, maxProcessCreateFile).map((booking) =>
            this.bookingService.generatePartnerBill(
              {
                bookingId: booking.bookingId,
                formatTime: 'YYYY_MM_DD HH:mm',
              },
              { browser },
            ),
          ),
        );

        bookingBillFiles = bookingBillFiles.concat(files);
      }

      const bufferZipfile = await zipFiles(bookingBillFiles);

      const subject = `MANIFEST - YAMATO - INVOICE ${dayjs().tz('asia/ho_chi_minh').format('YYYY/MM/DD HH:mm')}`;
      const params = {
        from: awsConfig.emailSend,
        to: awsConfig.emailReceiveManifestYamato,
        subject: subject,
        attachments: [
          {
            filename: `${subject}.zip`,
            content: bufferZipfile,
          },
        ],
      };
      sendRawMessageToEmail(params);

      return {
        buffer: bufferZipfile,
        filename: `MANIFEST - YAMATO - BOOKING ${dayjs().tz('asia/ho_chi_minh').format('YYYY/MM/DD HH:mm')}.zip`,
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    } finally {
      try {
        await browser?.close();
      } catch (error) {
        console.log(11111, error);
      }
    }
  }

  async mappingDataUpdate(data: any[]): Promise<{ id: string; updateManifestYamatoDto: UpdateManifestYamatoDto }> {
    let booking = await this.bookingRepository.findOne({
      where: {
        partnerBillCode: String(data[11]),
        referenceNoManifest: data[12] === '' ? null : String(data[12]),
      },
    });
    if (!booking) {
      booking = await this.bookingRepository.findOne({
        where: {
          partnerBillCode: String(data[11]),
        },
      });
    }

    if (!booking) {
      throw new BadRequestException(`Đơn hàng có trackingNo: ${data[11]} - Reference No: ${data[12]} không tồn tại`);
    }

    return {
      id: booking.id,
      updateManifestYamatoDto: {
        packageID: data[10],
        referenceNoManifest: !data[12] || data[12] === '' ? null : String(data[12]),
        gwManifest: !data[21] || data[21] === '' ? null : Number(data[21]),
        paymentTermManifest: !data[23] || data[23] === '' ? null : Number(data[23]),
        freightChargeManifest: !data[24] || data[24] === '' ? null : Number(data[24]),
        itemNameManifest: data[26],
        qtyManifest: !data[28] || data[28] === '' ? null : Number(data[28]),
        uomManifest: data[29],
        unitPriceManifest: !data[30] || data[30] === '' ? null : Number(data[30]),
        invoiceCurManifest: data[31],
        lengthManifest: !data[32] || data[32] === '' ? null : Number(data[32]),
        widthManifest: !data[33] || data[33] === '' ? null : Number(data[33]),
        heightManifest: !data[34] || data[34] === '' ? null : Number(data[34]),
        consigneeNameJapaneseManifest: data[37],
        consigneeCodeManifest: data[38],
        registeredCompanyNameManifest: data[39],
        addressManifest: data[40],
      },
    };
  }

  async uploadManifestYamatoFile(dto: ImportBookingDto, info: IHistoryInfo) {
    const { file } = dto;
    if (!file) {
      throw new BadRequestException(BookingMessage.INVALID_MANIFEST_YAMATO_FILE);
    }
    const [{ data }] = xlsx.parse(file.buffer, {
      blankrows: false,
    });

    if (JSON.stringify(data[0]) !== JSON.stringify(columnNameExportManifestYamato)) {
      throw new BadRequestException(BookingMessage.INVALID_MANIFEST_YAMATO_FILE);
    }
    const dataUpdates = await Promise.all(data.slice(1).map((row: any[]) => this.mappingDataUpdate(row)));
    await Promise.all(dataUpdates.map((row) => this.updateManifestYamato(row.id, row.updateManifestYamatoDto, info)));

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  uploadPartnerInvoice(id: string, dto: ImportBookingDto, info: IHistoryInfo) {
    const { file } = dto;
    if (!file) {
      throw new BadRequestException(BookingMessage.INVALID_MANIFEST_YAMATO_FILE);
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(BookingMessage.INVALID_MANIFEST_YAMATO_FILE_PDF);
    }

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.ManifestYamato,
      action: HistoryAction.Edit,
      newItem: { invoiceUpload: file.fieldname },
      recordId: id,
      targetTable: TargetTable.Bookings,
    });

    return this.bookingRepository.update(id, {
      partnerInvoiceManifest: file.buffer.toString('base64'),
    });
  }

  async updateAllManifestYamato(payload: IJwtPayload, updateDto: UpdateAllManifestYamatoDto, info: IHistoryInfo) {
    const { packageID, manifestPermissionKey } = updateDto;
    const query = await this.getQueryFilterBookingManifest(manifestPermissionKey, payload);
    query.select([`booking.id as "bookingId"`, `booking.packageID as "packageID"`]);
    const resultQuery = await query.getRawMany();
    const bookingIds = resultQuery.map((booking) => booking.bookingId);

    if (bookingIds.length) {
      await this.bookingRepository.update(
        {
          id: In(bookingIds),
        },
        {
          packageID: packageID,
        },
      );
    }
    for (const booking of resultQuery) {
      const oldItem = { id: booking.bookingId, packageID: booking.packageID };
      const newItem = { id: booking.bookingId, packageID: packageID };
      this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
        ...info,
        type: HistoryType.Operate,
        action: HistoryAction.Edit,
        oldItem,
        newItem,
        recordId: booking.id,
        targetTable: TargetTable.Bookings,
      });
    }

    return commonResponse(CommonResponse.SUCCESS, null);
  }
}
