import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import dayjs from "dayjs";
import {
  BookingStatus,
  BookingType,
  CommonError,
  CommonResponse,
  EStatusDelivery,
  EStatusDeliveryAcftership,
  EStatusDeliveryMessage,
  ETypePuDeliveryDetail,
  ETypeStaff,
} from "src/common/constants/common.constants";
import { CommonPaginationRaw } from "src/common/helper/common-pagination";
import { commonResponse } from "src/common/helper/common-response";
import { BookingRepository } from "src/modules/bookings/repositories/booking.repository";
import { CheckpointRepository } from "src/modules/checkpoints/repositories/checkpoint.repository";
import { EVENT_CONST } from "src/modules/events/event.const";
import {
  HistoryAction,
  HistoryType,
  TargetTable,
} from "src/modules/history/history.const";
import { ServiceBookingRepository } from "src/modules/services-booking/repositories/service.repository";
import { CreateCheckPointAdminDto } from "src/modules/trackings/dto/create-checkpoint-admin.dto";
import { TrackingsEntity } from "src/modules/trackings/entities/trackings.entity";
import { TrackingRepository } from "src/modules/trackings/repositories/tracking.repository";
import { In, IsNull, Repository } from "typeorm";
import IJwtPayload, { IHistoryInfo } from "../../auth/payloads/jwt-payload";
import { BookingService } from "../../bookings/services/bookings.service";
import { StaffsService } from "../../staffs/staffs.service";
import { CreatePUDeliveriesDetailDto } from "../dto/create-pu-deliveries-detail.dto";
import { CreatePuDeliveriesDto } from "../dto/create-pu-deliveries.dto";
import { PUDeliveryDto } from "../dto/find-all.dto";
import { GetBookingOpDto } from "../dto/get-booking-op.dto";
import { SplitBookingDto } from "../dto/split-booking.dto";
import { UpdateDeliveryOPDto } from "../dto/update-delivery-op.dto";
import { UpdatePuDeliveriesDto } from "../dto/update-pu-deliveries.dto";
import { PuDeliveriesDetailEntity } from "../entities/pu-deliveries-detail.entity";
import { IPuDeliveriesDetail } from "../interface/pu-deliveries-detail.interface";
import { IPuDeliveries } from "../interface/pu-deliveries.interface";
import { PUDeliveryRepository } from "../repositories/pu-deliveries.repository";
import { EPermissionActionKey } from "src/common/guards/permission";

@Injectable()
export class PuDeliveriesService {
  constructor(
    private readonly puDeliveriesRepository: PUDeliveryRepository,

    @InjectRepository(PuDeliveriesDetailEntity)
    private readonly puDlvDetailRepository: Repository<PuDeliveriesDetailEntity>,
    private readonly serviceBookingRepository: ServiceBookingRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly trackingRepository: TrackingRepository,
    private readonly checkpointRepository: CheckpointRepository,

    private readonly staffService: StaffsService,

    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,

    private readonly eventEmitter: EventEmitter2
  ) {}

  async findOneByBookingId(bookingId: string) {
    return this.puDeliveriesRepository.findOne({
      where: {
        bookingId: bookingId,
      },
    });
  }

