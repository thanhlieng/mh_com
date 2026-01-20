// bookings.repository.ts
import { BookingStatus, CommonError, EStatusDelivery, EStatusDeliveryAcftership } from '@constants/common.constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICustomer } from 'src/modules/customers/interface/customers.interface';
import { DataSource, Repository } from 'typeorm';
import { GetBookingDto } from '../dto/get-booking.dto';
import { BookingEntity } from '../entities/bookings.entity';
import { IBooking } from '../interface/bookings.interface';

@Injectable()
export class BookingRepository extends Repository<BookingEntity> {
  constructor(private dataSource: DataSource) {
    super(BookingEntity, dataSource.createEntityManager());
  }

  getMyBookingQuery(customer: ICustomer, getBookingDto: GetBookingDto) {
    let {
      createBookingFrom,
      createBookingTo,
      status,
      type,
      serviceBookingId,
      search,
      orderBy = 'createdAt_DESC',
    } = getBookingDto;

    const query = this.createQueryBuilder('booking')
      .innerJoinAndMapOne('booking.customer', 'customers', 'customer', 'booking.customer_id = customer.id')
      .leftJoinAndMapOne('booking.serviceBooking', 'services', 'services', 'services.id = booking.service_booking_id')
      .leftJoinAndMapOne(
        'booking.partner_service',
        'services',
        'partner_service',
        'partner_service.id = booking.partner_service',
      )
      .leftJoinAndMapMany(
        'booking.bookingDetail',
        'booking_detail',
        'booking_detail',
        'booking.id = booking_detail.booking_id',
      )
      .leftJoinAndMapOne(
        `booking.deliveryCondition`,
        'delivery_conditions',
        'delivery_conditions',
        'delivery_conditions.id = booking.delivery_condition_id'
      )
      .leftJoinAndMapOne('booking.tracking', 'trackings', 'trackings', 'booking.id = trackings.booking_id')
      .leftJoinAndMapOne(
        'booking.pu_deliveries',
        'pu_deliveries',
        'pu_deliveries',
        'pu_deliveries.booking_id = booking.id',
      );

    query
      .where('booking.customer_id = :customerId', {
        customerId: customer.id,
      })
      .andWhere('booking.parent_booking_manifest_id IS NULL')
      .andWhere('booking.parent_booking IS NULL');

    if (status) {
      switch (status) {
        case BookingStatus.NOT_DELIVERED_YET:
          query.andWhere(
            'booking.status = :status AND pu_deliveries.status > :puDeliveryStatus AND trackings.tag != :trackingStatus',
            {
              status: BookingStatus.DONE,
              puDeliveryStatus: EStatusDelivery.pickup_acf,
              trackingStatus: EStatusDeliveryAcftership.Delivered,
            },
          );
          break;

        case BookingStatus.DELIVERED:
          query.andWhere('trackings.tag = :status', {
            status: EStatusDeliveryAcftership.Delivered,
          });
          break;

        case BookingStatus.DONE:
          query.andWhere(
            'booking.status = :status AND pu_deliveries.status = :puDeliveryStatus AND trackings.tag != :trackingStatus',
            {
              status: BookingStatus.DONE,
              puDeliveryStatus: EStatusDelivery.pickup_acf,
              trackingStatus: EStatusDeliveryAcftership.Delivered,
            },
          );
          break;

        default:
          query.andWhere('booking.status = :status', {
            status,
          });
          break;
      }
    }
    if (search) {
      search = search.toUpperCase();
      query.andWhere(
        `(booking.booking_code LIKE '%${search}' OR booking.partner_bill_code = '${search}'  OR booking.reference_code LIKE '%${search}%' OR UPPER(customer.full_name) LIKE '%${search}%' OR UPPER(booking.receiver_name) LIKE '%${search}%' OR UPPER(booking.sender_name_vi) LIKE '%${search}%' OR UPPER(booking.sender_name_en) LIKE '%${search}%')`,
      );
    }
    if (serviceBookingId) {
      query.andWhere('booking.service_booking_id = :serviceBookingId', {
        serviceBookingId,
      });
    }
    if (type) {
      query.andWhere('booking.type = :type', { type });
    }
    if (createBookingFrom) {
      query.andWhere('CAST(booking.created_at AS DATE) >= :createBookingFrom', {
        createBookingFrom,
      });
    }
    if (createBookingTo) {
      query.andWhere('CAST(booking.created_at AS DATE) <= :createBookingTo', {
        createBookingTo,
      });
    }
    const mapOrderBy = orderBy.split('_');
    if (mapOrderBy.length === 2) {
      query.addOrderBy(`booking.${mapOrderBy[0]}`, mapOrderBy[1] === 'ASC' ? 'ASC' : 'DESC');
    }

    return query;
  }

  async findOneByBookingID(id: string, customerID?: string): Promise<IBooking> {
    const bookingQuery = this.createQueryBuilder('booking')
      .leftJoinAndMapOne('booking.customer', 'customers', 'customer', 'booking.customer_id = customer.id')
      .leftJoinAndMapMany('booking.bookingDetail', 'booking_detail', 'bd', 'booking.id = bd.booking_id')
      .leftJoinAndMapOne('booking.invoice', 'invoice', 'invoice', 'booking.id = invoice.booking_id')
      .leftJoinAndMapMany(
        'invoice.invoice_detail',
        'invoice_detail',
        'invoice_detail',
        'invoice.id = invoice_detail.invoice_id',
      )
      .leftJoinAndMapOne('booking.service', 'services', 'service', 'booking.partner_service = service.id')
      .leftJoinAndMapOne(
        'booking.type_of_payment',
        'type_of_payment',
        'type_of_payment',
        'type_of_payment.id = booking.type_of_payment_id',
      )
      .leftJoinAndMapOne(
        'booking.pu_deliveries',
        'pu_deliveries',
        'pu_deliveries',
        'pu_deliveries.booking_id = booking.id',
      )
      .where('booking.id = :id', { id });

    if (customerID) {
      bookingQuery.andWhere('booking.customer_id = :customerID', {
        customerID,
      });
    }

    const booking = (await bookingQuery.getOne()) as IBooking;

    if (!booking) throw new NotFoundException(CommonError.BOOKING_NOT_FOUND);

    return booking;
  }

  async getBookingType(bookingID: string): Promise<{
    booking_type: string;
    pu_booking_type: string;
  }> {
    const result = (await this.createQueryBuilder('booking')
      .leftJoinAndMapOne('booking.pu_delivery', 'pu_deliveries', 'pu_delivery', 'booking.id = pu_delivery.booking_id')
      .where('booking.id = :id', { id: bookingID })
      .getOne()) as any;

    return {
      booking_type: result?.type,
      pu_booking_type: result?.pu_delivery?.type,
    };
  }
}
