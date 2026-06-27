import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CommonResponse, EStatusDeliveryAcftership } from 'src/common/constants/common.constants';
import { commonResponse } from 'src/common/helper/common-response';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, In } from 'typeorm';
import { BookingRepository } from '../bookings/repositories/booking.repository';
import { IService } from '../services-booking/interface/services.interface';
import { CreateCheckPointAdminDto } from '../trackings/dto/create-checkpoint-admin.dto';
import { TrackingsService } from '../trackings/trackings.service';
import { TranslateService } from '../translate/translate.service';
import { AfterShipCheckpointsDto } from './dto/aftership-update-checkpoints.dto';
import { BillCodeDto } from './dto/bill-code.dto';
import { CreateCheckpointsDto } from './dto/create-checkpoints.dto';
import { CreateMultipleCheckpointDto } from './dto/create-multiple-checkpoint.dto';
import { UpdateCheckpointsDto } from './dto/update-checkpoints.dto';
import { CheckpointsEntity } from './entities/checkpoints.entity';
import { ICheckpoints } from './interface/checkpoints.interface';
import { CheckpointRepository } from './repositories/checkpoint.repository';
import dayjs from 'dayjs';

@Injectable()
export class CheckpointsService {
  constructor(
    private readonly checkpointsRepository: CheckpointRepository,
    private readonly bookingRepository: BookingRepository,

    private readonly translateService: TranslateService,

    @Inject(forwardRef(() => TrackingsService))
    private readonly trackingService: TrackingsService,
  ) {}

  getOneCheckpoint(conditions: FindOptionsWhere<CheckpointsEntity>, orders?: FindOptionsOrder<CheckpointsEntity>) {
    return this.checkpointsRepository.findOne({
      where: conditions,
      order: orders,
    });
  }

  getFirstCheckpoint(trackingId: string): Promise<ICheckpoints> {
    return this.checkpointsRepository.findOne({
      where: {
        trackingId,
      },
      order: {
        checkpointTime: 'ASC',
      },
    });
  }

  getLastCheckpoint(trackingId: string): Promise<ICheckpoints> {
    return this.checkpointsRepository.findOne({
      where: {
        trackingId,
      },
      order: {
        checkpointTime: 'DESC',
      },
    });
  }

  async create(createCheckpointsDto: CreateCheckpointsDto | CreateCheckPointAdminDto) {
    return this.checkpointsRepository.save(createCheckpointsDto);
  }

