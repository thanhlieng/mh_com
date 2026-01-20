import { ETemplateEmail, GetTemplateEmail } from '@constants/templates/get_template_email';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import axios from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  CommonError,
  CommonResponse,
  EStatusDeliveryAcftership,
  EStatusDeliveryMessage,
  ETypeStaff,
} from 'src/common/constants/common.constants';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { commonResponse } from 'src/common/helper/common-response';
import { sendRawMessageToEmail } from 'src/common/helper/helper';
import { CommonLogger } from 'src/common/logger/common-logger';
import { formatDateString, getDayInDateString, getHourInDateString } from 'src/common/utils/util';
import { acfConfig, aftershipConfig, awsConfig, nodeEnvConfig } from 'src/configs/configs.constants';
import { Between, IsNull, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { IBooking } from '../bookings/interface/bookings.interface';
import { BookingService } from '../bookings/services/bookings.service';
import { CheckpointsService } from '../checkpoints/checkpoints.service';
import {
  AftershipMessageDto,
  AftershipUpdateCheckpointsDto,
} from '../checkpoints/dto/aftership-update-checkpoints.dto';
import { CheckpointsEntity } from '../checkpoints/entities/checkpoints.entity';
import { ICheckpoints } from '../checkpoints/interface/checkpoints.interface';
import { CheckpointRepository } from '../checkpoints/repositories/checkpoint.repository';
import { ICustomer } from '../customers/interface/customers.interface';
import { EAftershipStatusCode } from './constants/status_code';
import { CreateCheckPointAdminDto } from './dto/create-checkpoint-admin.dto';
import { CreateTrackingsDto } from './dto/create-trackings.dto';
import { DataSendDeliveriedDto } from './dto/data-send-deliveried.dto';
import { GetTrackingAdminDto } from './dto/get-tracking-admin.dto';
import { GetTrackingDto } from './dto/get-tracking.dto';
import { UpdateCheckpointAdminDto } from './dto/update-checkpoint-admin.dto';
import { UpdateTrackingsDto } from './dto/update-trackings.dto';
import { ICheckpointPED } from './interface/checkpoint-ped.interface';
import { ICreateTrackingAftership } from './interface/create-tracking-aftership.interface';
import { ITrackings } from './interface/trackings.interface';
import { TrackingRepository } from './repositories/tracking.repository';
import { TrackingsEntity } from './entities/trackings.entity';
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class TrackingsService {
  private readonly logger: CommonLogger = new CommonLogger('TRACKING');
  constructor(
    private readonly checkpointsRepository: CheckpointRepository,
    private readonly trackingsRepository: TrackingRepository,

    @Inject(forwardRef(() => CheckpointsService))
    private readonly checkPointsService: CheckpointsService,

    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
  ) {}

  mappingDataAftership(aftershipMessageDto: AftershipMessageDto): ITrackings {
    const {
      active,
      aftership_estimated_delivery_date,
      android,
      checkpoints,
      courier_destination_country_iso3,
      courier_redirect_link,
      courier_tracking_link,
      created_at,
      custom_fields,
      customer_name,
      delivery_time,
      delivery_type,
      destination_country_iso3,
      emails,
      expected_delivery,
      first_attempted_at,
      ios,
      language,
      last_mile_tracking_supported,
      latest_estimated_delivery,
      note,
      on_time_difference,
      on_time_status,
      order_date,
      order_id,
      order_id_path,
      order_number,
      order_promised_delivery_date,
      order_tags,
      origin_country_iso3,
      path,
      pickup_location,
      pickup_note,
      return_to_sender,
      shipment_delivery_date,
      shipment_package_count,
      shipment_pickup_date,
      shipment_tags,
      shipment_type,
      shipment_weight,
      shipment_weight_unit,
      signed_by,
      slug,
      smses,
      source,
      subscribed_emails,
      subscribed_smses,
      subtag,
      subtag_message,
      tag,
      title,
      tracked_count,
      tracking_account_number,
      tracking_destination_country,
      tracking_key,
      tracking_number,
      tracking_origin_country,
      tracking_postal_code,
      tracking_ship_date,
      tracking_state,
      unique_token,
      updated_at,
    } = aftershipMessageDto;

    return {
      active: active,
      aftershipEstimatedDeliveryDate: aftership_estimated_delivery_date
        ? {
            confidenceScore: aftership_estimated_delivery_date?.confidence_score
              ? aftership_estimated_delivery_date?.confidence_score
              : undefined,
            estimatedDeliveryDate: new Date(aftership_estimated_delivery_date?.estimated_delivery_date),
            estimatedDeliveryDateMax: new Date(aftership_estimated_delivery_date?.estimated_delivery_date_max),
            estimatedDeliveryDateMin: new Date(aftership_estimated_delivery_date?.estimated_delivery_date_min),
          }
        : undefined,
      courierDestinationCountryIso3: courier_destination_country_iso3,
      customerName: customer_name,
      deliveryTime: delivery_time,
      deliveryType: delivery_type,
      descriptionCountryIso3: destination_country_iso3,
      expectedDelivery: expected_delivery,
      language: language,
      latestEstimatedDelivery: latest_estimated_delivery,
      note: note,
      onTimeDifference: on_time_difference,
      onTimeStatus: on_time_status,
      orderDate: order_date,
      orderId: order_id,
      orderIdPath: order_id_path,
      orderNumber: order_number,
      orderPromisedDeliveryDate: order_promised_delivery_date,
      originCountryIso3: origin_country_iso3,
      path: path,
      pickupLocation: pickup_location,
      pickupNote: pickup_note,
      shipmentPackageCount: shipment_package_count,
      shipmentType: shipment_type,
      shipmentWeight: shipment_weight,
      shipmentWeightUnit: shipment_weight_unit,
      slug: slug,
      source: source,
      subtag: subtag,
      subtagMessage: subtag_message,
      tag: tag,
      title: title,
      trackedCount: tracked_count,
      trackingAccountNumber: tracking_account_number,
      trackingDestinationCountry: tracking_destination_country,
      trackingKey: tracking_key,
      trackingNumber: tracking_number,
      trackingOriginCountry: tracking_origin_country,
      trackingPostalCode: tracking_postal_code,
      trackingShipDate: tracking_ship_date,
      trackingState: tracking_state,
      uniqueToken: unique_token,
      shipmentDeliveryDate: shipment_delivery_date,
      shipmentPickupDate: shipment_pickup_date,
    };
  }

  async syncPODDate(tracking: TrackingsEntity) {
    let checkpoints = await this.checkPointsService.findAll({
      where: {
        trackingId: tracking.id,
      },
      order: {
        checkpointTime: 'DESC',
      },
    });
    let pickupCheckpoint;
    let deliveredCheckpoint;
    for (const checkpoint of checkpoints) {
      if (checkpoint.tag === EStatusDeliveryAcftership.Delivered) {
        deliveredCheckpoint = checkpoint;
      }
      if (checkpoint.tag === EStatusDeliveryAcftership.AvailableForPickup) {
        pickupCheckpoint = checkpoint;
      }
    }
    checkpoints = checkpoints.sort(
      (a: ICheckpoints, b: ICheckpoints) => new Date(b.checkpointTime).getTime() - new Date(a.checkpointTime).getTime(),
    );
    if (pickupCheckpoint?.checkpointTime) {
      tracking.shipmentPickupDate = pickupCheckpoint.checkpointTime;
    }
    if (deliveredCheckpoint?.checkpointTime) {
      tracking.shipmentDeliveryDate = deliveredCheckpoint.checkpointTime;
    }

    if (checkpoints.length) {
      tracking.tag = checkpoints[0].tag;
      if (!tracking?.shipmentDeliveryDate) {
        tracking.shipmentDeliveryDate = checkpoints[0].checkpointTime;
      }
    }

    return tracking.save();
  }

  async syncDeliveryDate() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const trackings = await this.trackingsRepository.find({
      where: [
        {
          shipmentPickupDate: IsNull(),
          createdAt: MoreThanOrEqual(oneDayAgo),
        },
        {
          shipmentDeliveryDate: IsNull(),
          createdAt: MoreThanOrEqual(oneDayAgo),
        },
        {
          tag: Not(EStatusDeliveryAcftership.Delivered),
          createdAt: MoreThanOrEqual(oneDayAgo),
        },
      ],
    });
    console.log('total', trackings.length);

    for (let i = 0; i < trackings.length; i++) {
      await this.syncPODDate(trackings[i]);
      console.log('done', trackings[i].title, trackings[i].tag);
    }
  }

  async syncOldDeliveryDate() {
    const batchSize = 20;
    let offset = 0;
    let trackings;
    do {
      trackings = await this.trackingsRepository.find({
        where: {
          createdAt: Between(new Date('2024-06-01T00:00:00+07:00'), new Date('2025-02-19T00:00:00+07:00')),
        },
        order: {
          createdAt: 'DESC',
        },
        skip: offset,
        take: batchSize,
      });
      console.log(`Processing batch with ${trackings.length} trackings...`);
      const updatePromises = trackings.map(async (tracking) => this.syncPODDate(tracking));
      await Promise.all(updatePromises);
      console.log(`Updated ${trackings.length} trackings.`);
      offset += batchSize;
    } while (trackings.length === batchSize);
    console.log('All trackings processed.');
  }

  async sendMailNotifyDeliveried(booking: IBooking, dataSendDeliveriedDto: DataSendDeliveriedDto) {
    const customer = booking.customer;

    const { acfBill } = dataSendDeliveriedDto;
    const html = GetTemplateEmail(ETemplateEmail.MAIL_DELEVERED, dataSendDeliveriedDto);

    const emailCC = acfConfig.emailPOD.split(',');
    for (let i = 0; i < customer?.management_staff?.length; i++) {
      if (customer.management_staff[i].typeStaff === ETypeStaff.BUSINESS_STAFF && customer.management_staff[i].staff)
        emailCC.push(customer.management_staff[i].staff.email);
    }
    const params = {
      from: awsConfig.emailSend,
      to: customer.email,
      cc: emailCC,
      subject: `${
        nodeEnvConfig !== 'prd' ? `[${nodeEnvConfig.toUpperCase()}]` : ''
      }Thông tin người nhận/ Consignee’s information ${acfBill} - ${booking.senderContactPerson} & ${
        booking.senderNameVi
      } - ${booking.receiverContactPerson} & ${booking.receiverName}`,
      html: html,
    };

    await sendRawMessageToEmail(params);

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async mappingDataAndSendEmailDeliveried(
    trackingId: string,
    booking: IBooking,
    shipmentPickupDate: string,
    shipmentDeliveryDate: string,
  ) {
    const firstCheckpoint = await this.checkPointsService.getFirstCheckpoint(trackingId);
    const dataSendMail = new DataSendDeliveriedDto();
    dataSendMail.acfBill = booking.bookingCode || '';
    dataSendMail.partnerBillCode = booking?.partnerBillCode || '';
    dataSendMail.exportDate = getDayInDateString(firstCheckpoint ? firstCheckpoint.checkpointTime : shipmentPickupDate);
    dataSendMail.senderCountry = booking?.senderCountry || '';
    dataSendMail.country = booking?.receiverCountry || '';
    dataSendMail.receiveDate = getDayInDateString(shipmentDeliveryDate);
    dataSendMail.receiveTime = getHourInDateString(shipmentDeliveryDate);
    dataSendMail.receiverInfo = 'Delivery stamp';

    return this.sendMailNotifyDeliveried(booking, dataSendMail);
  }

  async webhookAftershipUpdateTracking(aftershipUpdateCheckpointsDto: AftershipUpdateCheckpointsDto) {
    const { msg } = aftershipUpdateCheckpointsDto;
    const { checkpoints, tracking_number, slug } = msg;

    const bookings = await this.bookingService.getBookingsByPartnerBillCode(tracking_number);
    const mappingData = this.mappingDataAftership(msg);

    //Send mail
    if (bookings.length) {
      for (let i = 0; i < bookings.length; i++) {
        await this.trackingsRepository.update(
          {
            id: bookings[i].tracking.id,
          },
          mappingData,
        );
        await this.checkPointsService.afterShipUpdateCheckpoints(
          checkpoints,
          tracking_number,
          slug,
          bookings[i].tracking.id,
          bookings[i]?.OPartnerService,
        );

        if (mappingData.tag === EStatusDeliveryAcftership.Delivered) {
          await this.mappingDataAndSendEmailDeliveried(
            bookings[i].tracking.id,
            bookings[i],
            bookings[i]?.tracking?.shipmentPickupDate || mappingData.shipmentPickupDate,
            mappingData.shipmentDeliveryDate,
          );
        }

        const tracking = await this.trackingsRepository.findOne({
          where: {
            id: bookings[i].tracking.id,
          },
        });
        this.syncPODDate(tracking);
      }
    }

    return commonResponse(CommonResponse.SUCCESS, {});
  }

  async create(createTrackingsDto: CreateTrackingsDto) {
    return this.trackingsRepository.save(createTrackingsDto);
  }

  async createCheckpoint(createCheckPointAdminDto: CreateCheckPointAdminDto, trackingId: string) {
    const tracking = await this.findOne(trackingId);

    if (createCheckPointAdminDto.tag === EStatusDeliveryAcftership.Delivered) {
      const [booking, firstCheckpoint] = await Promise.all([
        this.bookingService.findOneById(tracking.bookingId),
        this.checkPointsService.getFirstCheckpoint(tracking.id),
      ]);
      await this.mappingDataAndSendEmailDeliveried(
        tracking.id,
        booking,
        firstCheckpoint.checkpointTime,
        createCheckPointAdminDto.timezone
          ? dayjs(createCheckPointAdminDto.checkpointTime).tz(createCheckPointAdminDto.timezone).format()
          : createCheckPointAdminDto.checkpointTime,
      );
    }

    const result = await this.checkPointsService.createCheckpointTracking(createCheckPointAdminDto, tracking.id);
    await this.updateLastTagTracking(tracking.id);

    return result;
  }

  async updateCheckpoint(updateCheckpointAdminDto: UpdateCheckpointAdminDto, checkPointId: string) {
    return this.checkPointsService.update(checkPointId, updateCheckpointAdminDto);
  }

  async removeCheckpoint(checkPointId: string) {
    return this.checkPointsService.remove(checkPointId);
  }

  async findTrackingByBillCodes(getTrackingDto: GetTrackingDto) {
    const { billCodes } = getTrackingDto;
    const query = this.trackingsRepository
      .createQueryBuilder('tracking')
      .leftJoinAndMapMany('tracking.checkpoints', 'checkpoints', 'checkpoints', 'tracking.id = checkpoints.tracking_id')
      .innerJoinAndMapOne('tracking.booking', 'booking', 'booking', 'booking.id = tracking.booking_id')
      .where(
        '(booking.booking_code IN (:...billCodes) OR booking.reference_code IN (:...billCodes) OR tracking.tracking_number IN (:...billCodes))',
        {
          billCodes,
        },
      );

    let result = await CommonPagination(getTrackingDto, query);
    let data = result.data;
    data = data.map((tracking: ITrackings): any => {
      return {
        ...tracking,
        shipmentDeliveryDate: tracking.shipmentDeliveryDate ?? tracking.updatedAt,
        checkpoints: tracking.checkpoints
          .sort(
            (a: ICheckpoints, b: ICheckpoints) =>
              new Date(b.checkpointTime).getTime() - new Date(a.checkpointTime).getTime(),
          )
          .map((v) => {
            return {
              ...v,
              checkpointTime: v.timezone ? dayjs(v.checkpointTime).tz(v.timezone).format() : v.checkpointTime,
            };
          }),
      };
    });
    result.data = data;

    return result;
  }

  async createTrackingNullValueAftership(booking: IBooking) {
    const checkExist = await this.trackingsRepository.findOne({
      where: {
        bookingId: booking.id,
      },
    });
    if (checkExist) {
      throw new HttpException(CommonError.TRACKING_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const timeNow = new Date();
    const createTrackingAftership: ITrackings = {
      bookingId: booking.id,
      title: booking.bookingCode,
      orderId: booking.id,
      orderNumber: booking.bookingCode,
      orderDate: booking.createdAt,
      trackingShipDate: timeNow,
      subtag: EStatusDeliveryAcftership.Pending,
      tag: EStatusDeliveryAcftership.Pending,
      subtagMessage: EStatusDeliveryAcftership.Pending,
      shipmentDeliveryDate: timeNow.toUTCString(),
      latestMessage: EStatusDeliveryAcftership.Pending,
    };

    return this.trackingsRepository.save(createTrackingAftership);
  }

  async getCheckpointByBillCode(billCode: string) {
    let tracking = (await this.trackingsRepository
      .createQueryBuilder('tracking')
      .leftJoinAndMapMany('tracking.checkpoints', 'checkpoints', 'checkpoints', 'checkpoints.tracking_id = tracking.id')
      .leftJoin('booking', 'booking', 'booking.id = tracking.booking_id')
      .where('booking.booking_code = :billCode OR booking.partner_bill_code = :billCode', {
        billCode,
      })
      .getOne()) as ITrackings;
    if (!tracking) {
      const booking = await this.bookingService.findBookingByBillCode(billCode);
      tracking = await this.createTrackingNullValueAftership(booking);
    }

    return {
      ...tracking,
      checkpoints:
        tracking?.checkpoints?.sort(
          (a: ICheckpoints, b: ICheckpoints) =>
            new Date(b.checkpointTime).getTime() - new Date(a.checkpointTime).getTime(),
        ) || [],
    };
  }

  async findAll(getTrackingAdminDto: GetTrackingAdminDto) {
    const { search } = getTrackingAdminDto;

    const query = this.trackingsRepository
      .createQueryBuilder('trackings')
      .leftJoinAndMapMany(
        'trackings.checkpoints',
        'checkpoints',
        'checkpoints',
        'trackings.id = checkpoints.tracking_id',
      )
      .leftJoinAndMapOne('trackings.booking', 'booking', 'booking', 'booking.id = trackings.booking_id')
      .orderBy('trackings.createdAt', 'DESC');
    if (search) {
      query.where('(booking.booking_code LIKE :search OR trackings.tracking_number LIKE :search)', {
        search: `%${search}%`,
      });
    }

    return CommonPagination(getTrackingAdminDto, query);
  }

  async saveListTracking(trackings: AftershipMessageDto[]) {
    for (let i = 0; i < trackings.length; i++) {
      const { checkpoints, tracking_number, slug } = trackings[i];

      let [booking, checkTrackingExist] = await Promise.all([
        this.bookingService.getBookingIdBypartnerBillCode(tracking_number),
        this.trackingsRepository.findOne({
          where: {
            slug,
            trackingNumber: tracking_number,
          },
        }),
      ]);
      if (!checkTrackingExist) {
        const mappingData = await this.mappingDataAftership(trackings[i]);
        checkTrackingExist = await this.trackingsRepository.save({
          ...mappingData,
          bookingId: booking.id,
        });
      }

      await this.checkPointsService.afterShipUpdateCheckpoints(
        checkpoints,
        tracking_number,
        slug,
        checkTrackingExist.id,
        booking?.OPartnerService,
      );
    }
  }

  async getDataFromAPIAftership(page: number) {
    const endpoint = `${aftershipConfig.url}/v4/trackings?page=${page}`;

    const { data } = await axios.get(endpoint, {
      headers: {
        'as-api-key': aftershipConfig.secret,
      },
    });

    return data;
  }

  async handleSaveDataAftership() {
    let page = 1;
    let data = await this.getDataFromAPIAftership(page);

    while (data && data?.data?.trackings.length) {
      const trackings: AftershipMessageDto[] = data?.data?.trackings;
      this.saveListTracking(trackings);
      page++;
      data = await this.getDataFromAPIAftership(page);
    }
  }

  async asyncDataAftership() {
    this.handleSaveDataAftership();

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async findOne(id: string) {
    const checkTrackings = await this.trackingsRepository.findOneBy({ id });
    if (!checkTrackings) {
      throw new HttpException('Tracking not found', HttpStatus.NOT_FOUND);
    } else {
      return checkTrackings;
    }
  }

  async update(id: string, updateTrackingsDto: UpdateTrackingsDto) {
    const checkTrackings = await this.trackingsRepository.findOneBy({ id });
    if (!checkTrackings) {
      throw new HttpException('Tracking not found', HttpStatus.NOT_FOUND);
    } else {
      return this.trackingsRepository.update(id, updateTrackingsDto);
    }
  }

  async remove(id: string) {
    const checkTrackings = await this.trackingsRepository.findOneBy({ id });
    if (!checkTrackings) {
      throw new HttpException('Tracking not found', HttpStatus.NOT_FOUND);
    } else {
      return this.trackingsRepository.delete(id);
    }
  }

  async findOneTrackingAftership(slug: string, tracking_number: string, booking: IBooking) {
    const endpoint = `${aftershipConfig.url}/v4/trackings/${slug}/${tracking_number}`;

    try {
      const { data } = await axios.get(endpoint, {
        headers: {
          'as-api-key': aftershipConfig.secret,
        },
      });

      await this.createOrUpdateSingleTracking(data, booking);
    } catch (error) {
      if (error?.response?.data?.meta?.code === EAftershipStatusCode.TRACKING_EXISTS) {
        throw new HttpException('Tracking not found', HttpStatus.NOT_FOUND);
      }

      if (error?.response?.data?.meta?.code === EAftershipStatusCode.TOO_MANY_REQUESTS) {
        // Sleep 5s
        await new Promise((resolve) => setTimeout(resolve, 5000));

        return this.findOneTrackingAftership(slug, tracking_number, booking);
      }

      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createOrUpdateSingleTracking(data: any, booking: IBooking) {
    let [tracking, mappingDataAftership] = await Promise.all([
      this.trackingsRepository.findOne({
        where: {
          bookingId: booking.id,
        },
      }),
      this.mappingDataAftership(data?.data?.tracking as any),
    ]);
    while (!tracking) {
      // Create tracking
      console.log(booking.bookingCode, new Date().getTime());
      tracking = await this.createTrackingNullValueAftership(booking);
    }
    Object.assign(tracking, {
      ...mappingDataAftership,
      bookingId: booking.id,
    });
    await tracking.save();

    await this.checkPointsService.afterShipUpdateCheckpoints(
      data?.data?.tracking?.checkpoints,
      booking.partnerBillCode,
      booking.OPartnerService.codeAftership,
      tracking.id,
      booking?.OPartnerService,
    );

    await this.syncPODDate(tracking);

    return commonResponse(CommonResponse.SUCCESS, tracking);
  }

  async createTrackingAftership(booking: IBooking) {
    const endpoint = `${aftershipConfig.url}/v4/trackings`;
    const createTrackingAftership: ICreateTrackingAftership = {
      slug: booking.OPartnerService.codeAftership.trim(),
      tracking_number: booking.partnerBillCode.trim(),
      title: booking.bookingCode,
      order_id: booking.id,
      order_number: booking.bookingCode,
    };

    try {
      const { data } = await axios.post(
        endpoint,
        {
          tracking: createTrackingAftership,
        },
        {
          headers: {
            'as-api-key': aftershipConfig.secret,
          },
        },
      );
      await this.createOrUpdateSingleTracking(data, booking);

      return data;
    } catch (error) {
      if (error?.response?.data?.meta?.code === EAftershipStatusCode.TRACKING_EXISTS) {
        const result = await this.findOneTrackingAftership(
          createTrackingAftership.slug,
          createTrackingAftership.tracking_number,
          booking,
        );

        return commonResponse(CommonResponse.SUCCESS, result);
      }

      if (error?.response?.data?.meta?.code === EAftershipStatusCode.INVALIDATE_TRACKING_NUMBER) {
        throw new HttpException('Invalidate tracking number', HttpStatus.BAD_REQUEST);
      }

      if (error?.response?.data?.meta?.code === EAftershipStatusCode.TOO_MANY_REQUESTS) {
        // Sleep 5s
        await new Promise((resolve) => setTimeout(resolve, 5000));

        return this.createTrackingAftership(booking);
      }

      console.log('===================== START DEBUG ERROR - createTrackingAftership =====================');
      console.error(error);
      console.log(error?.response?.data?.meta?.code);
      console.log('=====================  END DEBUG ERROR - createTrackingAftership  =====================');
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async get3CheckpointPEDbyBookingId(bookingId: string): Promise<ICheckpointPED> {
    const tracking = await this.trackingsRepository.findOne({
      where: {
        bookingId,
      },
    });
    if (!tracking) {
      return {
        pickupDate: '',
        exportDate: '',
        deliveredDate: '',
        currentStatus: EStatusDeliveryAcftership.Pending,
      };
    }

    const [pickupCheckpoint, exportCheckpoint, deliveredCheckpoint] = await Promise.all([
      this.checkPointsService.getOneCheckpoint({
        trackingId: tracking.id,
        tag: EStatusDeliveryAcftership.AvailableForPickup,
      }),
      this.checkPointsService.getOneCheckpoint({
        trackingId: tracking.id,
        isAftershipData: IsNull(),
        tag: EStatusDeliveryAcftership.InfoReceived,
        message: EStatusDeliveryMessage.pickup_partner,
      }),
      this.checkPointsService.getOneCheckpoint({
        trackingId: tracking.id,
        tag: EStatusDeliveryAcftership.Delivered,
      }),
    ]);

    return {
      pickupDate: pickupCheckpoint ? formatDateString(pickupCheckpoint.checkpointTime) : '',
      exportDate: exportCheckpoint ? formatDateString(exportCheckpoint.checkpointTime) : '',
      deliveredDate: deliveredCheckpoint ? formatDateString(deliveredCheckpoint.checkpointTime) : '',
      currentStatus: tracking.tag || EStatusDeliveryAcftership.Pending,
    };
  }

  async updateLastTagTracking(trackingId: string) {
    const [pickupDate, lastCheckpoint, tracking] = await Promise.all([
      this.checkpointsRepository.findOne({
        where: {
          trackingId: trackingId,
          tag: EStatusDeliveryAcftership.AvailableForPickup,
        },
      }),
      this.checkPointsService.getLastCheckpoint(trackingId),
      this.trackingsRepository.findOne({
        where: {
          id: trackingId,
        },
      }),
    ]);

    if (!lastCheckpoint || !tracking) return;

    tracking.tag = lastCheckpoint.tag;
    tracking.subtag = lastCheckpoint.sugtag;
    tracking.subtagMessage = lastCheckpoint.sugtagMessage;
    if (!lastCheckpoint.sugtagMessage) {
      tracking.subtagMessage = lastCheckpoint.tag;
    }
    tracking.shipmentDeliveryDate = lastCheckpoint.timezone
      ? dayjs(lastCheckpoint.checkpointTime).tz(lastCheckpoint.timezone).format()
      : lastCheckpoint.checkpointTime;
    tracking.latestMessage = lastCheckpoint.message || tracking.tag;
    if (pickupDate) {
      tracking.shipmentPickupDate = pickupDate.checkpointTime;
    }

    await tracking.save();

    await this.syncPODDate(tracking)
  }

  async getTrackingsWithLatestCheckpoint(month: number = 1) {
    const aFewMonthsAgo = new Date();
    aFewMonthsAgo.setMonth(aFewMonthsAgo.getMonth() - month);

    const trackings = await this.trackingsRepository
      .createQueryBuilder('tracking')
      .leftJoinAndMapMany(
        'tracking.checkpoint',
        CheckpointsEntity,
        'checkpoint',
        'checkpoint.tracking_id = tracking.id',
      )
      .where('tracking.createdAt >= :aFewMonthsAgo', { aFewMonthsAgo })
      .orderBy('tracking.id', 'DESC')
      .addOrderBy('checkpoint.checkpointTime', 'DESC')
      .getMany();

    return trackings;
  }

  async updateLastTagCheckpoint(month: number = 1) {
    const trackings: any[] = await this.getTrackingsWithLatestCheckpoint(month);

    const threshold = 50;
    while (trackings.length >= threshold) {
      const chuck = trackings.splice(0, threshold);
      await Promise.all(
        chuck.map((tracking) => {
          let updateData: any = {
            latestMessage: tracking.tag || EStatusDeliveryAcftership.Pending,
          };

          if (tracking.checkpoint.length > 0) {
            let lastCheckpoint = tracking.checkpoint[tracking.checkpoint.length - 1];
            for (let i = 0; i < tracking.checkpoint.length; i++) {
              if (tracking.checkpoint[i].tag == 'Delivered') {
                lastCheckpoint = tracking.checkpoint[i];
                break;
              }
            }

            updateData = {
              tag: lastCheckpoint.tag,
              subtag: lastCheckpoint.sugtag,
              subtagMessage: lastCheckpoint.sugtagMessage || lastCheckpoint.tag,
              shipmentDeliveryDate: lastCheckpoint.checkpointTime,
              latestMessage: lastCheckpoint.message || lastCheckpoint.tag || EStatusDeliveryAcftership.Pending,
            };
          }

          return this.trackingsRepository.update(tracking.id, updateData);
        }),
      );

      console.log('remaining', trackings.length);
    }

    await Promise.all(
      trackings.map((tracking) => {
        let updateData: any = {
          latestMessage: tracking.tag || EStatusDeliveryAcftership.Pending,
        };

        if (tracking.latestCheckpoint) {
          updateData = {
            tag: tracking.latestCheckpoint.tag,
            subtag: tracking.latestCheckpoint.sugtag,
            subtagMessage: tracking.latestCheckpoint.sugtagMessage || tracking.latestCheckpoint.tag,
            shipmentDeliveryDate: tracking.latestCheckpoint.checkpointTime,
            latestMessage:
              tracking.latestCheckpoint.message || tracking.latestCheckpoint.tag || EStatusDeliveryAcftership.Pending,
          };
        }

        return this.trackingsRepository.update(tracking.id, updateData);
      }),
    );

    return 'done';
  }
}