  async getListDeliveriesConnectBill(
    connectBillId: string,
    typePuDeliveryDetail?: ETypePuDeliveryDetail
  ): Promise<any[]> {
    const query = this.puDeliveriesRepository
      .createQueryBuilder("pud")
      .leftJoinAndMapOne(
        "pud.booking",
        "booking",
        "booking",
        "pud.booking_id = booking.id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customers",
        "customer",
        "booking.customer_id = customer.id"
      )
      .leftJoinAndMapOne(
        "booking.partner_service_domestic",
        "services",
        "partner_service_domestic",
        "booking.partner_service_domestic = partner_service_domestic.id"
      )
      .leftJoinAndMapOne(
        "booking.overseas_partner_services",
        "services",
        "overseas_partner_services",
        "booking.partner_service_foreign = overseas_partner_services.id"
      )
      .leftJoinAndMapOne(
        "booking.type_of_payment",
        "type_of_payment",
        "type_of_payment",
        "type_of_payment.id = booking.type_of_payment_id"
      )
      .leftJoinAndMapOne(
        "booking.delivery_conditions",
        "delivery_conditions",
        "delivery_conditions",
        "delivery_conditions.id = booking.delivery_condition_id"
      )
      .leftJoinAndMapOne(
        "pud.service",
        "services",
        "service",
        "pud.service_booking_id = service.id"
      )
      .leftJoinAndMapOne(
        "pud.service_partner",
        "services",
        "service_partner",
        "pud.booking_partner_service = service_partner.id"
      )
      .leftJoinAndMapOne(
        "pud.require_partner_service",
        "services",
        "require_partner_service",
        "pud.require_partner_service_id = require_partner_service.id"
      )
      .leftJoinAndMapMany(
        "pud.pud_detail",
        "pu_deliveries_detail",
        "pud_detail",
        `pud.id = pud_detail.pu_delivery_id AND pud_detail.type = '${
          typePuDeliveryDetail ?? ETypePuDeliveryDetail.PICKUP
        }'`
      )
      .leftJoinAndMapOne(
        "pud.parent_pud",
        "pu_deliveries",
        "parent_pud",
        "parent_pud.id = pud.parent_booking_manifest_id"
      )
      .leftJoinAndMapOne(
        "parent_pud.parent_booking",
        "booking",
        "parent_booking",
        "parent_booking.id = parent_pud.booking_id"
      )
      .select([
        "pud.id as pud_id",
        "pud.parent_booking_manifest_id as pud_parent_booking_manifest_id", // This col for split bill manifest
        "pud.connect_bill_id",
        "pud.type as pud_type",
        "service_partner.name as service_partner_name",
        "require_partner_service.name as require_partner_service_name",
        "booking.booking_code as booking_code",
        "booking.id as booking_id",
        "booking.partner_bill_code as partner_bill_code",
        "booking.partner_bill_code_domestic as partner_bill_code_domestic",
        "partner_service_domestic.name as partner_service_domestic_name",
        "customer.customer_code as customer_code",
        "pud.note as pud_note",
        "CAST(SUM(pud_detail.weight * pud_detail.quantity) as float) as weight",
        "CAST(SUM(pud_detail.bulky_weight * pud_detail.quantity) as float) as bulky_weight",
        "SUM(pud_detail.quantity) as total_box",
        `array_agg(pud_detail.height) as pud_detail_height`,
        `array_agg(pud_detail.width) as pud_detail_width`,
        `array_agg(pud_detail.longs) as pud_detail_longs`,
        `array_agg(pud_detail.weight) as pud_detail_weight`,
        `array_agg(pud_detail.quantity) as pud_detail_quantity`,
        `array_agg(pud_detail.bulky_weight) as pud_detail_bulky_weight`,
        "booking.receiver_name as booking_receiver_name",
        "booking.receiver_contact_person as booking_receiver_contact_person",
        "booking.receiver_phone_number as booking_receiver_phone_number",
        "booking.receiver_address as booking_receiver_address",
        "booking.receiver_town as booking_receiver_town",
        "booking.receiver_province as booking_receiver_province",
        "booking.receiver_country as booking_receiver_country",
        "booking.receiver_postal_code as booking_receiver_postal_code",
        "booking.sender_name_en as booking_sender_name_en",
        "booking.sender_contact_person as booking_sender_contact_person",
        "booking.sender_phone_number as booking_sender_phone_number",
        "booking.sender_address_en as booking_sender_address_en",
        "booking.sender_town as booking_sender_town",
        "booking.sender_province as booking_sender_province",
        "booking.sender_country as booking_sender_country",
        "booking.sender_postal_code as booking_sender_postal_code",
        "pud.content_detail_invoice as pud_content_detail_invoice",
        "type_of_payment.name as type_of_payment",
        "delivery_conditions.name as delivery_conditions",
        "parent_booking.partner_bill_code as parent_partner_bill_code",
        "booking.reference_code as reference_code",
        "booking.value_added_service_1 as value_added_service_1",
        "booking.value_added_service_2 as value_added_service_2",
        "booking.value_added_service_3 as value_added_service_3",
        "booking.dhl as dhl",
        "booking.fedex as fedex",
        "booking.ups as ups",
        "booking.pickup_id as pickup_staff",
        "pud.pu_staff_id as pu_staff",
        "pud.sales_staff_id as sales_staff",
        "pud.checkin_staff_id as checkin_staff",
        "pud.checkout_staff_id as checkout_staff",
        "pud.manifest_staff_id as manifest_staff",
        "booking.manufacture_domestic as manufacture_domestic", // Domestic Supplier
        "booking.partner_bill_code_foreign as partner_bill_code_foreign", // Overseas Partner Postal Code
        "overseas_partner_services.name as overseas_partner_services", // Overseas partner services
        "booking.manufacture_foreign as manufacture_foreign", // Foreign Supplier
      ])
      .where("pud.connect_bill_id = :connectBillId", {
        connectBillId,
      })
      .addGroupBy("pud.id")
      .addGroupBy("booking.id")
      .addGroupBy("service_partner.id")
      .addGroupBy("type_of_payment.id")
      .addGroupBy("delivery_conditions.id")
      .addGroupBy("require_partner_service.id")
      .addGroupBy("partner_service_domestic.id")
      .addGroupBy("overseas_partner_services.id")
      .addGroupBy("customer.id")
      .addGroupBy("parent_booking.id");

    if (typePuDeliveryDetail !== ETypePuDeliveryDetail.OP) {
      query.andWhere("pud.parent_booking_manifest_id IS NULL");
    }

    return query.getRawMany();
  }