  async createCheckpointTracking(createCheckPointAdminDto: CreateCheckPointAdminDto, trackingId: string) {
    return this.checkpointsRepository.save({
      ...createCheckPointAdminDto,
      trackingId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  findAll(options?: FindManyOptions<CheckpointsEntity>) {
    return this.checkpointsRepository.find(options);
  }

  async findOne(id: string) {
    const checkCheckpoints = await this.checkpointsRepository.findOneBy({ id });
    if (!checkCheckpoints) {
      throw new NotFoundException();
    } else {
      return checkCheckpoints;
    }
  }

  async update(id: string, updateCheckpointsDto: UpdateCheckpointsDto) {
    const checkCheckpoints = await this.checkpointsRepository.findOneBy({ id });
    if (!checkCheckpoints) {
      throw new NotFoundException();
    } else {
      const result = await this.checkpointsRepository.update(id, updateCheckpointsDto);

      // check send mail when delivered
      if (updateCheckpointsDto.tag === EStatusDeliveryAcftership.Delivered) {
        const tracking = await this.trackingService.findOne(checkCheckpoints.trackingId);

        const [booking, firstCheckpoint] = await Promise.all([
          this.bookingRepository.findOneByBookingID(tracking.bookingId),
          this.getFirstCheckpoint(tracking.id),
        ]);
        await this.trackingService.mappingDataAndSendEmailDeliveried(
          tracking.id,
          booking,
          firstCheckpoint.checkpointTime,
          updateCheckpointsDto.timezone
            ? dayjs(updateCheckpointsDto.checkpointTime).tz(updateCheckpointsDto.timezone).format()
            : updateCheckpointsDto.checkpointTime,
        );
      }

      // Update last tag tracking
      await this.trackingService.updateLastTagTracking(checkCheckpoints.trackingId);

      return result;
    }
  }

  async remove(id: string) {
    const checkCheckpoints = await this.checkpointsRepository.findOneBy({ id });
    if (!checkCheckpoints) {
      throw new NotFoundException();
    } else {
      const result = await this.checkpointsRepository.delete(id);

      // Update last tag tracking
      await this.trackingService.updateLastTagTracking(checkCheckpoints.trackingId);

      return result;
    }
  }

  async mappingDataCheckpointsAftership(
    checkpointAftership: AfterShipCheckpointsDto,
    trackingId: string,
    trackingNumber: string,
    slug: string,
    partnerService: IService,
  ): Promise<CreateCheckpointsDto> {
    return {
      trackingId,
      trackingNumber,
      slug: slug,
      city: checkpointAftership.city,
      location: checkpointAftership.location,
      countryName: checkpointAftership.country_name,
      message: await this.translateService.translate(checkpointAftership.message),
      countryIso3: checkpointAftership.country_iso3,
      tag: checkpointAftership.tag,
      sugtag: checkpointAftership.subtag,
      sugtagMessage: checkpointAftership.subtag_message,
      checkpointTime: checkpointAftership.checkpoint_time,
      coordinates: checkpointAftership.coordinates,
      state: checkpointAftership.state,
      zip: checkpointAftership.zip,
      rawTag: checkpointAftership.raw_tag,
      createdAt: checkpointAftership.created_at,
      isAftershipData: true,
      timezone: null,
    };
  }

  async afterShipUpdateCheckpoints(
    checkpoints: AfterShipCheckpointsDto[],
    tracking_number: string,
    slug: string,
    trackingId: string,
    partnerService: IService,
  ) {
    await this.checkpointsRepository.delete({
      slug,
      trackingNumber: tracking_number,
      isAftershipData: true,
    });

    const newCheckpoints: CreateCheckpointsDto[] = [];
    for (let i = 0; i < checkpoints?.length; i++) {
      const checkpoint = await this.mappingDataCheckpointsAftership(
        checkpoints[i],
        trackingId,
        tracking_number,
        slug,
        partnerService,
      );
      newCheckpoints.push(checkpoint);
    }

    await this.checkpointsRepository.save(newCheckpoints);
  }

  async getCheckpointByBillCode(billCodeDto: BillCodeDto) {
    const { billCode } = billCodeDto;

    const checkPoint = await this.checkpointsRepository
      .createQueryBuilder('checkpoint')
      // .leftJoin('booking', 'booking', 'booking.id = checkpoint.booking_id')
      .where('checkpoint.tracking_number = :billCode', {
        billCode,
      })
      .orderBy('checkpoint.checkpoint_time', 'DESC')
      .getMany();

    return checkPoint;
  }

  async updateMessage() {
    let checkpoints = await this.checkpointsRepository.find({
      where: {
        slug: In(['sagawa', 'taqbin-jp']),
      },
    });
    for (let i = 0; i < checkpoints.length; i++) {
      checkpoints[i].message = await this.translateService.translate(checkpoints[i].message);
    }

    return this.checkpointsRepository.save(checkpoints);
  }

  async getAllCheckpointsByMAWBCode(mawbCode: string) {
    const query = this.checkpointsRepository
      .createQueryBuilder('checkpoint')
      .leftJoin('trackings', 'tracking', 'tracking.id = checkpoint.tracking_id')
      .leftJoinAndMapOne('checkpoint.booking', 'booking', 'booking', 'booking.id = tracking.booking_id')
      .leftJoin('pu_deliveries', 'pu_deliveries', 'booking.id = pu_deliveries.booking_id')
      .leftJoinAndMapOne(
        'checkpoint.connect_bill',
        'connect_bill',
        'connect_bill',
        'connect_bill.id = pu_deliveries.connect_bill_id',
      )
      .where('LOWER(connect_bill.mawb_code) = :mawbCode', {
        mawbCode: mawbCode.toLowerCase(),
      });

    query.orderBy('booking.booking_code', 'DESC').addOrderBy('checkpoint.checkpoint_time', 'DESC');

    return query.getMany();
  }

  async checkSendMailWhenDelivered(data: CreateCheckPointAdminDto) {
    // check send mail when delivered
    if (data.tag === EStatusDeliveryAcftership.Delivered) {
      const tracking = await this.trackingService.findOne(data.trackingId);

      const [booking, firstCheckpoint] = await Promise.all([
        this.bookingRepository.findOneByBookingID(tracking.bookingId),
        this.getFirstCheckpoint(tracking.id),
      ]);

      await this.trackingService.mappingDataAndSendEmailDeliveried(
        tracking.id,
        booking,
        firstCheckpoint.checkpointTime,
        data.timezone ? dayjs(data.checkpointTime).tz(data.timezone).format() : data.checkpointTime,
      );
    }
  }

  async createMultipleCheckpoints(createMultipleCheckpointDto: CreateMultipleCheckpointDto) {
    const { checkpointIds, data } = createMultipleCheckpointDto;
    const trackingUpdateIds: string[] = [];

    const result = await this.checkpointsRepository
      .createQueryBuilder('checkpoint')
      .leftJoinAndMapOne('checkpoint.tracking', 'trackings', 'trackings', 'trackings.id = checkpoint.tracking_id')
      .where('checkpoint.id IN (:...checkpointIds)', {
        checkpointIds: checkpointIds,
      })
      .select('trackings.id as id')
      .groupBy('trackings.id')
      .getRawMany();

    const checkpoints = result.map((tracking) => {
      trackingUpdateIds.push(tracking.id);

      const checkpoint = {
        ...data,
        sugtagMessage: data.tag,
        checkpointTime: data.checkpointTime,
        trackingId: tracking.id,
      };
      this.checkSendMailWhenDelivered(checkpoint);

      return checkpoint;
    });

    await this.checkpointsRepository.save(checkpoints);
    await Promise.all(
      trackingUpdateIds.map(async (trackingId) => this.trackingService.updateLastTagTracking(trackingId)),
    );

    return commonResponse(CommonResponse.SUCCESS, {
      created: checkpoints.length,
    });
  }
}
