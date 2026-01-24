import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Inject } from "@nestjs/common/decorators";
import { forwardRef } from "@nestjs/common/utils";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { Mutex, MutexInterface } from "async-mutex";
import xlsx from "node-xlsx";
import {
  BookingStatus,
  BookingType,
  CalculationUnit,
  CommonError,
  CommonResponse,
  countries,
  countryNameToCode,
  DefaultTimezone,
  EPartnerServiceKey,
  EStatusDelivery,
  EStatusDeliveryAcftership,
  EStatusDeliveryMessage,
  ETypeStaff,
  ETypeUser,
} from "src/common/constants/common.constants";
import {
  CommonPagination,
  CommonPaginationRaw,
} from "src/common/helper/common-pagination";
import { commonResponse } from "src/common/helper/common-response";
import {
  convertSymbolToCountryName,
  // sendRawMessageToEmail, // Commented out - AWS SES removed
} from "src/common/helper/helper";
import {
  getStartDateAndEndDate,
  mappingBookingStatus,
  mappingDataBookingClientGenerateExcel,
  mappingDataGenerateExcel,
} from "src/common/utils/mapping";
import { removeAccents } from "src/common/utils/util";
import {
  acfConfig,
  // awsConfig, // Commented out - AWS config removed
  nodeEnvConfig,
} from "src/configs/configs.constants";
import { CustomerRepository } from "src/modules/customers/repositories/customer.repository";
import { ManagementStaffRepository } from "src/modules/customers/repositories/management-staff.repository";
import { EVENT_CONST } from "src/modules/events/event.const";
import {
  HistoryAction,
  HistoryType,
  TargetTable,
} from "src/modules/history/history.const";
import { SplitBookingDto } from "src/modules/pu-deliveries/dto/split-booking.dto";
import { TrackingRepository } from "src/modules/trackings/repositories/tracking.repository";
import { In, IsNull, Not, Repository } from "typeorm";
import IJwtPayload, { IHistoryInfo } from "../../auth/payloads/jwt-payload";
import { CommoditiesTypeService } from "../../commodities-types/commodities-types.service";
import { CurrencyUnitService } from "../../currency-units/currency-units.service";
import { CustomersEntity } from "../../customers/entities/customers.entity";
import { DeliveryConditionsService } from "../../delivery-conditions/delivery-conditions.service";
import { IDeliveryConditions } from "../../delivery-conditions/interface/delivery-conditions.interface";
import { CreateInvoiceDto } from "../../invoices/dto/create-invoices.dto";
import { InvoiceDetailEntity } from "../../invoices/entities/invoices-detail.entity";
import { InvoiceEntity } from "../../invoices/entities/invoices.entity";
import { InvoiceService } from "../../invoices/invoices.service";
import { CreatePUDeliveriesDetailDto } from "../../pu-deliveries/dto/create-pu-deliveries-detail.dto";
import { CreatePuDeliveriesDto } from "../../pu-deliveries/dto/create-pu-deliveries.dto";
import { PuDeliveriesService } from "../../pu-deliveries/services/pu-deliveries.service";
import { IService } from "../../services-booking/interface/services.interface";
import { ServiceService } from "../../services-booking/services.service";
import { ShippingItemService } from "../../shipping-items/shipping-items.service";
import { StaffsService } from "../../staffs/staffs.service";
import { TrackingsEntity } from "../../trackings/entities/trackings.entity";
import { ITrackings } from "../../trackings/interface/trackings.interface";
import { TrackingsService } from "../../trackings/trackings.service";
import { TypeOfPaymentService } from "../../type-of-payments/type-of-payments.service";
import { VirtualDeliveryAddressService } from "../../virtual-delivery-address/virtual-delivery-address.service";
import {
  ColumnsNameExportBookingAdmin,
  columnsNameExportBookingClient,
} from "../bookings.type";
import { AssigneeBookingForPickupDto } from "../dto/assignee-booking-for-pickup.dto";
import { CancelBookingDto } from "../dto/cancel-booking.dto";
import { ChangeStatusBookingDto } from "../dto/change-status-booking.dto";
import { ConfirmReceiptGoodsDto } from "../dto/confirm-receipt-goods.dto";
import { CreateBillDto } from "../dto/create-bill.dto";
import { CreateBookingDetailDto } from "../dto/create-booking-detail.dto";
import {
  CreateBookingDto,
  CreateBookingInvoiceDto,
} from "../dto/create-bookings.dto";
import { CreateSmallBillDto } from "../dto/create-small-bill.dto";
import { GenerateExcelFileDto } from "../dto/generate-excel-file.dto";
import { GetAssigneeBookingPickUpDto } from "../dto/get-assignee-booking-pickup.dto";
import { GetBookingDeliveryDto } from "../dto/get-booking-delivery.dto";
import { GetBookingPickupDto } from "../dto/get-booking-pickup.dto";
import { GetBookingDto } from "../dto/get-booking.dto";
import { ImportBookingDto } from "../dto/import-booking.dto";
import { MyAssigneeBookingDto } from "../dto/my-assignee-booking.dto";
import { SearchBookingDto } from "../dto/search-booking.dto";
import { UpdateBookingInvoiceDto } from "../dto/update-bookings.dto";
import { UpdatePartnerBillCodeDto } from "../dto/update-partner-bill-code.dto";
import { BookingDetailEntity } from "../entities/booking-detail.entity";
import { BookingEntity } from "../entities/bookings.entity";
import { IBookingDetail } from "../interface/booking-detail.interface";
import { IBooking, IGetBooking } from "../interface/bookings.interface";
import { IImportBooking } from "../interface/import-booking.interface";
import { IOptionGenerateBill } from "../interface/option-generate-bill.interface";
import { BookingRepository } from "../repositories/booking.repository";
import { GenerateBillService } from "./generate-bill.service";
import { EPermissionActionKey } from "src/common/guards/permission";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class BookingService {
  // Mutex implementation
  private readonly mutexSplitBooking: MutexInterface;
  private readonly mutexAftership: MutexInterface;

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly trackingRepository: TrackingRepository,

    // customer repository
    private readonly customerRepository: CustomerRepository,
    private readonly managementStaffRepository: ManagementStaffRepository,

    @InjectRepository(BookingDetailEntity)
    private readonly bookingDetailRepository: Repository<BookingDetailEntity>,

    // private readonly customerService: CustomerService,
    private readonly invoiceService: InvoiceService,
    private readonly generateBillService: GenerateBillService,
    private readonly deliveryConditionsService: DeliveryConditionsService,
    private readonly virtualDeliveryAddressService: VirtualDeliveryAddressService,
    private readonly currencyUnitService: CurrencyUnitService,
    private readonly commoditiesService: CommoditiesTypeService,
    private readonly shippingItemService: ShippingItemService,
    private readonly serviceService: ServiceService,
    private readonly typeOfPaymentService: TypeOfPaymentService,
    private readonly staffsService: StaffsService,

    @Inject(forwardRef(() => TrackingsService))
    private readonly trackingsService: TrackingsService,

    @Inject(forwardRef(() => PuDeliveriesService))
    private readonly puDeliveriesService: PuDeliveriesService,

    private readonly eventEmitter: EventEmitter2
  ) {
    this.mutexSplitBooking = new Mutex();
    this.mutexAftership = new Mutex();
  }

  getBookingIdsByBookingCodes(bookingCodes: string[]) {
    return this.bookingRepository.find({
      where: {
        bookingCode: In(bookingCodes),
        isHandle: true,
      },
      select: {
        id: true,
        bookingCode: true,
      },
    });
  }

  mappingEstimateDate(estimatedDate: Date, estimateHour: string) {
    let estimateGetBooking = dayjs(estimatedDate)
      .tz("asia/ho_chi_minh")
      .format("YYYY-MM-DD");
    estimateGetBooking += `T${estimateHour}:00+07:00`;
    return new Date(estimateGetBooking);
  }

  updateBookingById(bookingId: string, updateBookingDto: object) {
    return this.bookingRepository.update({ id: bookingId }, updateBookingDto);
  }

  async getServiceBookingById(serviceId: string) {
    return this.serviceService.findOne({
      where: {
        id: serviceId,
      },
    });
  }

  async findBookingByBillCode(BillCode: string) {
    const booking = await this.bookingRepository.findOne({
      where: [{ bookingCode: BillCode }, { partnerBillCode: BillCode }],
    });

    if (!booking) throw new NotFoundException();

    return booking;
  }

  async getValueCreateBookingDefault(): Promise<IImportBooking> {
    const [commoditiesType, shippingItem, deliveryCondition, typeOfPayment] =
      await Promise.all([
        this.commoditiesService.getCommoditiesTypeDefault(),
        this.shippingItemService.getShippingItemDefault(),
        this.deliveryConditionsService.getDeliveryConditionDefault(),
        this.typeOfPaymentService.getTypeOfPaymentDefault(),
      ]);
    return {
      commoditiesTypeId: commoditiesType.id,
      shippingItemViId: shippingItem.id,
      deliveryConditionId: deliveryCondition.id,
      typeOfPaymentId: typeOfPayment.id,
    };
  }

  async calcBulkyWeightByServiceId(
    serviceId: string,
    longs: number,
    width: number,
    height: number
  ) {
    const service = await this.serviceService.findOne({
      where: {
        id: serviceId,
      },
    });
    if (service.coefficient)
      return (longs * width * height) / service.coefficient;
    return null;
  }

  calcBulkyWeightByService(
    service: IService,
    longs: number,
    width: number,
    height: number
  ) {
    if (service.coefficient)
      return (longs * width * height) / service.coefficient;
    return null;
  }

  async importBookingByExcelFile(importBookingDto: ImportBookingDto) {
    const { file } = importBookingDto;
    if (!file) throw new BadRequestException();
    const [{ data }] = xlsx.parse(file.buffer);
    const bookingData: any[] = data?.slice(2);

    if (!bookingData?.length) {
      throw new BadRequestException("File is empty");
    }
    const {
      commoditiesTypeId,
      shippingItemViId,
      deliveryConditionId,
      typeOfPaymentId,
    } = await this.getValueCreateBookingDefault();
    const dataInsertBooking: Partial<BookingEntity>[] = [];
    const dataInsertBookingDetail: Partial<BookingDetailEntity>[] = [];
    for (let i = 0; i < bookingData.length; i++) {
      if (
        !bookingData[i][2] ||
        bookingData[i][2] === "ERROR" ||
        bookingData[i][2] === ""
      ) {
        break;
      }
      const customer = await this.customerRepository.getCustomerByCustomerCode(
        bookingData[i][11]
      );
      const booking: Partial<BookingEntity> = {
        customerId: customer.id,
        deliveryConditionId: deliveryConditionId,
        estimatedDate: this.mappingEstimateDate(new Date(), "15:00"),
        estimateHour: "15:00",
        isInvoice: false,
        type: bookingData[i][4],
        serviceBookingId: bookingData[i][2],
        senderNameVi: customer.fullName,
        senderNameEn: customer.fullNameEn,
        senderAddressVi: customer.detailAddress,
        senderAddressEn: customer.detailAddress,
        senderContactPerson: bookingData[i][15],
        senderPostalCode: bookingData[i][16],
        senderPhoneNumber: bookingData[i][17],
        senderProvince: bookingData[i][18],
        senderCountry: bookingData[i][20],
        senderNote: bookingData[i][29],
        receiverName: bookingData[i][21],
        receiverAddress: bookingData[i][22],
        receiverAddress1: bookingData[i][22]?.slice(0, 35),
        receiverAddress2: bookingData[i][22]?.slice(35, 70),
        receiverAddress3: bookingData[i][22]?.slice(70),
        receiverContactPerson: bookingData[i][23],
        receiverPostalCode: bookingData[i][24],
        receiverPhoneNumber: bookingData[i][25],
        receiverProvince: bookingData[i][26],
        receiverCountry: bookingData[i][28],
        receiverNote: bookingData[i][30],
        isCustomerCreateDeclaration: false,
        partnerBillCode: null,
        typeOfPaymentId,
        status: BookingStatus.HANDED_OVER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dataInsertBooking.push(booking);

      const bookingDetail: Partial<BookingDetailEntity> = {
        quantity: 1,
        calculationUnit: CalculationUnit.CM_KG,
        commoditiesTypeId,
        shippingItemViId,
        description: bookingData[i][5],
        shippingItemEn: bookingData[i][6],
        originItem: customer.country,
        weight: bookingData[i][10],
        bulkyWeight: await this.calcBulkyWeightByServiceId(
          bookingData[i][2],
          bookingData[i][7],
          bookingData[i][8],
          bookingData[i][9]
        ),
        longs: bookingData[i][7],
        width: bookingData[i][8],
        height: bookingData[i][9],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dataInsertBookingDetail.push(bookingDetail);
    }
    const resultInsertBooking = await this.bookingRepository.save(
      dataInsertBooking
    );
    for (let i = 0; i < resultInsertBooking.length; i++) {
      dataInsertBookingDetail[i].bookingId = resultInsertBooking[i].id;
    }
    await this.bookingDetailRepository.save(dataInsertBookingDetail);
    return resultInsertBooking;
  }

  async updateStatus(
    bookingId: string,
    status: BookingStatus,
    serviceBookingId: string
  ) {
    const result = await this.bookingRepository.update(
      {
        id: bookingId,
      },
      {
        status: status,
        serviceBookingId,
      }
    );
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  async getBookingDelivery(getBookingDeliveryDto: GetBookingDeliveryDto) {
    const { search } = getBookingDeliveryDto;

    const booking = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "booking_detail",
        "booking.id = booking_detail.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.pu",
        "pu_deliveries",
        "pu_deliveries",
        "booking.id = pu_deliveries.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .where(
        "(booking.booking_code LIKE :search OR booking.partner_bill_code LIKE :search)",
        {
          search: `%${search}%`,
        }
      )
      .select([
        "booking.id as booking_id",
        "booking.type as booking_type",
        "booking.booking_code as booking_code",
        "booking.service_booking_id as booking_service_booking",
        "booking.partner_service as booking_partner_service",
        "booking.customs_declaration_number as booking_customs_declaration_number",
        "booking.note as booking_note",
        `array_agg(booking_detail.shipping_item_en) as content_detail`,
        "CAST(SUM(booking_detail.weight * booking_detail.quantity) as float) as weight",
        "CAST(SUM(booking_detail.bulky_weight * booking_detail.quantity) as float) as bulky_weight",
        "CAST(SUM(booking_detail.quantity) AS integer) as quantity",
        "customer.customer_code as customer_code",
        "customer.full_name as customer_full_name",
        "pu_deliveries.id as pu_delivery_id",
        "pu_deliveries.status as status",
      ])
      .andWhere("booking.status NOT IN (:...draftStatus)", {
        draftStatus: [BookingStatus.NOT_YET_HANDED_OVER, BookingStatus.CANCEL],
      })
      .andWhere("booking.parent_booking IS NULL")
      .andWhere("pu_deliveries.id IS NULL")
      .groupBy("booking.id")
      .addGroupBy("customer.id")
      .addGroupBy("pu_deliveries.id")
      .limit(10)
      .getRawMany();

    for (let i = 0; i < booking.length; i++) {
      const booking_detail = await this.bookingDetailRepository
        .createQueryBuilder("bd")
        .select([
          "quantity",
          "CAST(weight as float)",
          "CAST(bulky_weight as float)",
          "CAST(height as float)",
          "CAST(width as float)",
          "CAST(longs as float)",
        ])
        .where("bd.booking_id = :bookingId", {
          bookingId: booking[i].booking_id,
        })
        .getRawMany();

      booking[i]["content_detail"] = booking[i]?.content_detail.join(",");
      booking[i]["booking_detail"] = booking_detail;
    }
    if (!booking.length) {
      return this.getOnePuDelivery(search);
    }

    return booking;
  }

  async getOnePuDelivery(search: string) {
    const booking = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "booking_detail",
        "booking.id = booking_detail.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.pud",
        "pu_deliveries",
        "pud",
        "booking.id = pud.booking_id"
      )
      .leftJoinAndMapMany(
        "pud.pudDetail",
        "pu_deliveries_detail",
        "pu_deliveries_detail",
        "pud.id = pu_deliveries_detail.pu_delivery_id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .where(
        "(booking.booking_code LIKE :search OR booking.partner_bill_code LIKE :search)",
        {
          search: `%${search}%`,
        }
      )
      .select([
        "booking.id as booking_id",
        "booking.booking_code as booking_code",
        "pud.type as booking_type",
        "pud.service_booking_id as booking_service_booking",
        "booking.partner_service as booking_partner_service",
        "pud.customs_declaration_number as booking_customs_declaration_number",
        "pud.note as booking_note",
        `pud.content_detail as content_detail`,
        "CAST(SUM(pu_deliveries_detail.weight * pu_deliveries_detail.quantity) as float) as weight",
        "CAST(SUM(pu_deliveries_detail.bulky_weight * pu_deliveries_detail.quantity) as float) as bulky_weight",
        "SUM(pu_deliveries_detail.quantity) as quantity",
        "customer.customer_code as customer_code",
        "customer.full_name as customer_full_name",
        "pud.id as pu_delivery_id",
        "pud.status as status",
      ])
      .andWhere("booking.status NOT IN (:...draftStatus)", {
        draftStatus: [BookingStatus.NOT_YET_HANDED_OVER, BookingStatus.CANCEL],
      })
      .andWhere("booking.parent_booking IS NULL")
      .andWhere("pud.id is not null")
      .groupBy("booking.id")
      .addGroupBy("customer.id")
      .addGroupBy("pud.id")
      .limit(10)
      .getRawMany();

    for (let i = 0; i < booking.length; i++) {
      booking[i]["booking_detail"] =
        await this.puDeliveriesService.getPuDDetail(booking[i].pu_delivery_id);
    }

    return booking;
  }

  async getBookingsByPartnerBillCode(
    partnerBillCode: string
  ): Promise<IBooking[]> {
    const query = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .innerJoinAndMapOne(
        "booking.tracking",
        "trackings",
        "tracking",
        "tracking.booking_id = booking.id"
      )
      .leftJoinAndMapOne(
        "booking.OPartnerService",
        "services",
        "services",
        "services.id = booking.partnerService"
      )
      .leftJoinAndMapMany(
        "customer.management_staff",
        "management_staff",
        "management_staff",
        "customer.id = management_staff.customer_id"
      )
      .leftJoinAndMapOne(
        "management_staff.staff",
        "staffs",
        "staff",
        "staff.id = management_staff.staff_id"
      )
      .where("booking.partner_bill_code = :partnerBillCode", {
        partnerBillCode,
      })
      .andWhere("booking.is_handle = :isHandle", {
        isHandle: true,
      });

    return query.getMany();
  }

  async getBookingIdBypartnerBillCode(
    partnerBillCode: string
  ): Promise<IBooking> {
    const result = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .leftJoinAndMapOne(
        "booking.OPartnerService",
        "services",
        "services",
        "services.id = booking.partnerService"
      )
      .leftJoinAndMapMany(
        "customer.management_staff",
        "management_staff",
        "management_staff",
        "customer.id = management_staff.customer_id"
      )
      .leftJoinAndMapOne(
        "management_staff.staff",
        "staffs",
        "staff",
        "staff.id = management_staff.staff_id"
      )
      .where("booking.partner_bill_code = :partnerBillCode", {
        partnerBillCode,
      })
      .getOne();

    return result;
  }

  async getActiveBooking(id: string, payload?: IJwtPayload) {
    const bookingQuery = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "c",
        "booking.customer_id = c.id"
      )
      .leftJoinAndMapOne(
        "booking.service",
        "services",
        "service",
        "booking.service_booking_id = service.id"
      )
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "bd",
        "booking.id = bd.booking_id"
      )
      .where("booking.id = :id", {
        id,
      });
    if (payload) {
      const customer = await this.customerRepository.getCustomerByUserIDV2(
        payload.id
      );
      bookingQuery.andWhere(
        "booking.customer_id = :customerId AND booking.status IN (:...status)",
        {
          customerId: customer.id,
          status: [
            BookingStatus.NOT_YET_HANDED_OVER,
            BookingStatus.HANDED_OVER,
          ],
        }
      );
    }
    const booking = await bookingQuery.getOne();
    if (!booking) throw new NotFoundException();
    const checkPUHasBeenPickedUp =
      await this.puDeliveriesService.findOneByBookingId(booking.id);
    if (checkPUHasBeenPickedUp) {
      throw new BadRequestException(CommonError.PICKUP_HAS_BEEN_PICKED_UP);
    }

    return booking;
  }

  async getActiveBookingDetail(id: string, payload: IJwtPayload) {
    const customer = await this.customerRepository.getCustomerByUserID(
      payload.id
    );

    const bookingDetail = await this.bookingDetailRepository
      .createQueryBuilder("bdt")
      .leftJoin("booking", "booking", "booking.id = bdt.booking_id")
      .where("bdt.id = :id", { id })
      .andWhere("booking.customer_id = :customerId", {
        customerId: customer.id,
      })
      .andWhere("booking.status = :status", {
        status: BookingStatus.NOT_YET_HANDED_OVER,
      })
      .getOne();

    if (!bookingDetail) throw new NotFoundException();

    return bookingDetail;
  }

  async getBookingByBookingCode(searchBookingDto: SearchBookingDto) {
    const { bookingCode } = searchBookingDto;

    const booking: IBooking = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "db",
        "booking.id = db.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.invoice",
        "invoice",
        "invoice",
        "booking.id = invoice.booking_id"
      )
      .leftJoinAndMapMany(
        "invoice.invoiceDetail",
        "invoice_detail",
        "ivd",
        "invoice.id = ivd.invoice_id"
      )
      .where("booking.booking_code = :bookingCode", {
        bookingCode,
      })
      .getOne();

    return {
      booking: {
        ...booking,
        invoice: undefined,
      },
      invoice: booking?.invoice,
    };
  }

  async getBookingPickUp(getBookingPickupDto: GetBookingPickupDto) {
    const { search, estimatedDate } = getBookingPickupDto;

    const bookingsQuery = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.unit",
        "units",
        "unit",
        "booking.unit_id = unit.id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "c",
        "booking.customer_id = c.id"
      )
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "bd",
        "booking.id = bd.booking_id"
      )
      .where("booking.status = :status", { status: BookingStatus.HANDED_OVER });

    if (search) {
      bookingsQuery.andWhere(
        `(booking.id = :search OR c.id = :search OR c.full_name LIKE '%${search}%' )`,
        {
          search,
        }
      );
    }

    if (estimatedDate) {
      bookingsQuery.andWhere("booking.estimate_date = :estimatedDate", {
        estimatedDate,
      });
    } else {
      const timeNow = new Date();
      bookingsQuery.andWhere("booking.estimate_date >= :timeNow", { timeNow });
    }

    return CommonPagination(getBookingPickupDto, bookingsQuery);
  }

  async getNewBookingCode() {
    const lastBooking = await this.bookingRepository.findOne({
      where: {
        bookingCode: Not(IsNull()),
      },
      order: {
        bookingCode: "DESC",
      },
    });
    if (lastBooking) {
      let newBookingCode: any = Number(lastBooking.bookingCode) + 11;
      if (String(newBookingCode).length < acfConfig.bookingCodeStart.length) {
        newBookingCode = ("000000" + newBookingCode).slice(
          -acfConfig.bookingCodeStart.length
        );
      }

      return newBookingCode;
    }

    return acfConfig.bookingCodeStart;
  }

  removeAccentsBookingInfor(booking: BookingEntity) {
    const removeAccentsList = [
      "senderNameEn",
      "senderAddressEn",
      "senderContactPerson",
      "senderProvince",
      "senderDepartment",
      "senderTown",
      "senderCountry",
      "senderAddressEn1",
      "senderAddressEn2",
      "senderAddressEn3",
      "senderOtherShippingAddress",

      "receiverName",
      "receiverAddress",
      "receiverAddress1",
      "receiverAddress2",
      "receiverAddress3",
      "receiverProvince",
      "receiverContactPerson",
      "receiverDepartment",
      "receiverTown",
      "receiverCountry",
    ];
    for (let i = 0; i < removeAccentsList.length; i++) {
      booking[removeAccentsList[i]] = removeAccents(
        booking[removeAccentsList[i]]
      );
    }

    return booking;
  }

  async validateBookingDetails(bookingDetails: CreateBookingDetailDto[]) {
    if (!bookingDetails.length) return;

    const commoditiesType = await this.commoditiesService.find({
      where: {
        id: In(bookingDetails.map((item) => item.commoditiesTypeId)),
      },
    });
    commoditiesType.forEach((item, index) => {
      if (item.isDeleted) {
        throw new HttpException(
          `Nhóm hàng hóa vận chuyển '${item.name}' của sản phẩm thứ ${
            index + 1
          } không tồn tại! Vui lòng kiểm tra lại`,
          HttpStatus.BAD_REQUEST
        );
      }
    });
  }

  async create(
    createBookingInvoiceDto: CreateBookingInvoiceDto,
    payload: IJwtPayload
  ) {
    const timeNow = new Date();
    const createBookingDto: CreateBookingDto = createBookingInvoiceDto.booking;
    const createInvoiceDto: CreateInvoiceDto = createBookingInvoiceDto?.invoice;

    let booking = this.bookingRepository.create(createBookingDto);

    await this.validateBookingDetails(createBookingDto.bookingDetail);

    // mapping address
    booking.senderAddressEn = `${booking.senderAddressEn1 || ""} ${
      booking.senderAddressEn2 || ""
    } ${booking.senderAddressEn3 || ""}`;

    booking.receiverAddress = `${booking.receiverAddress1 || ""} ${
      booking.receiverAddress2 || ""
    } ${booking.receiverAddress3 || ""}`;

    booking.senderNameVi = booking.senderNameEn;
    booking.senderAddressVi = booking.senderAddressEn;

    //Remove accents
    booking = this.removeAccentsBookingInfor(booking);

    const customer: CustomersEntity =
      await this.customerRepository.getCustomerByUserID(payload.id);
    booking.customerId = customer.id;
    booking.unitId = customer.unitId;
    let estimateGetBooking = dayjs(createBookingDto.estimatedDate)
      .tz("asia/ho_chi_minh")
      .format("YYYY-MM-DD");
    estimateGetBooking += `T${createBookingDto.estimateHour}:00+07:00`;
    booking.estimatedDate = new Date(estimateGetBooking);

    booking.senderAddressEn2 = booking.senderAddressEn2 || "";
    booking.senderAddressEn3 = booking.senderAddressEn3 || "";
    booking.receiverAddress2 = booking.receiverAddress2 || "";
    booking.receiverAddress3 = booking.receiverAddress3 || "";
    delete booking.partnerBillCode;
    delete booking.partnerService;
    if (!createInvoiceDto) {
      booking.isInvoice = false;
    }

    if (booking.estimatedDate < timeNow) {
      throw new BadRequestException(CommonError.BAD_ESTIMATE_DATE);
    }

    // Check service booking exists
    if (!customer.service.includes(createBookingDto.serviceBookingId)) {
      throw new BadRequestException(CommonError.SERVICE_BOOKING_NOT_EXISTS);
    }

    const resultBooking = await this.bookingRepository.save(booking);
    const listBookingDetail = [];

    if (createBookingDto.bookingDetail) {
      for (const createBookingDetail of createBookingDto.bookingDetail) {
        const formatBookingDetail =
          this.bookingDetailRepository.create(createBookingDetail);
        formatBookingDetail.bookingId = resultBooking.id;
        formatBookingDetail.bulkyWeight =
          await this.serviceService.calculateBulkyWeight({
            height: createBookingDetail.height,
            longs: createBookingDetail.longs,
            width: createBookingDetail.width,
            serviceId: createBookingDto.serviceBookingId,
          });

        const bookingDetail = await this.bookingDetailRepository.save(
          formatBookingDetail
        );
        listBookingDetail.push(bookingDetail);
      }
    }

    if (createBookingDto?.isInvoice && createInvoiceDto) {
      const createInvoiceDetailDto = createInvoiceDto.invoiceDetail;
      createInvoiceDto.bookingId = resultBooking.id;
      const invoiceEntity = new InvoiceEntity();

      Object.assign(invoiceEntity, createInvoiceDto);
      invoiceEntity.invoiceDate = new Date(invoiceEntity.invoiceDate);
      const invoice = await invoiceEntity.save();

      if (createInvoiceDetailDto?.length) {
        for (let i = 0; i < createInvoiceDetailDto.length; i++) {
          const invoiceDetailEntity = new InvoiceDetailEntity();
          Object.assign(invoiceDetailEntity, createInvoiceDetailDto[i]);
          invoiceDetailEntity.invoiceId = invoice.id;
          invoiceDetailEntity.totalMoney =
            invoiceDetailEntity.price * invoiceDetailEntity.quantity;

          await invoiceDetailEntity.save();
        }
      }
    }

    const result = {
      ...resultBooking,
      bookingDetail: listBookingDetail,
    };

    return result;
  }

  async confirmBooking(payload: IJwtPayload, id: string) {
    const booking = await this.getActiveBooking(id, payload);

    if (booking.estimatedDate.getTime() <= new Date().getTime()) {
      throw new BadRequestException(CommonError.BAD_ESTIMATE_DATE);
    }
    const result = await this.bookingRepository.update(
      { id: booking.id, status: BookingStatus.NOT_YET_HANDED_OVER },
      {
        status: BookingStatus.HANDED_OVER,
      }
    );
    if (result.affected === 0) {
      throw new BadRequestException(CommonError.BOOKING_CONFIRMED);
    }
    await this.trackingsService.createTrackingNullValueAftership(booking);

    try {
      this.sendMailConfirmBooking(payload, booking, booking.estimatedDate);
    } catch (error) {
      console.log(error);
    }

    return booking;
  }

  async assigneePickupBooking(bookingID: string, customerID: string) {
    const pickupStaffs =
      await this.managementStaffRepository.getManagementStaffs({
        customerID: customerID,
        typeStaff: ETypeStaff.FORWARDING_STAFF,
      });

    if (pickupStaffs.length > 0) {
      const assigneePickupBookingDto: AssigneeBookingForPickupDto = {
        bookingIds: [bookingID],
        staffId: pickupStaffs[0].staffId,
      };

      await this.assigneeBookingForPickup(assigneePickupBookingDto);
    }
  }

  async confirmBookingV2(payload: IJwtPayload, id: string) {
    const booking = await this.getActiveBooking(id, payload);
    if (booking.status === BookingStatus.HANDED_OVER) {
      throw new BadRequestException(CommonError.BOOKING_CONFIRMED);
    }
    booking.status = BookingStatus.HANDED_OVER;
    if (booking.estimatedDate.getTime() <= new Date().getTime()) {
      throw new BadRequestException(CommonError.BAD_ESTIMATE_DATE);
    }

    try {
      let dataUpdate: any = {
        status: BookingStatus.HANDED_OVER,
      };
      // reference code
      if (booking.referenceCode) {
        const kCargoService = await this.serviceService.findOne({
          where: {
            key: EPartnerServiceKey.K_CARGO,
          },
        });
        if (kCargoService) {
          booking.partnerBillCode = booking.referenceCode;
          booking.partnerService = kCargoService.id;
          dataUpdate = {
            ...dataUpdate,
            partnerBillCode: booking.referenceCode,
            partnerService: kCargoService.id,
          };
        }
      }

      const result = await this.bookingRepository.update(
        {
          id: booking.id,
          status: BookingStatus.NOT_YET_HANDED_OVER,
        },
        dataUpdate
      );

      if (result.affected === 0) {
        throw new BadRequestException();
      }

      const createTrackingAftership: ITrackings = {
        bookingId: booking.id,
        title: booking.bookingCode,
        orderId: booking.id,
        orderNumber: booking.bookingCode,
        orderDate: booking.createdAt,
        trackingShipDate: new Date(),
        subtag: EStatusDeliveryAcftership.Pending,
        tag: EStatusDeliveryAcftership.Pending,
        subtagMessage: EStatusDeliveryAcftership.Pending,
      };
      const trackingEntity = new TrackingsEntity();
      Object.assign(trackingEntity, createTrackingAftership);

      const trackingResult = await this.trackingRepository.save(trackingEntity);
      await this.trackingsService.createCheckpoint(
        {
          city: "HN",
          location: "HN",
          countryName: "VN",
          message: EStatusDeliveryMessage.information_received,
          tag: EStatusDeliveryAcftership.Pending,
          checkpointTime: new Date().toISOString(),
          timezone: DefaultTimezone,
        },
        trackingResult.id
      );
      // assignee pickup
      this.assigneePickupBooking(booking.id, booking.customerId);

      // send mail
      await this.sendMailConfirmBooking(
        payload,
        booking,
        booking.estimatedDate
      );
    } catch (error) {
      console.info(
        "========================= START DEBUG   ==========================="
      );
      console.log(error);
      console.info(
        "=========================  END DEBUG   ============================"
      );

      //rollback
      // await queryRunner.rollbackTransaction();

      if (error?.response) {
        throw new BadRequestException(error.response);
      }
      throw new InternalServerErrorException(error);
    } finally {
      // await queryRunner.release();
    }

    return booking;
  }

  async cancelBooking(
    id: string,
    cancelBookingDto: CancelBookingDto,
    payload?: IJwtPayload
  ) {
    const booking = await this.getActiveBooking(id, payload);
    if (booking.status === BookingStatus.HANDED_OVER) {
      booking.isHandle = null;
    }
    booking.status = BookingStatus.CANCEL;
    booking.canceledAt = new Date();
    booking.reasonCancelBooking = cancelBookingDto.reason;
    await this.sendMailCancelBooking(booking);

    return booking.save();
  }

  async checkBookingCancel(id: string, payload?: IJwtPayload) {
    try {
      await this.getActiveBooking(id, payload);
      return {
        can_be_cancel: true,
      };
    } catch (error) {
      return {
        can_be_cancel: false,
      };
    }
  }

  async addBookingDetail(
    id: string,
    createBookingDetailDto: CreateBookingDetailDto,
    payload: IJwtPayload
  ) {
    const booking = await this.getActiveBooking(id, payload);

    const bookingDetail = new BookingDetailEntity();

    Object.assign(bookingDetail, createBookingDetailDto);
    bookingDetail.bookingId = booking.id;

    return await bookingDetail.save();
  }

  async findAll(getBookingDto: GetBookingDto, payload: IJwtPayload) {
    const {
      createBookingFrom,
      createBookingTo,
      status,
      type,
      serviceBookingId,
      search,
      isHandle,
      isHandedFilter,
    } = getBookingDto;

    const bookingsQuery = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.serviceBooking",
        "services",
        "services",
        "services.id = booking.service_booking_id"
      )
      .leftJoinAndMapOne(
        "booking.partner_service",
        "services",
        "partner_service",
        "partner_service.id = booking.partner_service"
      )
      .leftJoinAndMapOne(
        "booking.partner_service_domestic",
        "services",
        "partner_service_domestic",
        "partner_service_domestic.id = booking.partner_service_domestic"
      )
      .innerJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "booking_detail",
        "booking.id = booking_detail.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.tracking",
        "trackings",
        "tracking",
        "booking.id = tracking.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.pu_deliveries",
        "pu_deliveries",
        "pu_deliveries",
        "pu_deliveries.booking_id = booking.id"
      )
      .select([
        "booking.id",
        "booking.booking_code",
        "booking.partner_bill_code",
        "booking.status",
        "booking.estimate_date",
        "booking.type",
        "services.name",
        "partner_service.name",
        "booking.note",
        "booking.created_at",
        "customer.customer_code",
        "CAST(SUM(booking_detail.weight * booking_detail.quantity) as float) as weight",
        "CAST(SUM(booking_detail.bulky_weight * booking_detail.quantity) as float) as bulky_weight",
        "SUM(booking_detail.quantity) as quantity",
        "booking.receiver_country",
        "booking.receiver_address",
        "booking.receiver_phone_number",
        "booking.is_handle",
        `CONCAT(booking.receiver_contact_person, ' (' ,booking.receiver_name, ')') as receiver_name`,
        `CONCAT(booking.sender_contact_person, ' (' ,booking.sender_name_en, ')') as sender_name`,
        "booking.is_invoice as is_invoice",
        "booking.customs_declaration_number as customs_declaration_number",
        "partner_service_domestic.name",
        "booking.partner_bill_code_domestic as partner_bill_code_domestic",
        "pu_deliveries.status as pu_deliveries_status",
        "tracking.tag as tracking_tag",
        "tracking.latest_message as latest_delivery_message",
        "tracking.shipment_delivery_date as shipment_delivery_date",
        "booking.reference_code as reference_code",
      ])
      .where("booking.parent_booking IS NULL");

    if (
      payload.typeUser === ETypeUser.STAFF &&
      !payload.permissions.includes(
        EPermissionActionKey.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF
      )
    ) {
      const staff = await this.staffsService.getStaffByPayload(payload);
      const managementStaff = await this.managementStaffRepository.find({
        where: {
          staffId: staff.id,
          typeStaff: ETypeStaff.CODE_OPENING_STAFF,
        },
      });
      if (managementStaff.length > 0) {
        bookingsQuery.innerJoinAndMapOne(
          "customer.business_staff_management",
          "management_staff",
          "management_staff",
          "management_staff.customer_id = customer.id AND management_staff.type_staff = :typeStaff AND management_staff.staff_id = :staffId",
          {
            typeStaff: ETypeStaff.CODE_OPENING_STAFF,
            staffId: staff.id,
          }
        );

        bookingsQuery.addGroupBy("management_staff.id");
      }
    }

    if (!isHandedFilter) {
      bookingsQuery.andWhere(
        "(booking.is_handle IS NULL OR booking.status NOT IN (:...draftStatus))",
        {
          draftStatus: [
            BookingStatus.NOT_YET_HANDED_OVER,
            BookingStatus.CANCEL,
          ],
        }
      );
    }

    if (status && !isHandedFilter) {
      switch (status) {
        case BookingStatus.NOT_DELIVERED_YET:
          bookingsQuery.andWhere(
            "booking.status = :status AND pu_deliveries.status > :puDeliveryStatus AND tracking.tag != :trackingStatus",
            {
              status: BookingStatus.DONE,
              puDeliveryStatus: EStatusDelivery.pickup_acf,
              trackingStatus: EStatusDeliveryAcftership.Delivered,
            }
          );
          break;

        case BookingStatus.DELIVERED:
          bookingsQuery.andWhere("tracking.tag = :status", {
            status: EStatusDeliveryAcftership.Delivered,
          });
          break;

        case BookingStatus.DONE:
          bookingsQuery.andWhere(
            "booking.status = :status AND pu_deliveries.status = :puDeliveryStatus AND tracking.tag != :trackingStatus",
            {
              status: BookingStatus.DONE,
              puDeliveryStatus: EStatusDelivery.pickup_acf,
              trackingStatus: EStatusDeliveryAcftership.Delivered,
            }
          );
          break;

        case BookingStatus.CANCEL:
          bookingsQuery.andWhere(
            "is_handle IS NULL AND booking.status = :status",
            {
              status,
            }
          );
          break;

        default:
          bookingsQuery.andWhere("booking.status = :status", {
            status,
          });
          break;
      }
    }

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .map((term) => `${term}:*`)
        .join(" & ");
      const searchLike = `%${search}%`;

      bookingsQuery.andWhere(
        `(
      to_tsvector('simple', booking.booking_code) @@ to_tsquery('simple', :searchTerms)
      OR booking.booking_code ILIKE :searchLike
      OR to_tsvector('simple', COALESCE(booking.partner_bill_code, '')) @@ to_tsquery('simple', :searchTerms)
      OR to_tsvector('simple', COALESCE(booking.partner_bill_code_domestic, '')) @@ to_tsquery('simple', :searchTerms)
      OR to_tsvector('simple', COALESCE(customer.customer_code, '')) @@ to_tsquery('simple', :searchTerms)
      OR to_tsvector('simple', COALESCE(customer.full_name, '')) @@ to_tsquery('simple', :searchTerms)
      OR to_tsvector('simple', COALESCE(booking.receiver_name, '')) @@ to_tsquery('simple', :searchTerms)
      OR to_tsvector('simple', COALESCE(booking.receiver_contact_person, '')) @@ to_tsquery('simple', :searchTerms)
      OR to_tsvector('simple', 
          COALESCE(booking.receiver_contact_person, '') || ' ' || 
          COALESCE(booking.receiver_name, '')
      ) @@ to_tsquery('simple', :searchTerms)
      OR to_tsvector('simple', 
          COALESCE(booking.sender_contact_person, '') || ' ' || 
          COALESCE(booking.sender_name_en, '')
      ) @@ to_tsquery('simple', :searchTerms)
    )`,
        {
          searchTerms,
          searchLike,
        }
      );
    }

    // partner service
    if (serviceBookingId) {
      if (EPartnerServiceKey.NO_PARTNER_SERVICE_YET === serviceBookingId) {
        bookingsQuery.andWhere("booking.partner_service IS NULL", {
          serviceBookingId,
        });
      } else {
        bookingsQuery.andWhere("booking.partner_service = :serviceBookingId", {
          serviceBookingId,
        });
      }
    }
    if (type) {
      bookingsQuery.andWhere("booking.type = :type", { type });
    }
    if (createBookingFrom) {
      bookingsQuery.andWhere(
        "CAST(booking.created_at AS DATE) >= :createBookingFrom",
        {
          createBookingFrom,
        }
      );
    }
    if (createBookingTo) {
      bookingsQuery.andWhere(
        "CAST(booking.created_at AS DATE) <= :createBookingTo",
        {
          createBookingTo,
        }
      );
    }
    if (isHandle && !isHandedFilter) {
      bookingsQuery.andWhere("booking.is_handle = :isHandle", {
        isHandle,
      });
    }

    if (isHandedFilter) {
      bookingsQuery.andWhere(
        `booking.is_handle = true AND booking.status = 'CANCEL'`
      );
    }

    bookingsQuery
      .addOrderBy(`booking.is_handle`, "ASC")
      .addOrderBy("booking.created_at", "DESC");

    bookingsQuery
      .addGroupBy("booking.id")
      .addGroupBy("services.id")
      .addGroupBy("partner_service.id")
      .addGroupBy("partner_service_domestic.id")
      .addGroupBy("customer.id")
      .addGroupBy("tracking.id")
      .addGroupBy("pu_deliveries.id");

    const result = await CommonPaginationRaw(getBookingDto, bookingsQuery);
    result.data = result.data.map((item: any) => {
      // map receiver country
      const receiverCountry = removeAccents(item.receiver_country ?? "");
      const countryCode =
        countryNameToCode[receiverCountry.toUpperCase()] ?? receiverCountry;
      item.receiver_country = countryCode;

      // map booking status
      item.booking_status = mappingBookingStatus(item.booking_status, {
        trackingTag: item?.tracking_tag,
        puDeliveryStatus: item?.pu_deliveries_status,
      });

      return item;
    });

    return result;
  }

  async getNetWeightAndVolumeWeight(bookingId: string) {
    const bookingsQuery = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.serviceBooking",
        "services",
        "services",
        "services.id = booking.service_booking_id"
      )
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "booking_detail",
        "booking.id = booking_detail.booking_id"
      )
      .select([
        "CAST(SUM(booking_detail.weight) as decimal(10,2)) as weight",
        "CAST(SUM(booking_detail.bulky_weight) as decimal(10,2)) as bulky_weight",
      ])
      .where("booking.id = :id", {
        id: bookingId,
      });

    return bookingsQuery.getRawOne();
  }

  async myBooking(payload: IJwtPayload, getBookingDto: GetBookingDto) {
    const customer = await this.customerRepository.getCustomerByUserID(
      payload.id
    );
    const query = this.bookingRepository.getMyBookingQuery(
      customer,
      getBookingDto
    );

    query
      .select([
        "customer.customer_code",
        "booking.id",
        "booking.booking_code",
        "booking.partner_bill_code",
        "booking.status",
        "booking.estimate_date",
        "booking.type",
        "services.name",
        "partner_service.name",
        "booking.note",
        "booking.created_at",
        "CAST(SUM(booking_detail.weight * booking_detail.quantity) as float) as weight",
        "CAST(SUM(booking_detail.bulky_weight * booking_detail.quantity) as float) as bulky_weight",
        `CONCAT(booking.receiver_contact_person, ' (' ,booking.receiver_name, ')') as receiver_name`,
        "booking.receiver_country",
        "booking.receiver_address",
        "booking.receiver_phone_number",
        `CONCAT(booking.sender_contact_person, ' (' ,booking.sender_name_en, ')') as sender_name`,
        "booking.is_invoice as is_invoice",
        "booking.customs_declaration_number as customs_declaration_number",
        'trackings."subtagMessage" as tracking_status',
        "trackings.shipment_delivery_date as shipment_delivery_date",
        "trackings.latest_message as latest_delivery_message",
        "trackings.tag as tracking_tag",
        "pu_deliveries.status as pu_deliveries_status",
        "booking.reference_code as reference_code",
      ])
      .groupBy("booking.id")
      .addGroupBy("services.id")
      .addGroupBy("customer.id")
      .addGroupBy("partner_service.id")
      .addGroupBy("trackings.id")
      .addGroupBy("pu_deliveries.id");

    const result = await CommonPaginationRaw(getBookingDto, query);
    result.data = result.data.map((item: any) => {
      item.booking_status = mappingBookingStatus(item.booking_status, {
        trackingTag: item?.tracking_tag,
        puDeliveryStatus: item?.pu_deliveries_status,
      });

      return item;
    });

    return result;
  }

  async myBookingHome(payload: IJwtPayload) {
    const customer = await this.customerRepository.getCustomerByUserID(
      payload.id
    );

    const bookingsQuery = this.bookingRepository
      .createQueryBuilder("booking")
      .innerJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .leftJoinAndMapOne(
        "booking.serviceBooking",
        "services",
        "services",
        "services.id = booking.service_booking_id"
      )
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "booking_detail",
        "booking.id = booking_detail.booking_id"
      )
      .select([
        "booking.id",
        "booking.booking_code",
        "booking.partner_bill_code",
        "booking.status",
        "booking.estimate_date",
        "booking.type",
        "services.name",
        "booking.note",
        "booking.created_at",
        "CAST(SUM(booking_detail.weight * booking_detail.quantity) as float) as weight",
        "CAST(SUM(booking_detail.bulky_weight * booking_detail.quantity) as float) as bulky_weight",
        "booking.receiver_name",
        "booking.receiver_contact_person",
        "booking.receiver_country",
        "booking.receiver_province",
        "booking.receiver_phone_number",
        "booking.receiver_address",
        "booking.receiver_postal_code",
        "booking.sender_name_en",
        "booking.sender_contact_person",
        "booking.sender_phone_number",
        "booking.sender_postal_code",
        "booking.sender_province",
        "booking.sender_country",
      ]);

    bookingsQuery
      .where("booking.customer_id = :customerId", {
        customerId: customer.id,
      })
      .andWhere("booking.parent_booking_manifest_id IS NULL")
      .andWhere("booking.parent_booking IS NULL")
      .addOrderBy(`booking.created_at`, "DESC")
      .limit(5);

    bookingsQuery.groupBy("booking.id").addGroupBy("services.id");

    const [bookingNotYetHandedOver, bookingHandedOver] = await Promise.all([
      bookingsQuery
        .andWhere("booking.status = :status", {
          status: BookingStatus.NOT_YET_HANDED_OVER,
        })
        .getRawMany(),
      bookingsQuery
        .andWhere("booking.status = :status", {
          status: BookingStatus.HANDED_OVER,
        })
        .getRawMany(),
    ]);

    return { bookingNotYetHandedOver, bookingHandedOver };
  }

  async findOne(id: string, payload?: IJwtPayload): Promise<IGetBooking> {
    const bookingQuery = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoin("customers", "customer", "booking.customer_id = customer.id")
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "bd",
        "booking.id = bd.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.invoice",
        "invoice",
        "invoice",
        "invoice.booking_id = booking.id"
      )
      .leftJoinAndMapMany(
        "invoice.invoiceDetail",
        "invoice_detail",
        "idt",
        "invoice.id = idt.invoice_id"
      )
      .where("booking.id = :id", { id })
      .andWhere("booking.parent_booking IS NULL");

    if (payload) {
      const customer = await this.customerRepository.getCustomerByUserID(
        payload.id
      );

      bookingQuery.andWhere("booking.customer_id = :customerId", {
        customerId: customer.id,
      });
    }

    const booking: IBooking = await bookingQuery.getOne();

    if (!booking) throw new NotFoundException(CommonError.BOOKING_NOT_FOUND);

    return {
      booking: {
        ...booking,
        invoice: undefined,
      },
      invoice: booking.invoice,
    };
  }

  async changeStatusBooking(
    id: string,
    changeStatusBookingDto: ChangeStatusBookingDto
  ) {
    const { status } = changeStatusBookingDto;

    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) throw new NotFoundException();

    booking.status = status;
    await booking.save();

    return booking;
  }

  async PUChangeStatusBooking(
    id: string,
    changeStatusBookingDto: ChangeStatusBookingDto
  ) {
    const { status } = changeStatusBookingDto;

    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (booking.status === BookingStatus.DONE) {
      throw new BadRequestException(CommonError.CAN_NOT_CHANGE_STATUS_BOOKING);
    }

    booking.status = status;
    await booking.save();

    return booking;
  }

  async update(
    id: string,
    updateBookingInvoiceDto: UpdateBookingInvoiceDto,
    info: IHistoryInfo
  ) {
    const updateBookingDto = updateBookingInvoiceDto.booking;
    const updateInvoiceDto = updateBookingInvoiceDto?.invoice;

    let booking = await this.bookingRepository.findOne({ where: { id } });
    const oldBooking = booking;
    Object.assign(booking, updateBookingDto);

    await this.validateBookingDetails(updateBookingDto.bookingDetail);

    // mapping address
    booking.senderAddressEn = `${booking.senderAddressEn1 || ""} ${
      booking.senderAddressEn2 || ""
    } ${booking.senderAddressEn3 || ""}`;

    booking.receiverAddress = `${booking.receiverAddress1 || ""} ${
      booking.receiverAddress2 || ""
    } ${booking.receiverAddress3 || ""}`;

    booking.senderNameVi = booking.senderNameEn;
    booking.senderAddressVi = booking.senderAddressEn;

    let estimateGetBooking = dayjs(updateBookingDto.estimatedDate)
      .tz("asia/ho_chi_minh")
      .format("YYYY-MM-DD");
    estimateGetBooking += `T${updateBookingDto.estimateHour}:00+07:00`;
    booking.estimatedDate = new Date(estimateGetBooking);

    booking.senderAddressEn2 = booking.senderAddressEn2 || "";
    booking.senderAddressEn3 = booking.senderAddressEn3 || "";
    booking.receiverAddress2 = booking.receiverAddress2 || "";
    booking.receiverAddress3 = booking.receiverAddress3 || "";

    booking = this.removeAccentsBookingInfor(booking);
    const newBoooking = await this.bookingRepository.save(booking);

    const oldBookingDetails = await this.bookingDetailRepository.find({
      where: { bookingId: id },
    });
    await this.bookingDetailRepository.delete({ bookingId: id });
    const bookingDetails = updateBookingDto?.bookingDetail;
    if (bookingDetails && bookingDetails.length) {
      bookingDetails.forEach(async (bookingDetail) => {
        bookingDetail.bookingId = newBoooking.id;
        bookingDetail.bulkyWeight =
          await this.serviceService.calculateBulkyWeight({
            serviceId: booking.serviceBookingId,
            longs: bookingDetail.longs,
            height: bookingDetail.height,
            width: bookingDetail.width,
          });
        await this.bookingDetailRepository.save(bookingDetail);
      });
    }

    if (updateBookingDto?.isInvoice && updateInvoiceDto) {
      updateInvoiceDto.bookingId = newBoooking.id;
      await this.invoiceService.update(
        updateInvoiceDto?.id,
        updateInvoiceDto,
        info
      );
    }

    const newBookingDetails = await this.bookingDetailRepository.find({
      where: { bookingId: id },
    });

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.ManifestYamato,
      action: HistoryAction.Edit,
      oldItem: oldBooking,
      newItem: newBoooking,
      recordId: id,
      targetTable: TargetTable.Bookings,
    });

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.ManifestYamato,
      action: HistoryAction.Edit,
      oldItem: oldBookingDetails,
      newItem: newBookingDetails,
      recordId: id,
      targetTable: TargetTable.BookingDetail,
    });

    return newBoooking;
  }

  async updateMyBooking(
    id: string,
    updateBookingInvoiceDto: UpdateBookingInvoiceDto,
    payload: IJwtPayload
  ) {
    const updateBookingDto = updateBookingInvoiceDto.booking;
    const updateInvoiceDto = updateBookingInvoiceDto?.invoice;

    let booking = await this.getActiveBooking(id, payload);
    Object.assign(booking, updateBookingDto);

    await this.validateBookingDetails(updateBookingDto.bookingDetail);

    // mapping address
    booking.senderAddressEn = `${booking.senderAddressEn1 || ""} ${
      booking.senderAddressEn2 || ""
    } ${booking.senderAddressEn3 || ""}`;

    booking.receiverAddress = `${booking.receiverAddress1 || ""} ${
      booking.receiverAddress2 || ""
    } ${booking.receiverAddress3 || ""}`;

    booking.senderNameVi = booking.senderNameEn;
    booking.senderAddressVi = booking.senderAddressEn;

    let estimateGetBooking = dayjs(updateBookingDto.estimatedDate)
      .tz("asia/ho_chi_minh")
      .format("YYYY-MM-DD");
    estimateGetBooking += `T${updateBookingDto.estimateHour}:00+07:00`;
    booking.estimatedDate = new Date(estimateGetBooking);
    if (new Date() > booking.estimatedDate) {
      throw new BadRequestException(CommonError.BAD_ESTIMATE_DATE);
    }

    booking = this.removeAccentsBookingInfor(booking);
    booking.receiverAddress2 = updateBookingDto.receiverAddress2 ?? "";
    booking.receiverAddress3 = updateBookingDto.receiverAddress3 ?? "";
    delete booking.partnerBillCode;
    delete booking.partnerService;
    if (!updateInvoiceDto) {
      booking.isInvoice = false;
    }

    const newBoooking = await this.bookingRepository.save(booking);

    await this.bookingDetailRepository.delete({ bookingId: id });
    const bookingDetails = updateBookingDto?.bookingDetail;
    if (bookingDetails && bookingDetails.length) {
      bookingDetails.forEach(async (bookingDetail) => {
        bookingDetail.bookingId = newBoooking.id;
        bookingDetail.bulkyWeight =
          await this.serviceService.calculateBulkyWeight({
            serviceId: booking.serviceBookingId,
            longs: bookingDetail.longs,
            height: bookingDetail.height,
            width: bookingDetail.width,
          });
        await this.bookingDetailRepository.save(bookingDetail);
      });
    }

    if (updateBookingDto?.isInvoice && updateInvoiceDto) {
      updateInvoiceDto.bookingId = newBoooking.id;
      await this.invoiceService.update(updateInvoiceDto?.id, updateInvoiceDto);
    }

    return newBoooking;
  }

  async removeBookingDetail(id: string, payload: IJwtPayload) {
    const bookingDetail = await this.getActiveBookingDetail(id, payload);

    return await bookingDetail.remove();
  }

  async updatePartnerBillCode(
    id: string,
    updatePartnerBillCodeDto: UpdatePartnerBillCodeDto
  ) {
    const [booking, partnerBillCodeExists] = await Promise.all([
      this.bookingRepository.findOne({
        where: {
          id,
        },
      }),
      this.bookingRepository.findOneBy({
        partnerService: updatePartnerBillCodeDto.partnerService,
        partnerBillCode: updatePartnerBillCodeDto.partnerBillCode,
      }),
    ]);

    if (!booking) {
      throw new NotFoundException(CommonError.BOOKING_NOT_FOUND);
    }

    if (
      partnerBillCodeExists &&
      partnerBillCodeExists.id !== booking.id &&
      partnerBillCodeExists.status !== BookingStatus.CANCEL
    ) {
      throw new BadRequestException(
        CommonError.PARTNER_BILL_CODE_ALREADY_EXISTS
      );
    }

    let isHandle = booking.isHandle;
    if (
      booking.partnerBillCode !==
        updatePartnerBillCodeDto.partnerBillCode.trim() ||
      booking.partnerService !== updatePartnerBillCodeDto.partnerService
    ) {
      if (!(booking.isHandle && booking.status === BookingStatus.CANCEL)) {
        isHandle = false;
      }
    }

    return this.bookingRepository.update(id, {
      ...updatePartnerBillCodeDto,
      isHandle: isHandle,
    });
  }

  async findOneById(id: string, payload?: IJwtPayload): Promise<IBooking> {
    let customerID;
    if (payload) {
      const customer = await this.customerRepository.getCustomerByUserID(
        payload.id
      );
      customerID = customer.id;
    }

    return this.bookingRepository.findOneByBookingID(id, customerID);
  }

  async generateBill(createBillDto: CreateBillDto, payload?: IJwtPayload) {
    const { bookingId, formatTime } = createBillDto;
    const booking = await this.findOneById(bookingId, payload);
    const deliveryCondition = await this.deliveryConditionsService.findOne(
      booking.deliveryConditionId
    );

    const result = await this.generateBillService.generateBill(
      booking,
      deliveryCondition
    );
    return {
      buffer: result,
      filename: `${booking.bookingCode} - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format(formatTime || "YYYY/MM/DD HH:mm")} - ${
        booking?.customer?.customerCode
      }.pdf`,
    };
  }

  async generateBillV2(createBillDto: CreateBillDto, payload: IJwtPayload) {
    const { bookingId } = createBillDto;
    const booking = await this.findOneById(bookingId, payload);
    const deliveryCondition = await this.deliveryConditionsService.findOne(
      booking.deliveryConditionId
    );
    return this.generateBillService.generateHtmlBill(
      booking,
      deliveryCondition
    );
  }

  async generateBillInvoice(
    createBillDto: CreateBillDto,
    payload?: IJwtPayload
  ) {
    const { bookingId, formatTime } = createBillDto;
    const booking = await this.findOneById(bookingId, payload);

    if (!booking.isInvoice) {
      throw new BadRequestException(CommonError.BOOKING_NOT_HAVE_INVOICE);
    }

    const [deliveryCondition, currencyUnit] = await Promise.all([
      this.deliveryConditionsService.findOne(
        booking.invoice?.deliveryConditionId || booking.deliveryConditionId
      ),
      this.currencyUnitService.findOne(booking.invoice.currencyId),
    ]);

    const result = await this.generateBillService.generateBillInvoice(
      booking,
      deliveryCondition,
      currencyUnit
    );

    return {
      buffer: result,
      filename: `INVOICE - ${booking.bookingCode} - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format(formatTime || "YYYY/MM/DD HH:mm")} - ${
        booking?.customer?.customerCode
      }.pdf`,
    };
  }

  async generatePartnerBillInvoice(
    createBillDto: CreateBillDto,
    options: IOptionGenerateBill,
    payload?: IJwtPayload
  ) {
    const { bookingId, formatTime } = createBillDto;
    const [booking, netAndVolumneWeight] = await Promise.all([
      this.findOneById(bookingId, payload),
      this.getNetWeightAndVolumeWeight(bookingId),
    ]);
    if (!booking.partnerBillCode) {
      throw new BadRequestException(CommonError.BOOKING_NOT_HAVE_PARTNER_BILL);
    }

    // Manifest
    if (options.isGenerateManifest && booking.partnerInvoiceManifest) {
      return {
        buffer: Buffer.from(booking.partnerInvoiceManifest, "base64"),
        filename: `INVOICE ${booking.bookingCode}-${
          booking.partnerBillCode
        } - ${dayjs()
          .tz("asia/ho_chi_minh")
          .format(formatTime || "YYYY/MM/DD HH:mm")} - ${
          booking?.customer?.customerCode
        }.pdf`,
      };
    }

    if (!booking.invoice) {
      throw new BadRequestException(CommonError.BOOKING_NOT_HAVE_INVOICE);
    }
    const [deliveryCondition, currencyUnit] = await Promise.all([
      this.deliveryConditionsService.findOne(booking.deliveryConditionId),
      this.currencyUnitService.findOne(booking.invoice.currencyId),
    ]);
    const result = await this.generateBillService.generatePartnerBillInvoice(
      booking,
      netAndVolumneWeight,
      deliveryCondition,
      currencyUnit,
      options
    );

    return {
      buffer: result,
      filename: `INVOICE ${booking.bookingCode}-${
        booking.partnerBillCode
      } - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format(formatTime || "YYYY/MM/DD HH:mm")} - ${
        booking?.customer?.customerCode
      }.pdf`,
    };
  }

  async getListSplitBill(parentBookingId: string): Promise<IBooking[]> {
    const query = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "bd",
        "booking.id = bd.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .leftJoinAndMapOne(
        "booking.service",
        "services",
        "service",
        "booking.partner_service = service.id"
      )
      .where("booking.parent_booking_manifest_id = :bookingId", {
        bookingId: parentBookingId,
      });

    return query.getMany();
  }

  async generateSplitBills(
    createBillDto: CreateBillDto,
    payload?: IJwtPayload
  ) {
    const { bookingId } = createBillDto;
    const parentBooking = await this.findOneById(bookingId, payload);

    if (!parentBooking.isSplitedBookingManifest) {
      throw new BadRequestException(CommonError.BOOKING_NOT_HAVE_SPLIT_BILL);
    }
    const [deliveryCondition, bookings] = await Promise.all([
      this.deliveryConditionsService.findOne(parentBooking.deliveryConditionId),
      this.getListSplitBill(parentBooking.id),
    ]);

    if (!bookings.length) {
      throw new BadRequestException(CommonError.BOOKING_NOT_HAVE_SPLIT_BILL);
    }
    const result = await this.generateBillService.generateListSplitBooking(
      bookings,
      deliveryCondition
    );

    return {
      buffer: result,
      filename: `Tách bill - ${parentBooking.bookingCode} - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format("YYYY/MM/DD HH:mm")} - ${
        parentBooking?.customer?.customerCode
      }.pdf`,
    };
  }

  async generatePartnerBill(
    createBillDto: CreateBillDto,
    options: IOptionGenerateBill,
    payload?: IJwtPayload
  ) {
    const { bookingId, formatTime } = createBillDto;
    const booking = await this.findOneById(bookingId, payload);

    if (!booking.partnerBillCode) {
      throw new BadRequestException(CommonError.BOOKING_NOT_HAVE_PARTNER_BILL);
    }

    const deliveryCondition = await this.deliveryConditionsService.findOne(
      booking.deliveryConditionId
    );
    const result = await this.generateBillService.generatePartnerBill(
      booking,
      deliveryCondition,
      options
    );

    return {
      buffer: result,
      filename: `${booking.bookingCode} - ${booking.partnerBillCode} - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format(formatTime || "YYYY/MM/DD HH:mm")} - ${
        booking?.customer?.customerCode
      }.pdf`,
    };
  }

  async generateReferenceBill(
    createBillDto: CreateBillDto,
    payload?: IJwtPayload
  ) {
    const { bookingId, formatTime } = createBillDto;
    const booking = await this.findOneById(bookingId, payload);

    if (!booking.referenceCode) {
      throw new BadRequestException(CommonError.BOOKING_NOT_HAVE_PARTNER_BILL);
    }
    booking.partnerBillCode = booking.referenceCode;

    const kCargoService = await this.serviceService.findOne({
      where: {
        key: EPartnerServiceKey.K_CARGO,
      },
    });
    if (!kCargoService) {
      throw new BadRequestException(CommonError.PARTNER_BILL_NOT_YET_CONFIG);
    }
    booking.service = kCargoService;

    const deliveryCondition = await this.deliveryConditionsService.findOne(
      booking.deliveryConditionId
    );
    const result = await this.generateBillService.generatePartnerBill(
      booking,
      deliveryCondition,
      {}
    );

    return {
      buffer: result,
      filename: `${booking.bookingCode} - ${booking.partnerBillCode} - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format(formatTime || "YYYY/MM/DD HH:mm")} - ${
        booking?.customer?.customerCode
      }.pdf`,
    };
  }

  async generatePackageSmallBill(
    bookings: [IBooking],
    deliveryCondition: IDeliveryConditions
  ) {
    const result = [];
    for (let i = 0; i < bookings.length; i++) {
      const dataGenerateBill = await this.generateBillService.generateBill(
        bookings[i],
        deliveryCondition
      );
      result.push(dataGenerateBill);
    }

    return result;
  }

  async generateSmallBill(createBillDto: CreateBillDto, payload?: IJwtPayload) {
    const { bookingId } = createBillDto;
    const parentBooking = await this.findOneById(bookingId, payload);

    if (!parentBooking.isCreatedSmallBooking) {
      const sumWeight = parentBooking.bookingDetail
        .reduce((partialSum, a) => partialSum + Number(a.weight), 0)
        .toFixed(2);

      if (Number(sumWeight) % 1 > 0) {
        await this.createSmallBooking(
          bookingId,
          {
            quantity: Math.round((Number(sumWeight) + 1) / 3),
            weight: 3,
          },
          payload
        );
      } else {
        await this.createSmallBooking(
          bookingId,
          {
            quantity: Math.round(Number(sumWeight) / 3),
            weight: 3,
          },
          payload
        );
      }
    }
    const [deliveryCondition, listSmallBooking] = await Promise.all([
      this.deliveryConditionsService.findOne(parentBooking.deliveryConditionId),
      this.getListSmallBookingId(parentBooking.bookingCode, payload),
    ]);

    const result = await this.generateBillService.generateListSmallBill(
      listSmallBooking,
      deliveryCondition
    );
    return {
      buffer: result,
      filename: `SMALL BILL - ${parentBooking.bookingCode} - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format("YYYY/MM/DD HH:mm")} - ${
        parentBooking?.customer?.customerCode
      }.pdf`,
    };
  }

  async checkMapCustomer(bookingCode: string, customerCode: string) {
    const checkExist = await this.bookingRepository
      .createQueryBuilder("booking")
      .innerJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .where(
        "booking.booking_code = :bookingCode AND customer.customer_code = :customerCode",
        {
          bookingCode,
          customerCode,
        }
      )
      .getOne();

    if (!checkExist)
      throw new HttpException(
        "Invalid booking code or customer code",
        HttpStatus.NOT_FOUND
      );

    return checkExist;
  }

  async getListSmallBookingId(
    bookingCode: string,
    payload?: IJwtPayload
  ): Promise<[IBooking]> {
    const bookingQuery = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "bd",
        "booking.id = bd.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .where("booking.parent_booking = :bookingCode", { bookingCode });

    if (payload) {
      const customer = await this.customerRepository.getCustomerByUserID(
        payload.id
      );

      bookingQuery.andWhere("booking.customer_id = :customerId", {
        customerId: customer.id,
      });
    }
    const bookings = await bookingQuery.getMany();

    return bookings as any;
  }

  async createSmallBooking(
    id: string,
    createSmallBillDto: CreateSmallBillDto,
    payload?: IJwtPayload
  ) {
    const { quantity, weight = 2 } = createSmallBillDto;
    if (quantity <= 0) {
      throw new BadRequestException("Can not create small bill.");
    }
    const [bookingInfo, virtualDeliveryAddress] = await Promise.all([
      this.findOne(id, payload),
      this.virtualDeliveryAddressService.getVirtualAddressMakeSmallBill(
        quantity - 1,
        weight
      ),
    ]);
    const booking = bookingInfo.booking;
    const listBookingDetail = booking.bookingDetail;

    if (booking.isCreatedSmallBooking) {
      throw new HttpException(
        CommonError.BOOKING_CREATED_SMALL_BOOKING,
        HttpStatus.CONFLICT
      );
    }

    const listSmallBooking = [];
    const firstBill = this.bookingRepository.create({
      ...booking,
      id: undefined,
      bookingCode: undefined,
      parentBooking: booking.bookingCode,
      status: BookingStatus.DONE,
    });
    listSmallBooking.push(firstBill);

    for (const virtualAddress of virtualDeliveryAddress) {
      listSmallBooking.push(
        this.bookingRepository.create({
          ...booking,
          id: undefined,
          bookingCode: undefined,
          status: BookingStatus.DONE,
          parentBooking: booking.bookingCode,
          receiverAddress: virtualAddress.address,
          receiverContactPerson: virtualAddress.name,
          receiverCountry: virtualAddress.country,
          receiverDepartment: null,
          receiverPhoneNumber: virtualAddress.phoneNumber,
          receiverPostalCode: virtualAddress.postalCode,
          receiverProvince: virtualAddress.province,
          receiverName: virtualAddress.name,
        })
      );
    }

    booking.isCreatedSmallBooking = true;
    const [resultSmallBooking] = await Promise.all([
      this.bookingRepository.save(listSmallBooking),
      this.bookingRepository.save(booking),
    ]);

    if (listBookingDetail) {
      const listSmallBookingDetail = [];
      for (const bookingDetail of listBookingDetail) {
        for (let i = 0; i < resultSmallBooking.length; i++) {
          const bookingDetailForm = this.bookingDetailRepository.create({
            ...bookingDetail,
            id: undefined,
            bookingId: resultSmallBooking[i].id,
            weight: Number(bookingDetail.weight) / quantity,
            bulkyWeight: Number(bookingDetail.bulkyWeight) / quantity,
            height: Number(bookingDetail.height) / quantity,
            width: Number(bookingDetail.width) / quantity,
            longs: Number(bookingDetail.longs) / quantity,
            createdAt: undefined,
            updatedAt: undefined,
          });
          listSmallBookingDetail.push(bookingDetailForm);
        }
      }
      await this.bookingDetailRepository.save(listSmallBookingDetail);
    }

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async sendMailCancelBooking(booking: IBooking) {
    const receiverCountry = countries.find(
      (country) => country.key === booking?.receiverCountry
    );
    const sumWeight = booking.bookingDetail
      .reduce((partialSum, a) => partialSum + Number(a.weight), 0)
      .toFixed(2);
    const sumWeightCharge = booking.bookingDetail
      .reduce((partialSum, a) => partialSum + Number(a.bulkyWeight), 0)
      .toFixed(2);
    let mappingDimensions = [];
    mappingDimensions = booking.bookingDetail.map(
      (bd) => `${bd.longs}x${bd.width}x${bd.height}`
    );
    mappingDimensions = [...new Set(mappingDimensions)].map((ele) => {
      return `${ele} (${mappingDimensions.reduce(
        (count, a) => (a === ele ? count + 1 : count),
        0
      )})`;
    });

    // Email sending commented out - AWS SES removed
    // const params = {
    //   from: awsConfig.emailSend,
    //   to: awsConfig.emailReceiveHandleBooking
    //     .split(",")
    //     .concat(booking?.customer?.email.split(",")),
    //   subject: `[HUỶ] - ${
    //     nodeEnvConfig === "develop" ? "[Booking-MH-DEVELOP]" : "[Booking-MH]"
    //   } ${booking.senderNameVi} gửi hàng đi ${
    //     receiverCountry?.value || booking?.receiverCountry
    //   } - ${booking.bookingCode}`,
    //   text: `
    //   Mã khách hàng: ${booking.customer.customerCode}
    //   Tên khách hàng: ${booking?.senderNameEn || ""}
    //   Địa chỉ: ${booking?.senderAddressEn || ""} - ${
    //     booking?.senderTown || ""
    //   } - ${booking.senderProvince || ""} - ${convertSymbolToCountryName(
    //     booking.senderCountry
    //   )}
    //   Thời gian yêu cầu lấy hàng: ${dayjs(booking?.estimatedDate)
    //     .tz("asia/ho_chi_minh")
    //     .format("DD/MM/YYYY HH:mm")}
    //
    //   Dịch vụ: ${booking?.service?.name || ""}
    //   Số kiện: ${booking.bookingDetail.length}
    //   Trọng lượng thực: ${sumWeight || 0} kgs
    //   Kích thước hàng hóa (cm): ${mappingDimensions.join(", ")}
    //   Trọng lượng quy đổi: ${sumWeightCharge || 0} kgs
    //   Loại hàng: ${
    //     booking.type === BookingType.COMMODITY ? "Hàng hóa" : "Chứng từ"
    //   }
    //
    //   Người gửi: ${booking.senderContactPerson || ""}
    //   Số điện thoại: ${booking.senderPhoneNumber || ""}
    //
    //   Consignee: ${booking.receiverName || ""}
    //   Tên người nhận: ${booking.receiverContactPerson || ""}
    //   Điện thoại: ${booking.receiverPhoneNumber || ""}
    //   Nơi đến: ${receiverCountry?.value || booking?.receiverCountry}
    //   Địa chỉ: ${booking.receiverAddress || ""}
    //   Ghi chú: ${booking.note || ""}
    //
    //   Lý do hủy: ${booking.reasonCancelBooking}
    //   `,
    // };
    // return sendRawMessageToEmail(params);
  }

  async sendMailHandleOverBooking(
    booking: IBooking,
    timeRequiredPU: Date,
    files: {
      content: any;
      filename: string;
    }[]
  ) {
    const staffs = await this.managementStaffRepository.getManagementStaffs({
      customerID: booking.customer.id,
    });
    const staffEmails = staffs.map(
      (v) => v.staff.emailCompany || v.staff.email
    );

    const receiverCountry = countries.find(
      (country) => country.key === booking?.receiverCountry
    );
    const sumWeight = booking.bookingDetail
      .reduce((partialSum, a) => partialSum + Number(a.weight * a.quantity), 0)
      .toFixed(2);
    const sumWeightCharge = booking.bookingDetail
      .reduce(
        (partialSum, a) => partialSum + Number(a.bulkyWeight * a.quantity),
        0
      )
      .toFixed(2);
    let mappingDimensions = [];
    const valueAndQuantityDimensions = [];
    let totalPackage = 0;

    mappingDimensions = booking.bookingDetail.map((bd) => {
      valueAndQuantityDimensions.push({
        value: `${bd.longs}x${bd.width}x${bd.height}`,
        quantity: bd.quantity,
      });

      // calc total package
      totalPackage += bd.quantity;

      return `${bd.longs}x${bd.width}x${bd.height}`;
    });
    mappingDimensions = [...new Set(mappingDimensions)].map((ele) => {
      return `${ele} (${valueAndQuantityDimensions.reduce(
        (count, a) => (a.value === ele ? count + a.quantity : count),
        0
      )})`;
    });

    // Email sending commented out - AWS SES removed
    // const params = {
    //   from: awsConfig.emailSend,
    //   to: awsConfig.emailReceiveHandleBooking
    //     .split(",")
    //     .concat(booking?.customer?.email.split(","))
    //     .concat(staffEmails),

    //   subject: `${
    //     nodeEnvConfig === "develop" ? "[Booking-MH-DEVELOP]" : "[Booking-MH]"
    //   } ${booking.senderNameVi} gửi hàng đi ${
    //     receiverCountry?.value || booking?.receiverCountry
    //   } - ${booking.bookingCode}`,
    //   text: `
    //   Mã khách hàng: ${booking.customer.customerCode}
    //   Tên khách hàng: ${booking?.senderNameEn || ""}
    //   Địa chỉ: ${booking?.senderAddressEn || ""}, ${
    //     booking.senderTown || ""
    //   }, ${booking.senderProvince || ""}, ${convertSymbolToCountryName(
    //     booking.senderCountry
    //   )}
    //   Thời gian yêu cầu lấy hàng: ${dayjs(timeRequiredPU)
    //     .tz("asia/ho_chi_minh")
    //     .format("DD/MM/YYYY HH:mm")}
    //   ĐỊA CHỈ GỬI KHÁC: ${booking.senderOtherShippingAddress || ""}
    //   Ghi Chú: ${booking.senderNote || ""}
    //
    //   Dịch vụ: ${booking?.service?.name || ""}
    //   Số kiện: ${totalPackage}
    //   Trọng lượng thực: ${sumWeight || 0} kgs
    //   Kích thước hàng hóa (cm): ${mappingDimensions.join(", ")}
    //   Trọng lượng quy đổi: ${sumWeightCharge || 0} kgs
    //   Loại hàng: ${
    //     booking.type === BookingType.COMMODITY ? "Hàng hóa" : "Chứng từ"
    //   }
    //
    //   Người gửi: ${booking.senderContactPerson || ""}
    //   Số điện thoại: ${booking.senderPhoneNumber || ""}
    //
    //   Consignee: ${booking.receiverName || ""}
    //   Tên người nhận: ${booking.receiverContactPerson || ""}
    //   Điện thoại: ${booking.receiverPhoneNumber || ""}
    //   Nơi đến: ${receiverCountry?.value || booking?.receiverCountry}
    //   Địa chỉ: ${booking.receiverAddress || ""}, ${
    //     booking.receiverTown || ""
    //   }, ${booking.receiverProvince || ""}, ${convertSymbolToCountryName(
    //     booking.receiverCountry
    //   )}

    //   Ghi chú (THÔNG TIN CHUNG): ${booking.note || ""}
    //   `,
    //   attachments: files,
    // };

    // return sendRawMessageToEmail(params);
  }

  async sendMailConfirmBooking(
    payload: IJwtPayload,
    booking: IBooking,
    timeRequiredPU: Date
  ) {
    const buffer = await this.generateBill({ bookingId: booking.id }, payload);
    const files = [
      {
        content: buffer.buffer,
        filename: `Booking-${booking.bookingCode}.pdf`,
      },
    ];
    if (booking.isInvoice) {
      const invoiceFile = await this.generateBillInvoice({
        bookingId: booking.id,
      });

      files.push({
        content: invoiceFile.buffer,
        filename: invoiceFile.filename,
      });
    }
    await this.sendMailHandleOverBooking(booking, timeRequiredPU, files);

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async linkBookingsDataToAftership(bookingIds: string[]) {
    const bookings = await this.getBookingsForTracking(bookingIds);

    if (this.mutexAftership.isLocked()) {
      console.log("========== linkBookingsDataToAftership =============");

      await this.mutexAftership.waitForUnlock();

      console.log("========== END linkBookingsDataToAftership =============");
    }

    // Lock
    const release = await this.mutexAftership.acquire();

    try {
      for (let i = 0; i < bookings.length; i++) {
        try {
          const bookingIdsUpdateStatus = [bookings[i].id];
          if (
            bookings[i].partnerBillCode &&
            bookings[i].OPartnerService.key !== "OTHER" &&
            bookings[i].OPartnerService.codeAftership
          ) {
            try {
              await this.trackingsService.createTrackingAftership(bookings[i]);
            } catch (err) {
              console.error(
                "linkBookingsDataToAftership",
                `bookingId: ${bookings[i].id} - ${bookings[i].bookingCode} - ${err?.message}`
              );
            }

            // check children bills
            if (bookings[i].isSplitedBookingManifest) {
              const bookingManifest = await this.getChildsBookingManifest(
                bookings[i].id
              );
              for (let j = 0; j < bookingManifest.length; j++) {
                try {
                  await this.trackingsService.createTrackingAftership(
                    bookingManifest[j]
                  );
                } catch (err) {
                  console.error(
                    "linkBookingsDataToAftership",
                    `bookingId: ${bookingManifest[j].id} - ${bookingManifest[j].bookingCode} - ${err?.message}`
                  );
                }

                bookingIdsUpdateStatus.push(bookingManifest[j].id);
              }
            }
          }

          await this.bookingRepository.update(
            {
              id: In(bookingIdsUpdateStatus),
            },
            {
              isHandle: true,
            }
          );
        } catch (error) {
          console.error("linkBookingsDataToAftership", error);
        }
      }
    } finally {
      // Unlock
      release();
    }

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async isHandledBooking(id: string) {
    const booking = await this.getBookingForTracking(id);
    const servicePartner = await this.serviceService.findOne({
      where: {
        id: booking.partnerService,
      },
    });
    if (
      booking.partnerBillCode &&
      servicePartner.key !== "OTHER" &&
      servicePartner.codeAftership
    ) {
      // Check locked
      if (this.mutexSplitBooking.isLocked()) {
        console.log("=============== START DEBUG =================");
        console.log(`waiting unlock handle booking: ${booking.bookingCode} `);

        await this.mutexSplitBooking.waitForUnlock();

        console.log("================ END DEBUG ===================");
      }

      // Lock
      const release = await this.mutexSplitBooking.acquire();

      try {
        await this.trackingsService.createTrackingAftership(booking);
        // check children bills
        if (booking.isSplitedBookingManifest) {
          const bookings = await this.getChildsBookingManifest(booking.id);
          for (let i = 0; i < bookings.length; i++) {
            await this.trackingsService.createTrackingAftership(bookings[i]);
          }
        }
      } finally {
        // Unlock
        release();
      }
    }

    booking.isHandle = true;
    await booking.save();
    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async getBookingFromToDate(
    getBookingDto: GetBookingDto,
    payload?: IJwtPayload
  ): Promise<IBooking[]> {
    let { createBookingFrom, createBookingTo, status, isHandedFilter } = getBookingDto;
    const { startDate, endDate } = getStartDateAndEndDate(
      createBookingFrom,
      createBookingTo
    );

    const query = this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.service",
        "services",
        "services",
        "booking.partner_service = services.id"
      )
      .leftJoinAndMapOne(
        "booking.service_booking",
        "services",
        "service_booking",
        "booking.service_booking_id = service_booking.id"
      )
      .leftJoinAndMapOne(
        "booking.partner_service_domestic",
        "services",
        "partner_service_domestic",
        "booking.partner_service_domestic = partner_service_domestic.id"
      )
      .leftJoinAndMapOne(
        "booking.type_of_payment",
        "type_of_payment",
        "type_of_payment",
        "booking.type_of_payment_id = type_of_payment.id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "bd",
        "booking.id = bd.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.deliveryCondition",
        "delivery_conditions",
        "delivery_conditions",
        "delivery_conditions.id = booking.delivery_condition_id"
      )
      .leftJoinAndMapOne(
        "booking.invoice",
        "invoice",
        "invoice",
        "invoice.booking_id = booking.id"
      )
      .leftJoinAndMapOne(
        "invoice.currencyUnit",
        "currency_unit",
        "currency_unit",
        "currency_unit.id = invoice.currency_id"
      )
      .leftJoinAndMapMany(
        "invoice.invoice_detail",
        "invoice_detail",
        "invoice_detail",
        "invoice_detail.invoice_id = invoice.id"
      )
      .leftJoinAndMapOne(
        "booking.tracking",
        "trackings",
        "tracking",
        "booking.id = tracking.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.pu_deliveries",
        "pu_deliveries",
        "pu_deliveries",
        "pu_deliveries.booking_id = booking.id"
      )


    if (!isHandedFilter) {
      query.andWhere(
        "(booking.is_handle IS NULL OR booking.status NOT IN (:...draftStatus))",
        {
          draftStatus: [
            BookingStatus.NOT_YET_HANDED_OVER,
            BookingStatus.CANCEL,
          ],
        }
      );
    }

    if (status && !isHandedFilter) {
      switch (status) {
        case BookingStatus.NOT_DELIVERED_YET:
          query.andWhere(
            "booking.status = :status AND pu_deliveries.status > :puDeliveryStatus AND tracking.tag != :trackingStatus",
            {
              status: BookingStatus.DONE,
              puDeliveryStatus: EStatusDelivery.pickup_acf,
              trackingStatus: EStatusDeliveryAcftership.Delivered,
            }
          );
          break;

        case BookingStatus.DELIVERED:
          query.andWhere("tracking.tag = :status", {
            status: EStatusDeliveryAcftership.Delivered,
          });
          break;

        case BookingStatus.DONE:
          query.andWhere(
            "booking.status = :status AND pu_deliveries.status = :puDeliveryStatus AND tracking.tag != :trackingStatus",
            {
              status: BookingStatus.DONE,
              puDeliveryStatus: EStatusDelivery.pickup_acf,
              trackingStatus: EStatusDeliveryAcftership.Delivered,
            }
          );
          break;

        case BookingStatus.CANCEL:
          query.andWhere(
            "is_handle IS NULL AND booking.status = :status",
            {
              status,
            }
          );
          break;

        default:
          query.andWhere("booking.status = :status", {
            status,
          });
          break;
      }
    }

    if (
      payload?.typeUser === ETypeUser.STAFF &&
      !payload.permissions.includes(
        EPermissionActionKey.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF
      )
    ) {
      const staff = await this.staffsService.getStaffByPayload(payload);
      const managementStaff = await this.managementStaffRepository.find({
        where: {
          staffId: staff.id,
          typeStaff: ETypeStaff.CODE_OPENING_STAFF,
        },
      });
      if (managementStaff.length > 0) {
        query.innerJoinAndMapOne(
          "customer.business_staff_management",
          "management_staff",
          "management_staff",
          "management_staff.customer_id = customer.id AND management_staff.type_staff = :typeStaff AND management_staff.staff_id = :staffId",
          {
            typeStaff: ETypeStaff.CODE_OPENING_STAFF,
            staffId: staff.id,
          }
        );
      }
    }

    if (startDate)
      query.andWhere("CAST(booking.created_at AS DATE) >= :startDate", {
        startDate,
      });

    if (endDate)
      query.andWhere("CAST(booking.created_at AS DATE) <= :endDate", {
        endDate,
      });

    return query.getMany();
  }

  async generateExcelBooking(
    getBookingDto: GetBookingDto,
    payload?: IJwtPayload
  ) {
    const data = [[...ColumnsNameExportBookingAdmin]];
    const bookings = await this.getBookingFromToDate(getBookingDto, payload);
    console.log(bookings.length)
    for (let i = 0; i < bookings.length; i++) {
      const checkpointPED =
        await this.trackingsService.get3CheckpointPEDbyBookingId(
          bookings[i].id
        );
      const result = mappingDataGenerateExcel(bookings[i], checkpointPED);
      data.push([i + 1, ...result]);
    }
    const buffer = xlsx.build([{ name: "Booking", data: data, options: null }]);

    return {
      buffer,
      filename: `Export booking - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format("YYYY/MM/DD HH:mm")}.xlsx`,
    };
  }

  async generateExcelMyBooking(
    getBookingDto: GetBookingDto,
    payload: IJwtPayload
  ) {
    const data = [columnsNameExportBookingClient[0]];
    const customer = await this.customerRepository.getCustomerByUserID(
      payload.id
    );
    const query = this.bookingRepository.getMyBookingQuery(
      customer,
      getBookingDto
    );

    // query
    //   .groupBy('booking.id')
    //   .addGroupBy('services.id')
    //   .addGroupBy('customer.id')
    //   .addGroupBy('booking_detail.id')
    //   .addGroupBy('partner_service.id')
    //   .addGroupBy('trackings.id')
    //   .addGroupBy('pu_deliveries.id');

    const bookings = (await query.getMany()) as IBooking[];

    for (let i = 0; i < bookings.length; i++) {
      const result = mappingDataBookingClientGenerateExcel(bookings[i]);
      data.push([i + 1, ...result]);
    }

    const buffer = xlsx.build([{ name: "Booking", data: data, options: null }]);

    return {
      buffer,
      filename: `Export booking - ${dayjs()
        .tz("asia/ho_chi_minh")
        .format("YYYY/MM/DD HH:mm")}.xlsx`,
    };
  }

  async getBookingForTracking(bookingId: string) {
    const booking = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.OPartnerService",
        "services",
        "services",
        "services.id = booking.partnerService"
      )
      .where("booking.id = :bookingId", {
        bookingId,
      })
      .getOne();

    if (!booking) {
      throw new NotFoundException(CommonError.BOOKING_NOT_FOUND);
    }

    return booking;
  }

  async getBookingsForTracking(bookingIds: string[]): Promise<IBooking[]> {
    if (!bookingIds.length) return [];

    return this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.OPartnerService",
        "services",
        "services",
        "services.id = booking.partnerService"
      )
      .where("booking.id IN (:...bookingIds)", {
        bookingIds: bookingIds,
      })
      .getMany();
  }

  async getChildsBookingManifest(bookingId: string) {
    const booking = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.OPartnerService",
        "services",
        "services",
        "services.id = booking.partnerService"
      )
      .where("booking.parent_booking_manifest_id = :bookingId", {
        bookingId,
      })
      .getMany();

    return booking;
  }

  async getBookingAssigneePickUp(
    getAssigneeBookingPickUpDto: GetAssigneeBookingPickUpDto
  ) {
    const { search } = getAssigneeBookingPickUpDto;

    const query = this.bookingRepository
      .createQueryBuilder("booking")
      .innerJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "booking_detail",
        "booking.id = booking_detail.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.staff",
        "staffs",
        "staff",
        "booking.pickup_id = staff.id"
      )
      .select([
        "booking.id as id",
        "booking.booking_code as booking_code",
        "booking.estimate_date as estimate_date",
        "booking.type as type",
        "booking.note as note",
        "CAST(booking.created_at AS DATE) as created_at",
        "customer.customer_code as customer_code",
        "CAST(SUM(booking_detail.weight * booking_detail.quantity) as float) as weight",
        "CAST(SUM(booking_detail.bulky_weight * booking_detail.quantity) as float) as bulky_weight",
        "SUM(booking_detail.quantity) as quantity",
        "booking.sender_phone_number as sender_phone_number",
        "booking.sender_address_vi as sender_address",
        `CONCAT(booking.sender_contact_person, ' (' ,booking.sender_name_en, ')') as sender_name`,
        "staff.staff_code as staff_code",
        "staff.full_name as staff_name",
        "booking.sender_other_shipping_address as sender_other_shipping_address",
      ])
      .andWhere("booking.parent_booking IS NULL")
      .andWhere("booking.status = :status", {
        status: BookingStatus.HANDED_OVER,
      });

    if (search) {
      query.andWhere("booking.booking_code LIKE :search", {
        search: `%${search}%`,
      });
    }

    query
      .groupBy("booking.id")
      .addGroupBy("customer.id")
      .addGroupBy("staff.id");
    query.orderBy("booking.created_at", "DESC");

    return CommonPaginationRaw(getAssigneeBookingPickUpDto, query);
  }

  async getMyAssigneeBooking(
    myAssigneeBookingDto: MyAssigneeBookingDto,
    payload: IJwtPayload
  ) {
    const { search } = myAssigneeBookingDto;

    const query = this.bookingRepository
      .createQueryBuilder("booking")
      .innerJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "booking_detail",
        "booking.id = booking_detail.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.staff",
        "staffs",
        "staff",
        "booking.pickup_id = staff.id"
      )
      .select([
        "booking.id as id",
        "booking.booking_code as booking_code",
        "booking.estimate_date as estimate_date",
        "booking.type as type",
        "booking.note as note",
        "CAST(booking.created_at AS DATE) as created_at",
        "customer.customer_code as customer_code",
        "CAST(SUM(booking_detail.weight * booking_detail.quantity) as float) as weight",
        "CAST(SUM(booking_detail.bulky_weight * booking_detail.quantity) as float) as bulky_weight",
        "SUM(booking_detail.quantity) as quantity",
        "booking.sender_phone_number as sender_phone_number",
        "booking.sender_address_vi as sender_address",
        `CONCAT(booking.sender_contact_person, ' (' ,booking.sender_name_en, ')') as sender_name`,
        "staff.staff_code as staff_code",
        "staff.full_name as staff_name",
        "booking.sender_other_shipping_address as sender_other_shipping_address",
      ])
      .andWhere("booking.status = :status", {
        status: BookingStatus.HANDED_OVER,
      });

    if (
      !payload.permissions.includes(
        EPermissionActionKey.GET_ALL_LIST_MY_ASSIGNEE_BOOKING
      )
    ) {
      const staff = await this.staffsService.getStaffByPayload(payload);
      query.andWhere("booking.pickup_id = :pickupId", {
        pickupId: staff.id,
      });
    }

    if (search) {
      query.andWhere("booking.booking_code LIKE :search", {
        search: `%${search}%`,
      });
    }

    query
      .groupBy("booking.id")
      .addGroupBy("customer.id")
      .addGroupBy("staff.id");
    query.orderBy("booking.created_at", "DESC");

    return CommonPaginationRaw(myAssigneeBookingDto, query);
  }

  async assigneeBookingForPickup(
    assigneeBookingForPickupDto: AssigneeBookingForPickupDto
  ) {
    const { bookingIds, staffId } = assigneeBookingForPickupDto;
    const staff = await this.staffsService.findOne(staffId);

    await this.bookingRepository.update(
      {
        id: In(bookingIds),
        status: BookingStatus.HANDED_OVER,
      },
      {
        pickupId: staff.id,
      }
    );
    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async pickupConfirmListBookingReceipt(
    confirmReceiptGoodsDto: ConfirmReceiptGoodsDto,
    payload: IJwtPayload
  ) {
    const { bookingIds } = confirmReceiptGoodsDto;
    const resp = await Promise.all(
      bookingIds.map((bookingId) =>
        this.confirmReceiptOfGoods(bookingId, payload)
      )
    );

    return commonResponse(CommonResponse.SUCCESS, {
      updated: resp.length,
    });
  }

  async confirmReceiptOfGoods(bookingId: string, payload: IJwtPayload) {
    const booking = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapMany(
        "booking.bookingDetail",
        "booking_detail",
        "booking_detail",
        "booking.id = booking_detail.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.pu",
        "pu_deliveries",
        "pu_deliveries",
        "booking.id = pu_deliveries.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .where("booking.id = :bookingId", {
        bookingId: bookingId,
      })
      .select([
        "booking.id as booking_id",
        "booking.type as booking_type",
        "booking.booking_code as booking_code",
        "booking.service_booking_id as booking_service_booking",
        "booking.partner_service as booking_partner_service",
        "booking.customs_declaration_number as booking_customs_declaration_number",
        "booking.note as booking_note",
        `array_agg(booking_detail.shipping_item_en) as content_detail`,
        "CAST(SUM(booking_detail.weight * booking_detail.quantity) as float) as weight",
        "CAST(SUM(booking_detail.bulky_weight * booking_detail.quantity) as float) as bulky_weight",
        "CAST(SUM(booking_detail.quantity) AS integer) as quantity",
        "customer.customer_code as customer_code",
        "customer.full_name as customer_full_name",
        "pu_deliveries.id as pu_delivery_id",
        "pu_deliveries.status as status",
      ])
      .andWhere("booking.status NOT IN (:...draftStatus)", {
        draftStatus: [BookingStatus.NOT_YET_HANDED_OVER, BookingStatus.CANCEL],
      })
      .andWhere("booking.parent_booking IS NULL")
      .andWhere("pu_deliveries.id IS NULL")
      .groupBy("booking.id")
      .addGroupBy("customer.id")
      .addGroupBy("pu_deliveries.id")
      .getRawOne();

    if (!booking) {
      throw new NotFoundException(CommonError.BOOKING_NOT_FOUND);
    }

    const bookingDetails = await this.bookingDetailRepository
      .createQueryBuilder("bd")
      .select([
        "quantity",
        "CAST(weight as float)",
        "CAST(bulky_weight as float)",
        "CAST(height as float)",
        "CAST(width as float)",
        "CAST(longs as float)",
      ])
      .where("bd.booking_id = :bookingId", {
        bookingId: booking.booking_id,
      })
      .getRawMany();

    const puDeliveriesDetailDto: CreatePUDeliveriesDetailDto[] =
      bookingDetails.map((bd) => ({
        bulkyWeight: bd.bulky_weight,
        height: bd.height,
        longs: bd.longs,
        quantity: bd.quantity,
        weight: bd.weight,
        width: bd.width,
      }));
    const puDeliveryDto: CreatePuDeliveriesDto = {
      bookingId: bookingId,
      contentDetail: booking?.content_detail.join(","),
      customsDeclarationNumber: booking?.booking_customs_declaration_number,
      quantity: booking?.quantity,
      serviceBookingId: booking?.booking_service_booking,
      type: booking?.booking_type,
      note: booking?.booking_note,
      details: puDeliveriesDetailDto,
    };

    return this.puDeliveriesService.pickUpParcel(puDeliveryDto, payload);
  }

  async splitBooking(bookingId: string, splitBookingsDto: SplitBookingDto) {
    const { childrenBookings } = splitBookingsDto;

    // Check locked
    if (this.mutexSplitBooking.isLocked()) {
      console.log("=============== START DEBUG =================");
      console.log(`waiting unlock split booking: ${bookingId} `);

      await this.mutexSplitBooking.waitForUnlock();

      console.log("================ END DEBUG ===================");
    }

    // Lock
    const release = await this.mutexSplitBooking.acquire();

    try {
      const { booking } = await this.findOne(bookingId);
      if (!booking.bookingDetail?.length) {
        throw new BadRequestException(CommonError.BOOKING_WITHOUT_PACKAGES);
      }
      if (booking.isSplitedBookingManifest) {
        throw new BadRequestException(CommonError.BOOKING_SPLITED);
      }

      // Create booking
      const newBookingModels = childrenBookings.map(
        (item): IBooking => ({
          ...booking,
          partnerBillCode: item.partnerBookingBillCode,
          bookingCode: undefined,
          id: undefined,
          parentBookingManifestId: booking.id,
        })
      );

      const [newBookings] = await Promise.all([
        this.bookingRepository.save(newBookingModels),
        this.bookingRepository.update(
          {
            id: booking.id,
          },
          {
            isSplitedBookingManifest: true,
          }
        ),
      ]);

      // Create booking detail
      const newBookingDetailModels = childrenBookings.map(
        (item, i): IBookingDetail => ({
          ...booking.bookingDetail[0],
          id: undefined,
          bookingId: newBookings[i].id,
          quantity: item.quantity,
          weight: item.weight,
          bulkyWeight: item.bulkyWeight,
          height: item.height,
          width: item.width,
          longs: item.longs,
        })
      );
      await this.bookingDetailRepository.save(newBookingDetailModels);

      return newBookings;
    } finally {
      // Unlock
      release();
    }
  }
}