  async getBookingConnectPartner(partnerServiceId: string) {
    const query = this.puDeliveriesRepository
      .createQueryBuilder("pud")
      .leftJoinAndMapOne(
        "pud.booking",
        "booking",
        "booking",
        "booking.id = pud.booking_id"
      )
      .leftJoinAndMapOne(
        "pud.service",
        "services",
        "service",
        "pud.service_booking_id = service.id"
      )
      .leftJoinAndMapOne(
        "pud.service_partner",
        "services",
        "service_partner",
        "pud.booking_partner_service = service_partner.id"
      )
      .select([
        "pud.id as delivery_id",
        "booking.booking_code as booking_code",
        "pud.booking_partner_bill_code as booking_partner_bill_code",
        `CONCAT(booking.sender_contact_person, ', ', booking.sender_name_en) as sender`,
        `CONCAT(booking.receiver_contact_person, ', ', booking.receiver_name, ', ', booking.receiver_province, ', ', booking.receiver_country, ', ', booking.receiver_postal_code) as receiver`,
        `CONCAT(service.name, ', ', service_partner.name, ', ', 
          CASE
            WHEN pud.type = '${BookingType.LICENSE}' THEN 'Thư hàng'
            ELSE 'Hàng hóa'
          END
        ) as goods_information`,
      ])
      .where("pud.booking_partner_service = :partnerServiceId", {
        partnerServiceId,
      })
      .andWhere("pud.status = :status", {
        status: EStatusDelivery.op_acf_confirm,
      });

    return query.getRawMany();
  }

  async updateConnectBillId(
    payload: IJwtPayload,
    listPUDeliveriesId: string[],
    connectBillId: string
  ) {
    const staff = await this.staffService.getStaffByPayload(payload);

    return this.puDeliveriesRepository.update(
      {
        id: In(listPUDeliveriesId),
        connectBillId: IsNull(),
        status: EStatusDelivery.op_acf_confirm,
      },
      {
        connectBillId: connectBillId,
        status: EStatusDelivery.pickup_partner,
        manifestStaffId: staff.id,
      }
    );
  }

  async checkDeliveryExists(id: string, payload: IJwtPayload) {
    const filter = {
      id,
      puStaffId: undefined
    }

    if (!payload.permissions.includes(EPermissionActionKey.MANAGE_PICK_UP_ALL)) {
      const staff = await this.staffService.getStaffByPayload(payload);
      filter.puStaffId = staff.id;
    }

    const booking = await this.puDeliveriesRepository.findOne({
      where: filter,
    });

    if (!booking) throw new NotFoundException();

    return booking;
  }

  async changeStatusDelivery(id: string, status: EStatusDelivery) {
    return this.puDeliveriesRepository.update(
      {
        id,
      },
      {
        status: status,
      }
    );
  }

