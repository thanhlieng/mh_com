import { Injectable } from "@nestjs/common";
import { HistoryOpsQuery, HistoryQuery } from "./dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Like, Repository } from "typeorm";
import { HistoryEntity } from "./entities/history.entity";
import { CustomersEntity } from "../customers/entities/customers.entity";
import { HistoryType } from "./history.const";
import { BookingEntity } from "../bookings/entities/bookings.entity";
import { CommonPagination } from "src/common/helper/common-pagination";
import { BookingRepository } from "../bookings/repositories/booking.repository";
import { CustomerRepository } from "../customers/repositories/customer.repository";
import { UserEntity } from "../users/user.entity";

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryEntity)
    private historyRep: Repository<HistoryEntity>,
    private readonly bookingRepo: BookingRepository,
    private readonly customerRepo: CustomerRepository
  ) {}

  async findAll(inputDto: HistoryQuery) {
    const { type, action, code, search } = inputDto;

    const query = this.historyRep
      .createQueryBuilder("history")
      .innerJoinAndMapOne(
        "history.updatedUser",
        UserEntity,
        "user",
        "user.id = history.updated_by"
      );

    if (type) {
      query.where("history.type = :type", { type });
    }

    if (action) {
      query.andWhere("history.action = :action", { action });
    }

    if (code) {
      query.andWhere("history.code = :code", { code });
    }

    if (search) {
      await this.applySearchFilters(query, search);
    }

    return CommonPagination(inputDto, query);
  }

  private async applySearchFilters(query: any, search: string) {
    const matchingBookings = await this.findMatchingBookings(search);
    const matchingCustomers = await this.findMatchingCustomers(search);
    const searchConditions = this.buildSearchConditions(
      matchingBookings,
      matchingCustomers,
    );

    if (searchConditions.length) {
      const params: Record<string, any> = {
        textSearch: `%${search}%`,
      };
      
      matchingBookings.forEach((booking, index) => {
        params[`bookingSearch${index}`] = `%${booking.id}%`;
      });
      
      matchingCustomers.forEach((customer, index) => {
        params[`customerSearch${index}`] = `%${customer.id}%`;
      });

      query.andWhere(`(${searchConditions.join(" OR ")})`, params);
    }
  }

  private async findMatchingBookings(search: string): Promise<any[]> {
    return this.bookingRepo
      .createQueryBuilder("booking")
      .leftJoinAndMapOne(
        "booking.pu_delivery",
        "pu_deliveries",
        "pu_delivery",
        "pu_delivery.booking_id = booking.id"
      )
      .where("booking.booking_code ILIKE :search", { search: `%${search}%` })
      .select(["booking.id", "booking.booking_code", "pu_delivery.id"])
      .getMany();
  }

  private async findMatchingCustomers(search: string): Promise<any[]> {
    return this.customerRepo.find({
      where: [
        { customerCode: ILike(`%${search}%`) },
        { fullName: ILike(`%${search}%`) },
      ],
      select: ["id", "customerCode", "fullName"],
    });
  }

  private buildSearchConditions(
    matchingBookings: any[],
    matchingCustomers: any[],
  ) {
    const conditions = [];

    if (matchingBookings.length) {
      matchingBookings.forEach((booking, index) => {
        conditions.push(`history.old_item::text ILIKE :bookingSearch${index}`);
        conditions.push(`history.new_item::text ILIKE :bookingSearch${index}`);
      });
    }

    if (matchingCustomers.length) {
      matchingCustomers.forEach((customer, index) => {
        conditions.push(`history.old_item::text ILIKE :customerSearch${index}`);
        conditions.push(`history.new_item::text ILIKE :customerSearch${index}`);
      });
    }

    conditions.push(`history.old_item::text ILIKE :textSearch`);
    conditions.push(`history.new_item::text ILIKE :textSearch`);

    return conditions;
  }

  async create(data: Partial<HistoryEntity>[]) {
    return this.historyRep.save(data);
  }
}