  async pickupConfirmBooking(
    id: string,
    payload: IJwtPayload,
    updatePuDeliveriesDto: UpdatePuDeliveriesDto,
    info: IHistoryInfo
  ) {
    const staff = await this.staffService.getStaffByPayload(payload);
    const booking = await this.checkDeliveryExists(id, payload);
    const itemsDetail = updatePuDeliveriesDto.details;
    delete updatePuDeliveriesDto.details;

    const oldDetail = await this.puDlvDetailRepository.find({
      where: { puDeliveryId: booking.id },
    });
    await this.puDlvDetailRepository.delete({
      puDeliveryId: booking.id,
    });
    booking.status = EStatusDelivery.pickup_acf_confirm;
    const [newBooking, newDetail] = await Promise.all([
      this.puDeliveriesRepository.save(
        {
          ...booking,
          ...updatePuDeliveriesDto,
          checkinStaffId: staff.id,
        },
        {
          listeners: true,
        }
      ),
      this.createPUDeliveryDetail(
        booking.id,
        updatePuDeliveriesDto.serviceBookingId,
        itemsDetail
      ),
    ]);

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Pickup,
      action: HistoryAction.Edit,
      oldItem: booking,
      newItem: newBooking,
      recordId: id,
      targetTable: TargetTable.PuDeliveries,
    });

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Pickup,
      action: HistoryAction.Edit,
      oldItem: oldDetail,
      newItem: newDetail,
      recordId: id,
      targetTable: TargetTable.PuDeliveriesDetail,
    });

    return booking;
  }

  async updateStatusDelivery(
    bookingId: string,
    status: EStatusDeliveryAcftership,
    message: string,
    partnerServiceId?: string,
    partnerBillCode?: string
  ) {
    let tracking = await this.trackingRepository.findOne({
      where: {
        bookingId,
      },
    });
    const oldTracking = tracking;
    const booking = await this.bookingService.findOneById(bookingId);

    if (!tracking) {
      const partnerService = await this.serviceBookingRepository.findOne({
        where: {
          id: partnerServiceId,
        },
      });
      const trackingEntity = new TrackingsEntity();
      trackingEntity.bookingId = bookingId;
      trackingEntity.slug = partnerService?.codeAftership;
      trackingEntity.trackingNumber = partnerBillCode || booking.bookingCode;
      trackingEntity.tag = status;
      trackingEntity.subtagMessage = status;
      trackingEntity.shipmentPickupDate = dayjs()
        .tz("asia/ho_chi_minh")
        .format();
      trackingEntity.shipmentDeliveryDate = dayjs()
        .tz("asia/ho_chi_minh")
        .format();
      trackingEntity.title = booking.bookingCode;

      tracking = await this.trackingRepository.save(trackingEntity);
    }

    const checkpoint: CreateCheckPointAdminDto = {
      checkpointTime: dayjs().tz("asia/ho_chi_minh").format(),
      message: message,
      countryName: "VN",
      tag: status,
      sugtag: status,
      trackingId: tracking.id,
    };
    tracking.tag = status;
    const res = await Promise.all([
      this.checkpointRepository.save({
        ...checkpoint,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      tracking.save(),
    ]);

    return { oldTracking, newTracking: res[1] };
  }

  async forwardOPById(id: string, payload: IJwtPayload) {
    const booking = await this.checkDeliveryExists(id, payload);
    await this.updateStatusDelivery(
      booking.bookingId,
      EStatusDeliveryAcftership.InfoReceived,
      EStatusDeliveryMessage.op_acf
    );
    return this.changeStatusDelivery(booking.id, EStatusDelivery.op_acf);
  }

  async forwardOP(payload: IJwtPayload) {
    const bookings = await this.puDeliveriesRepository.find({
      where: {
        status: EStatusDelivery.pickup_acf_confirm,
      },
    });
    for (let i = 0; i < bookings.length; i++) {
      await this.updateStatusDelivery(
        bookings[i].bookingId,
        EStatusDeliveryAcftership.InfoReceived,
        EStatusDeliveryMessage.op_acf
      );
      this.changeStatusDelivery(bookings[i].id, EStatusDelivery.op_acf);
    }

    return commonResponse(CommonResponse.SUCCESS, {});
  }

  async findAllPickUp(puDeliveryDto: PUDeliveryDto, payload: IJwtPayload) {
    const { search } = puDeliveryDto;

    const query = this.puDeliveriesRepository
      .createQueryBuilder("pud")
      .leftJoinAndMapOne(
        "pud.booking",
        "booking",
        "booking",
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
        "customer.id = booking.customer_id"
      )
      .leftJoinAndMapOne(
        "pud.staff",
        "staffs",
        "staff",
        "staff.id = pud.pu_staff_id"
      )
      .andWhere("pud.status IN (:...statusDelivery)", {
        statusDelivery: [
          EStatusDelivery.pickup_acf,
          // EStatusDelivery.pickup_acf_confirm,
        ],
      })
      .select([
        "pud.id as pu_delivery_id",
        "booking.booking_code as booking_code",
        "booking.partner_bill_code as partner_bill_code",
        "customer.customer_code as customer_code",
        "customer.full_name as customer_full_name",
        "pud.type as pud_type",
        "pud.service_booking_id as service_booking_id",
        `pud.content_detail as content_detail`,
        "CAST(SUM(pu_deliveries_detail.weight * pu_deliveries_detail.quantity) as float) as weight",
        "CAST(SUM(pu_deliveries_detail.bulky_weight * pu_deliveries_detail.quantity) as float) as bulky_weight",
        "SUM(pu_deliveries_detail.quantity) as quantity",
        "pud.note as note",
        "pud.status",
        "staff.staff_code as staff_code",
        "staff.full_name as staff_full_name",
      ])
      .addGroupBy("pud.id")
      .addGroupBy("booking.id")
      .addGroupBy("customer.id")
      .addGroupBy("staff.id")
      .orderBy("pud.createdAt", "DESC");

    if (search) {
      query.andWhere(
        "(booking.booking_code LIKE :search OR booking.partner_bill_code LIKE :search)",
        {
          search: `%${search}%`,
        }
      );
    }

    if (
      !payload.permissions.includes(
        EPermissionActionKey.GET_ALL_LIST_MY_ASSIGNEE_BOOKING
      ) &&
      !payload.permissions.includes(EPermissionActionKey.MANAGE_PICK_UP_ALL)
    ) {
      const staff = await this.staffService.getStaffByPayload(payload);
      query.andWhere("pud.pu_staff_id = :puStaffId", {
        puStaffId: staff.id,
      });
    }

    return CommonPaginationRaw(puDeliveryDto, query);
  }

  async createPUDeliveryDetail(
    puId: string,
    serviceBookingId: string,
    createPuDeliveriesDetailDto: CreatePUDeliveriesDetailDto[],
    typePuDeliveryDetail?: ETypePuDeliveryDetail
  ) {
    const service = await this.bookingService.getServiceBookingById(
      serviceBookingId
    );

    const data = createPuDeliveriesDetailDto.map((puDeliveryDetail) => {
      const bulkyWeight = this.bookingService.calcBulkyWeightByService(
        service,
        puDeliveryDetail.longs,
        puDeliveryDetail.width,
        puDeliveryDetail.height
      );
      return {
        ...puDeliveryDetail,
        puDeliveryId: puId,
        bulkyWeight: bulkyWeight ? bulkyWeight : puDeliveryDetail.bulkyWeight,
        type: typePuDeliveryDetail
          ? typePuDeliveryDetail
          : ETypePuDeliveryDetail.PICKUP,
      };
    });

    return this.puDlvDetailRepository.save(data);
  }

  async pickUpParcel(
    createPuDeliveriesDto: CreatePuDeliveriesDto,
    payload: IJwtPayload
  ) {
    const checkBookingPickedUp = await this.puDeliveriesRepository.findOne({
      where: {
        bookingId: createPuDeliveriesDto.bookingId,
      },
    });
    if (checkBookingPickedUp)
      return commonResponse(CommonResponse.SUCCESS, null);

    const salesStaffId = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoin("customers", "customer", "customer.id = booking.customer_id")
      .leftJoin(
        "management_staff",
        "ms",
        `ms.customer_id = customer.id AND ms.type_staff = '${ETypeStaff.CODE_OPENING_STAFF}'`
      )
      .select(["booking.id as booking_id", "ms.staff_id as sales_staff_id"])
      .where("booking.id = :bookingID", {
        bookingID: createPuDeliveriesDto.bookingId,
      })
      .getRawOne();

    const staff = await this.staffService.getStaffByPayload(payload);
    const pud = await this.puDeliveriesRepository.save({
      ...createPuDeliveriesDto,
      puStaffId: staff.id,
      salesStaffId: salesStaffId?.sales_staff_id,
      status: EStatusDelivery.pickup_acf,
    });
    await Promise.all([
      this.createPUDeliveryDetail(
        pud.id,
        createPuDeliveriesDto.serviceBookingId,
        createPuDeliveriesDto.details
      ),
      this.updateStatusDelivery(
        createPuDeliveriesDto.bookingId,
        EStatusDeliveryAcftership.AvailableForPickup,
        EStatusDeliveryMessage.pickup_acf
      ),
      this.bookingService.updateStatus(
        createPuDeliveriesDto.bookingId,
        BookingStatus.DONE,
        createPuDeliveriesDto.serviceBookingId
      ),
    ]);
    return commonResponse(CommonResponse.SUCCESS, pud);
  }

  async update(id: string, updatePuDeliveriesDto: UpdatePuDeliveriesDto) {
    return this.puDeliveriesRepository.update(
      {
        id,
      },
      updatePuDeliveriesDto
    );
  }

  async findOne(id: string) {
    const query = this.puDeliveriesRepository
      .createQueryBuilder("pud")
      .leftJoinAndMapOne(
        "pud.booking",
        "booking",
        "booking",
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
        "customer.id = booking.customer_id"
      )
      .leftJoinAndMapOne(
        "pud.staff",
        "staffs",
        "staff",
        "staff.id = pud.pu_staff_id"
      )
      .where("pud.id = :id", { id })
      .andWhere("pud.status IN (:...statusDelivery)", {
        statusDelivery: [
          EStatusDelivery.pickup_acf,
          EStatusDelivery.pickup_acf_confirm,
        ],
      })
      .select([
        "pud.id as id",
        "pud.type as type",
        "pud.service_booking_id as service_booking_id",
        "pud.require_partner_service_id as require_partner_service_id",
        `pud.content_detail as content_detail`,
        "pud.customs_declaration_number as customs_declaration_number",
        "pud.note as note",
        "pud.booking_id as booking_id",
        "pud.status as status",
        "booking.booking_code as booking_code",
        "customer.customer_code as customer_code",
        "customer.full_name as customer_full_name",
        "CAST(SUM(pu_deliveries_detail.weight * pu_deliveries_detail.quantity) as float) as weight",
        "CAST(SUM(pu_deliveries_detail.bulky_weight * pu_deliveries_detail.quantity) as float) as bulky_weight",
        "SUM(pu_deliveries_detail.quantity) as quantity",
        "staff.staff_code as staff_code",
        "staff.full_name as staff_full_name",
      ])
      .addGroupBy("pud.id")
      .addGroupBy("booking.id")
      .addGroupBy("customer.id")
      .addGroupBy("staff.id");

    const [pud, details] = await Promise.all([
      query.getRawOne(),
      this.puDlvDetailRepository.find({
        where: {
          puDeliveryId: id,
        },
      }),
    ]);
    if (!pud) {
      throw new NotFoundException();
    }

    return {
      ...pud,
      details,
    };
  }

  async getPuDDetail(puDeliveryId: string) {
    // return this.puDlvDetailRepository.find({
    //   where: {
    //     puDeliveryId: puDeliveryId,
    //   },
    // });
    return this.puDlvDetailRepository
      .createQueryBuilder()
      .select([
        "quantity as quantity",
        "CAST(weight as float) as weight",
        "CAST(bulky_weight as float) as bulky_weight",
        "CAST(height as float) as height",
        "CAST(width as float) as width",
        "CAST(longs as float) as longs",
      ])
      .where("pu_delivery_id = :puDeliveryId", {
        puDeliveryId,
      })
      .andWhere("type = :type", {
        type: ETypePuDeliveryDetail.PICKUP,
      })
      .getRawMany();
  }

  async findOneById(id: string) {
    const result = await this.puDeliveriesRepository.findOne({
      where: {
        id,
      },
    });
    if (!result) throw new NotFoundException();

    return result;
  }

  async getContentDetailInvoice(bookingId: string) {
    const result = await this.bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.invoice",
        "invoice",
        "invoice",
        "invoice.booking_id = booking.id"
      )
      .leftJoinAndMapMany(
        "invoice.invoice_detail",
        "invoice_detail",
        "invoice_detail",
        "invoice.id = invoice_detail.invoice_id"
      )
      .select([
        `array_agg(invoice_detail.goods_name) as content_detail_invoice`,
      ])
      .where("booking.id = :id", {
        id: bookingId,
      })
      .getRawOne();

    return result?.content_detail_invoice?.join(", ") || "";
  }

  async findBookingOP(getBookingOpDto: GetBookingOpDto) {
    const { id, search } = getBookingOpDto;
    if (!id && !search) throw new BadRequestException();

    const query = this.puDeliveriesRepository
      .createQueryBuilder("pud")
      .leftJoinAndMapOne(
        "pud.booking",
        "booking",
        "booking",
        "booking.id = pud.booking_id"
      )
      .leftJoinAndMapOne(
        "pud.parent_pud",
        "pu_deliveries",
        "parent_pud",
        "pud.parent_booking_manifest_id = parent_pud.id"
      )
      .leftJoinAndMapOne(
        "parent_pud.parent_booking",
        "booking",
        "parent_booking",
        "parent_booking.id = parent_pud.booking_id"
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
        "customer.id = booking.customer_id"
      )
      .leftJoinAndMapOne(
        "pud.staff",
        "staffs",
        "staff",
        "staff.id = pud.pu_staff_id"
      )
      .andWhere("pud.status IN (:...statusDelivery)", {
        statusDelivery: [
          EStatusDelivery.op_acf,
          EStatusDelivery.op_acf_confirm,
        ],
      })
      .select([
        "pud.id as id",
        "pud.is_splited_booking as is_splited_booking",
        "pud.type as type",
        "pud.service_booking_id as service_booking_id",
        `pud.content_detail as content_detail`,
        "pud.customs_declaration_number as customs_declaration_number",
        "pud.note as note",
        "pud.booking_id as booking_id",
        "pud.status as status",
        "booking.booking_code as booking_code",
        "booking.partner_bill_code as booking_partner_bill_code",
        "booking.partner_service as booking_partner_service",
        "booking.is_invoice as booking_is_invoice",
        "customer.customer_code as customer_code",
        "customer.full_name as customer_full_name",
        "staff.staff_code as staff_code",
        "staff.full_name as staff_full_name",
        `CONCAT(booking.receiver_name, ', ', booking.receiver_contact_person, ', ', 
        booking.receiver_phone_number, ', ', booking.receiver_address, ', ', booking.receiver_province,
        ', ', booking.receiver_postal_code, ', ', booking.receiver_country ) as information_receiver_address`,
        "parent_booking.booking_code as parent_booking_code",
      ]);

    if (id) query.andWhere("pud.id = :id", { id });
    if (search)
      query.andWhere("booking.booking_code = :search", {
        search,
      });

    query
      .addGroupBy("pud.id")
      .addGroupBy("customer.id")
      .addGroupBy("staff.id")
      .addGroupBy("booking.id")
      .addGroupBy("parent_booking.id");

    const booking = await query.getRawOne();
    if (!booking) {
      return null;
    }

    const details = await this.puDlvDetailRepository.find({
      where: {
        puDeliveryId: booking.id,
      },
    });

    const content_detail_invoice = await this.getContentDetailInvoice(
      booking.booking_id
    );
    const puDeliveriesDetailPU =
      booking.status === EStatusDelivery.op_acf
        ? details
        : details.filter(
            (detail) => detail.type === ETypePuDeliveryDetail.PICKUP
          );

    const puDeliveriesDetailVH =
      booking.status === EStatusDelivery.op_acf_confirm
        ? details.filter((detail) => detail.type === ETypePuDeliveryDetail.OP)
        : details.filter(
            (detail) => detail.type === ETypePuDeliveryDetail.PICKUP
          );

    let weight = 0,
      bulky_weight = 0,
      weight_pu = 0,
      bulky_weight_pu = 0,
      quantity = 0,
      quantity_pu = 0;
    for (let i = 0; i < puDeliveriesDetailPU.length; i++) {
      weight_pu +=
        puDeliveriesDetailPU[i].weight * puDeliveriesDetailPU[i].quantity;
      bulky_weight_pu +=
        puDeliveriesDetailPU[i].bulkyWeight * puDeliveriesDetailPU[i].quantity;
      quantity_pu += puDeliveriesDetailPU[i].quantity;
    }
    for (let i = 0; i < puDeliveriesDetailVH.length; i++) {
      weight +=
        puDeliveriesDetailVH[i].weight * puDeliveriesDetailVH[i].quantity;
      bulky_weight +=
        puDeliveriesDetailVH[i].bulkyWeight * puDeliveriesDetailVH[i].quantity;
      quantity += puDeliveriesDetailVH[i].quantity;
    }

    return {
      ...booking,
      weight,
      bulky_weight,
      weight_pu,
      bulky_weight_pu,
      quantity,
      quantity_pu,
      content_detail_invoice,
      final_weight: Math.max(weight, bulky_weight),
      details: puDeliveriesDetailVH,
    };
  }

  async opConfirmBooking(
    id: string,
    updateDeliveryOPDto: UpdateDeliveryOPDto,
    info: IHistoryInfo,
    payload: IJwtPayload
  ) {
    const {
      customsDeclarationNumber,
      note,
      serviceBookingId,
      type,
      bookingPartnerBillCode,
      bookingPartnerService,
      contentDetailInvoice,
      informationReceiverAddress,
    } = updateDeliveryOPDto;
    const [oldPuDelivery, staff] = await Promise.all([
      this.puDeliveriesRepository.findOne({
        where: { id },
      }),
      this.staffService.getStaffByPayload(payload),
    ]);

    const result = await this.puDeliveriesRepository.update(
      {
        id,
        // status: EStatusDelivery.op_acf,
      },
      {
        customsDeclarationNumber,
        note,
        serviceBookingId,
        type,
        bookingPartnerBillCode,
        bookingPartnerService,
        contentDetailInvoice,
        informationReceiverAddress,
        status: EStatusDelivery.op_acf_confirm,
        checkoutStaffId: staff.id,
      }
    );

    if (!result.affected) {
      throw new BadRequestException("Đơn hàng đã được xử lý");
    }

    const puDelivery = await this.findOneById(id);

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Operate,
      action: HistoryAction.Edit,
      oldItem: oldPuDelivery,
      newItem: puDelivery,
      recordId: puDelivery.bookingId,
      targetTable: TargetTable.PuDeliveries,
    });

    // create pu delivery detail operation
    if (!updateDeliveryOPDto.details) {
      const puDeliveryDetails = await this.puDlvDetailRepository.find({
        where: {
          puDeliveryId: id,
        },
      });
      updateDeliveryOPDto.details = puDeliveryDetails.map(
        (item): CreatePUDeliveriesDetailDto => {
          return {
            bulkyWeight: item.bulkyWeight,
            height: item.height,
            longs: item.longs,
            quantity: item.quantity,
            weight: item.weight,
            width: item.width,
          };
        }
      );
    }

    const oldPuDetail = await this.puDlvDetailRepository.find({
      where: { puDeliveryId: id },
    });

    await this.puDlvDetailRepository.delete({
      puDeliveryId: id,
      type: ETypePuDeliveryDetail.OP,
    });
    const newPuDetail = await this.createPUDeliveryDetail(
      id,
      updateDeliveryOPDto.serviceBookingId,
      updateDeliveryOPDto.details,
      ETypePuDeliveryDetail.OP
    );

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Operate,
      action: HistoryAction.Edit,
      oldItem: oldPuDetail,
      newItem: newPuDetail,
      recordId: puDelivery.bookingId,
      targetTable: TargetTable.PuDeliveriesDetail,
    });

    if (!result) throw new NotFoundException();
    const oldBooking = await this.bookingService.findOneById(
      puDelivery.bookingId
    );

    const [tracking] = await Promise.all([
      this.updateStatusDelivery(
        puDelivery.bookingId,
        EStatusDeliveryAcftership.InfoReceived,
        EStatusDeliveryMessage.op_acf_confirm
      ),
      this.bookingService.updateBookingById(puDelivery.bookingId, {
        partnerBillCode: updateDeliveryOPDto.bookingPartnerBillCode,
        serviceBookingId: updateDeliveryOPDto.serviceBookingId,
        partnerService: updateDeliveryOPDto.bookingPartnerService,
        customsDeclarationNumber: updateDeliveryOPDto.customsDeclarationNumber,
      }),
    ]);

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Operate,
      action: HistoryAction.Edit,
      oldItem: tracking.oldTracking,
      newItem: tracking.newTracking,
      recordId: puDelivery.bookingId,
      targetTable: TargetTable.Trackings,
    });

    const newBooking = await this.bookingService.findOneById(
      puDelivery.bookingId
    );

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Operate,
      action: HistoryAction.Edit,
      oldItem: oldBooking,
      newItem: newBooking,
      recordId: puDelivery.bookingId,
      targetTable: TargetTable.Bookings,
    });

    return result;
  }

  async remove(id: string) {
    return this.puDeliveriesRepository.delete({ id });
  }

  async findAllDelivery(puDeliveryDto: PUDeliveryDto) {
    const { search } = puDeliveryDto;
    const query = this.puDeliveriesRepository
      .createQueryBuilder("pud")
      .leftJoinAndMapOne(
        "pud.booking",
        "booking",
        "booking",
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
        "customer.id = booking.customer_id"
      )
      .leftJoinAndMapOne(
        "pud.staff",
        "staffs",
        "staff",
        "staff.id = pud.pu_staff_id"
      )
      .andWhere("pud.status IN (:...statusDelivery)", {
        statusDelivery: [EStatusDelivery.op_acf],
      })
      .select([
        "pud.id as id",
        "pud.type as type",
        "pud.service_booking_id as service_booking_id",
        `pud.content_detail as content_detail`,
        "pud.customs_declaration_number as customs_declaration_number",
        "pud.note as note",
        "pud.booking_id as booking_id",
        "pud.status as status",
        "booking.booking_code as booking_code",
        "booking.receiver_address as booking_address",
        "customer.customer_code as customer_code",
        "customer.full_name as customer_full_name",
        "CAST(SUM(pu_deliveries_detail.weight * pu_deliveries_detail.quantity) as float) as weight",
        "CAST(SUM(pu_deliveries_detail.bulky_weight * pu_deliveries_detail.quantity) as float) as bulky_weight",
        "SUM(pu_deliveries_detail.quantity) as quantity",
        "staff.staff_code as staff_code",
        "staff.full_name as staff_full_name",
      ])
      .addGroupBy("pud.id")
      .addGroupBy("booking.id")
      .addGroupBy("customer.id")
      .addGroupBy("staff.id");

    if (search) {
      query.andWhere(
        "(booking.booking_code LIKE :search OR booking.partner_bill_code LIKE :search OR pud.booking_partner_bill_code LIKE :search)",
        {
          search: `%${search}%`,
        }
      );
    }

    return CommonPaginationRaw(puDeliveryDto, query);
  }

  async statisticalDeliveryPartnerService() {
    let total = {
      name: "Tổng",
      totalBill: 0,
      totalLicense: 0,
      totalCommodity: 0,
      details: [],
    };
    let result = (await this.serviceBookingRepository
      .createQueryBuilder("service")
      .innerJoin(
        "pu_deliveries",
        "pu_deliveries",
        "service.id = pu_deliveries.booking_partner_service"
      )
      .where("pu_deliveries.status = :status", {
        status: EStatusDelivery.op_acf_confirm,
      })
      .getMany()) as any[];
    for (let i = 0; i < result.length; i++) {
      const data = await this.puDeliveriesRepository
        .createQueryBuilder("pud")
        .leftJoinAndMapOne(
          "pud.booking",
          "booking",
          "booking",
          "booking.id = pud.booking_id"
        )
        .leftJoinAndMapOne(
          "booking.invoice",
          "invoice",
          "invoice",
          "booking.id = invoice.booking_id"
        )
        .leftJoinAndMapMany(
          "pud.pudDetail",
          "pu_deliveries_detail",
          "pu_deliveries_detail",
          `pud.id = pu_deliveries_detail.pu_delivery_id AND pu_deliveries_detail.type = '${ETypePuDeliveryDetail.OP}'`
        )
        .leftJoinAndMapOne(
          "booking.customer",
          "customers",
          "customer",
          "customer.id = booking.customer_id"
        )
        .andWhere("pud.status = :statusDelivery", {
          statusDelivery: EStatusDelivery.op_acf_confirm,
        })
        .andWhere("pud.booking_partner_service = :partnerService", {
          partnerService: result[i].id,
        })
        .select([
          "pud.id as id",
          "pud.type as type",
          "pud.service_booking_id as service_booking_id",
          "pud.booking_partner_service",
          "pud.booking_partner_bill_code as booking_partner_bill_code",
          "pud.informationReceiverAddress as information_receiver_address",
          "booking.booking_code as booking_code",
          "customer.customer_code as customer_code",
          "customer.full_name as customer_full_name",
          "CAST(SUM(pu_deliveries_detail.weight * pu_deliveries_detail.quantity) as float) as weight",
          "CAST(SUM(pu_deliveries_detail.bulky_weight * pu_deliveries_detail.quantity) as float) as bulky_weight",
          "pud.quantity as quantity",
          "invoice.invoice_number as invoice_number",
        ])
        .addGroupBy("pud.id")
        .addGroupBy("booking.id")
        .addGroupBy("customer.id")
        .addGroupBy("invoice.id")
        .getRawMany();

      const totalLicense = data.reduce(
        (sum, a) => (a.type === BookingType.LICENSE ? sum + 1 : sum),
        0
      );
      const totalCommodity = data.reduce(
        (sum, a) => (a.type === BookingType.COMMODITY ? sum + 1 : sum),
        0
      );
      total.totalLicense += totalLicense;
      total.totalCommodity += totalCommodity;
      total.totalBill += data.length;
      total.details.push(...data);

      result[i] = {
        id: result[i].id,
        name: result[i].name,
        totalBill: data.length,
        totalCommodity,
        totalLicense,
        details: data,
      };
    }

    return [...result, total];
  }

  async splitBookingManifest(
    puDeliveryId: string,
    splitBookingsDto: SplitBookingDto
  ) {
    const { childrenBookings } = splitBookingsDto;

    const puDelivery = await this.puDeliveriesRepository.findOne({
      where: {
        id: puDeliveryId,
      },
    });
    if (!puDelivery) {
      throw new NotFoundException(
        CommonError.BOOKING_NOT_HAVE_DELIVERY_INFORMATION
      );
    }
    if (puDelivery.parentBookingManifestId) {
      throw new BadRequestException(CommonError.THIS_BOOKING_CAN_NOT_SPLIT);
    }
    if (puDelivery.isSplitedBooking) {
      throw new BadRequestException(CommonError.BOOKING_SPLITED);
    }

    // DO NOT USING PROMISE ALL THE FUNCTIONS BELOW
    const bookings = await this.bookingService.splitBooking(
      puDelivery.bookingId,
      splitBookingsDto
    );

    // create pu delivery
    const puDeliveryModels = childrenBookings.map(
      (item, index): IPuDeliveries => ({
        ...puDelivery,
        id: undefined,
        parentBookingManifestId: puDelivery.id,
        bookingId: bookings[index].id,
        bookingPartnerBillCode: item.partnerBookingBillCode,
      })
    );

    const [newPuDeliveries] = await Promise.all([
      this.puDeliveriesRepository.save(puDeliveryModels),
      this.puDeliveriesRepository.update(
        {
          id: puDelivery.id,
        },
        {
          isSplitedBooking: true,
        }
      ),
    ]);

    // create pu delivery detail
    const puDeliveryDetailModels = childrenBookings.map(
      (item, index): IPuDeliveriesDetail => ({
        puDeliveryId: newPuDeliveries[index].id,
        weight: item.weight,
        bulkyWeight: item.bulkyWeight,
        height: item.height,
        longs: item.longs,
        width: item.width,
        quantity: item.quantity,
        type: ETypePuDeliveryDetail.PICKUP,
      })
    );
    await this.puDlvDetailRepository.save(puDeliveryDetailModels);

    return commonResponse("Chia đơn hàng thành công", null);
  }
}
