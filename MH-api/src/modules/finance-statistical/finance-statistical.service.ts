import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import nodeXlsx from "node-xlsx";
import {
  BookingType,
  commonRadix,
  countryCodeToName,
  countryNameToCode,
  DefaultTimezone,
  ECustomerGroupMessage,
  ETypeStaff,
  ETypeStatisticalRevenueCustomer,
  ETypeUser,
} from "src/common/constants/common.constants";
import { CommonPaginationRaw } from "src/common/helper/common-pagination";
import { commonResponse } from "src/common/helper/common-response";
import { removeAccents } from "src/common/utils/util";
import { DataSource, In, IsNull, ILike } from "typeorm";
import * as xlsx from "xlsx";
import IJwtPayload from "../auth/payloads/jwt-payload";
import { BookingService } from "../bookings/services/bookings.service";
import { StaffRepository } from "../staffs/staffs.repository";
import { StaffsService } from "../staffs/staffs.service";
import { CreateFinanceCPNDto } from "./dto/create-finance-cpn.dto";
import { ImportStatisticalFileDto } from "./dto/import-statistical-file.dto";
import {
  ExportStatisticalFileColumnName,
  ExportStatisticalRevenueViaCustomerColumnName,
  ExportStatisticalViaCustomerFileColumnName,
  ExportStatisticalViaServiceFileColumnName,
  StatisticalByCustomerDto,
  StatisticalByServiceDto,
  StatisticalByStaffDto,
  StatisticalRevenueByCustomerDto,
} from "./dto/statistical.dto";
import { FinanceCPNEntity } from "./entities/finance-cpn.entity";
import {
  FinanceAndStatisticalErrorMessage,
  TemplateCPNFile,
  TemplateFWDFile,
} from "./finance-statistical.constant";
import { GetMessageBookingType } from "@constants/message.constants";
import {
  IFinanceStatisticalDetail,
  IFinanceStatisticalViaCustomer,
  IFinanceStatisticalViaService,
} from "./interfaces/finance-statistical.interface";
import { ResponsePagination } from "src/common/dto/response-pagination.dto";
import { FinanceStatisticalRepository } from "./finance-statistical.repository";
import { MLExchangeRateRepository } from "../ml-exchange-rate/ml-exchange-rate.repository";
import { PUDeliveryRepository } from "../pu-deliveries/repositories/pu-deliveries.repository";
import dayjs from "dayjs";
import { EPermissionActionKey } from "src/common/guards/permission";
import { ServiceBookingRepository } from "../services-booking/repositories/service.repository";

@Injectable()
export class FinanceAndStatisticalService {
  constructor(
    private readonly financeCPNRepository: FinanceStatisticalRepository,
    private readonly staffRepository: StaffRepository,
    private readonly mlExchangeRateRepository: MLExchangeRateRepository,
    private readonly puDeliveryRepository: PUDeliveryRepository,
    private readonly serviceBookingRepository: ServiceBookingRepository,

    private readonly bookingService: BookingService,
    private readonly staffService: StaffsService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async syncExchangeRate() {
    const bookingNotHaveExchangeRates = await this.financeCPNRepository.find({
      where: {
        exchange_rate_id: IsNull(),
      },
    });
    console.log(
      "total sync exchange rate: ",
      bookingNotHaveExchangeRates.length
    );
    let exportDates = await this.puDeliveryRepository.getExportDateByBookingIds(
      bookingNotHaveExchangeRates.map((v) => v.booking_id)
    );

    const exchangeRates = await this.mlExchangeRateRepository.getExchangeRates(
      "USD",
      [...new Set(Object.values(exportDates))]
    );

    const bookingIds = Object.keys(exportDates);
    for (let i = 0; i < exchangeRates.length; i++) {
      Object.values(exportDates).forEach((v, index) => {
        exportDates[bookingIds[index]] = null;
        if (
          dayjs(exchangeRates[i].timeApplyFrom)
            .tz(DefaultTimezone)
            .format("YYYY-MM-DD") <= v &&
          dayjs(exchangeRates[i].timeApplyTo)
            .tz(DefaultTimezone)
            .format("YYYY-MM-DD") >= v
        ) {
          exportDates[bookingIds[index]] = exchangeRates[i].id;
          this.financeCPNRepository.update(
            { booking_id: bookingIds[index] },
            { exchange_rate_id: exchangeRates[i].id }
          );
        }
      });
    }
  }

  async importStatisticalCPNFile(
    importStatisticalFileDto: ImportStatisticalFileDto
  ) {
    const { file } = importStatisticalFileDto;
    if (!file) {
      throw new BadRequestException(
        FinanceAndStatisticalErrorMessage.FINANCE_STATISTICAL_IS_REQUIRED
      );
    }

    const [{ data }] = nodeXlsx.parse(file.buffer, {
      defval: null,
    });

    if (
      data.length < 1 ||
      (data[0] &&
        ((data[0] as any)?.length as any) != (TemplateCPNFile?.length as any))
    ) {
      throw new BadRequestException(
        FinanceAndStatisticalErrorMessage.INVALID_CPN_FILE
      );
    }

    const financeCPNDatas: CreateFinanceCPNDto[] = [];
    const bookingCodes: string[] = [];
    const oldDatas: string[] = [];
    const businessStaffCodes: string[] = [];
    let mapBookingCode = {};

    const financeCPNData = new CreateFinanceCPNDto();
    const keysData = Object.keys(financeCPNData);
    for (let i = 1; i < data.length; i++) {
      if (!data[i][6]) {
        break;
      }

      // map booking_code
      financeCPNData.booking_id = String(data[i][6]);
      bookingCodes.push(String(data[i][6]));

      // map business_code
      const businessCode = String(data[i][13])?.split("-")?.[0]?.trim();
      if (businessCode) {
        financeCPNData.business_staff_id = businessCode;
        businessStaffCodes.push(businessCode.split("-")?.[0]?.trim());
      }

      financeCPNData["export_form"] = data[i][0];
      financeCPNData["currency"] = data[i][2];
      financeCPNData["price_list_type"] = data[i][3];
      for (let j = 1; j < keysData.length - 1; j++) {
        financeCPNData[keysData[j]] = data[i][20 + j];
      }
      financeCPNDatas.push({
        ...financeCPNData,
      });
    }

    // mapping booking ids
    const [bookingExists, staffs] = await Promise.all([
      this.bookingService.getBookingIdsByBookingCodes(bookingCodes),
      businessStaffCodes.length
        ? await this.staffRepository.find({
            where: {
              staffCode: In(businessStaffCodes),
            },
            select: {
              id: true,
              staffCode: true,
            },
          })
        : [],
    ]);

    const bookingNotExists = [];
    for (let i = 0; i < financeCPNDatas.length; i++) {
      let isExist = false;

      if (
        financeCPNDatas[i].booking_id == null ||
        financeCPNDatas[i].booking_id == "" ||
        financeCPNDatas[i].booking_id === "null"
      ) {
        break;
      }

      for (let j = 0; j < bookingExists.length; j++) {
        if (bookingExists[j].bookingCode == financeCPNDatas[i].booking_id) {
          financeCPNDatas[i].booking_id = bookingExists[j].id;
          mapBookingCode[bookingExists[j].id] = financeCPNDatas[i].booking_id;

          oldDatas.push(bookingExists[j].id);
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        bookingNotExists.push(financeCPNDatas[i].booking_id);
      }

      for (let j = 0; j < staffs.length; j++) {
        if (staffs[j].staffCode == financeCPNDatas[i].business_staff_id) {
          financeCPNDatas[i].business_staff_id = staffs[j].id;

          break;
        }
      }
    }
    if (bookingNotExists.length) {
      throw new BadRequestException(
        `Đơn hàng ${bookingNotExists.join(
          ", "
        )} không tồn tại hoặc chưa checkout. Vui lòng kiểm tra lại`
      );
    }

    const BATCH_SIZE = 100; // Set the desired batch size
    let validFinanceCPNDatas = financeCPNDatas.filter(
      (item) => isUUID(item.booking_id) && isUUID(item.business_staff_id)
    );

    if (validFinanceCPNDatas.length) {
      let totalExchangeRateExists = 0;
      let exportDates =
        await this.puDeliveryRepository.getExportDateByBookingIds(
          validFinanceCPNDatas.map((v) => v.booking_id)
        );

      const exchangeRates =
        await this.mlExchangeRateRepository.getExchangeRates("USD", [
          ...new Set(Object.values(exportDates)),
        ]);

      const bookingIds = Object.keys(exportDates);
      for (let i = 0; i < exchangeRates.length; i++) {
        Object.values(exportDates).forEach((v, index) => {
          exportDates[bookingIds[index]] = null;
          if (
            dayjs(exchangeRates[i].timeApplyFrom)
              .tz(DefaultTimezone)
              .format("YYYY-MM-DD") <= v &&
            dayjs(exchangeRates[i].timeApplyTo)
              .tz(DefaultTimezone)
              .format("YYYY-MM-DD") >= v
          ) {
            totalExchangeRateExists++;
            exportDates[bookingIds[index]] = exchangeRates[i].id;
          }
        });
      }

      if (totalExchangeRateExists !== bookingIds.length) {
        throw new BadRequestException(
          `Không tìm thấy tỷ giá cho ngày checkout: ${Object.values(
            exportDates
          ).join(", ")}. Vui lòng kiểm tra lại`
        );
      }
      // map exchange rate
      validFinanceCPNDatas = validFinanceCPNDatas.map((item) => {
        if (!exportDates[item.booking_id]) {
          throw new BadRequestException(
            `Không tìm thấy tỷ giá cho đơn hàng ${
              mapBookingCode[item.booking_id]
            }. Vui lòng kiểm tra lại`
          );
        }
        item.exchange_rate_id = exportDates[item.booking_id];
        Object.keys(item).forEach((key) => {
          if (item[key] === null || !item[key]) {
            item[key] = 0;
          }
        });

        return item;
      });

      // remove old data
      const oldBookingDatas = validFinanceCPNDatas.map(v => v.booking_id)
      if (oldBookingDatas.length) {
        await this.financeCPNRepository.delete({
          booking_id: In(oldBookingDatas),
        });
      }

      for (let i = 0; i < validFinanceCPNDatas.length; i += BATCH_SIZE) {
        const batch = validFinanceCPNDatas.slice(i, i + BATCH_SIZE);
        console.log("Processing batch:", i / BATCH_SIZE + 1);
        await Promise.all(
          batch.map((item) => {
            console.log("Import booking_id", item.booking_id);
            return this.financeCPNRepository.save(item);
          })
        );
      }
    }

    return commonResponse(
      "Import file thống kê dịch vụ chuyển phát nhanh thành công",
      HttpStatus.OK
    );
  }

  async importStatisticalFWDFile(
    importStatisticalFileDto: ImportStatisticalFileDto
  ) {
    const { file } = importStatisticalFileDto;
    if (!file) {
      throw new BadRequestException(
        FinanceAndStatisticalErrorMessage.FINANCE_STATISTICAL_IS_REQUIRED
      );
    }
    const [{ data }] = nodeXlsx.parse(file.buffer, {
      blankrows: false,
    });
    if (
      data.length < 1 ||
      JSON.stringify(data[0]) !== JSON.stringify(TemplateFWDFile)
    ) {
      throw new BadRequestException(
        FinanceAndStatisticalErrorMessage.INVALID_FWD_FILE
      );
    }

    return data;
  }

  async statisticalQuery(
    statisticalByStaffDto: StatisticalByStaffDto,
    payload: IJwtPayload
  ) {
    const { from, to } = statisticalByStaffDto;
    let staffId = statisticalByStaffDto.staffId;

    if (payload.typeUser === ETypeUser.STAFF) {
      const staff = await this.staffService.getStaffByPayload(payload);
      staffId = staff.id;
    }

    const query = this.financeCPNRepository
      .createQueryBuilder("cpn")
      .leftJoin("booking", "booking", "cpn.booking_id = booking.id")
      .leftJoin(
        "services",
        "service_booking",
        "service_booking.id = booking.service_booking_id"
      )
      .leftJoin(
        "type_of_payment",
        "type_of_payment",
        "type_of_payment.id = booking.type_of_payment_id"
      )
      .leftJoin(
        "delivery_conditions",
        "delivery_conditions",
        "booking.delivery_condition_id = delivery_conditions.id"
      )
      .leftJoin("customers", "c", "c.id = booking.customer_id")
      .leftJoin("units", "unit", "unit.id = c.unit_id")
      .leftJoin("staffs", "staff", "staff.id = cpn.business_staff_id")
      .leftJoin(
        "pu_deliveries",
        "pu_delivery",
        "pu_delivery.booking_id = booking.id"
      )
      .leftJoin(
        "connect_bill",
        "connect_bill",
        "pu_delivery.connect_bill_id = connect_bill.id"
      )
      .leftJoin(
        "services",
        "service",
        "service.id = pu_delivery.booking_partner_service"
      )
      .leftJoin(
        "services",
        "partner_service",
        "service.id = connect_bill.partner_id"
      )
      .leftJoin(
        "services",
        "connection_service",
        "service.id = connect_bill.connection_partner_id"
      )
      .leftJoin("ml_exchange_rates", "mer", "mer.id = cpn.exchange_rate_id");

    if (statisticalByStaffDto.search) {
      const services = await this.serviceBookingRepository.find({
        where: {
          name: ILike(`%${statisticalByStaffDto.search}%`),
        },
      });
      const serviceIds = services.map((v) => v.id);
      const searchTerm = statisticalByStaffDto.search.trim();

      const conditionFields = [
        "booking.booking_code",
        "booking.partner_bill_code",
        "c.customer_code",
        "c.full_name",
        "COALESCE(cpn.verified, '')",
        "COALESCE(cpn.note, '')",
        "COALESCE(unit.name, '')",
        "cpn.export_form",
        "COALESCE(delivery_conditions.name, '')",
        "COALESCE(type_of_payment.key, '')",
        "COALESCE(cpn.ncc_pp, '')",
        "COALESCE(cpn.ncc_co, '')",
        "COALESCE(cpn.ncc_handling, '')",
        "cpn.price_list_type",
        "COALESCE(service_booking.name, '')",
        "COALESCE(service.name, '')",
      ].map((field) => `${field} ILIKE :search`);

      if (serviceIds.length) {
        conditionFields.push("booking.service_booking_id IN (:...serviceIds)");
        conditionFields.push("connect_bill.service_id IN (:...serviceIds)");
        conditionFields.push("connect_bill.partner_id IN (:...serviceIds)");
        conditionFields.push(
          "connect_bill.connection_partner_id IN (:...serviceIds)"
        );
      }

      query.andWhere(`(${conditionFields.join(" OR ")})`, {
        search: `%${searchTerm}%`,
        serviceIds,
      });
    }

    if (
      statisticalByStaffDto.staffId ||
      (staffId &&
        !payload.permissions.includes(
          EPermissionActionKey.REPORT_FOR_ACCOUNTING
        ))
    ) {
      query.andWhere("cpn.business_staff_id = :staffId", { staffId: staffId });
    }

    if (from) {
      query.andWhere("DATE(connect_bill.created_at) >= :from", {
        from,
      });
    }
    if (to) {
      query.andWhere("DATE(connect_bill.created_at) <= :to", {
        to,
      });
    }

    query.select([
      "cpn.currency as currency",
      "connect_bill.created_at as export_date", // Ngày xuất
      "booking.booking_code as booking_code", // Số bill gốc
      "booking.partner_bill_code as partner_bill_code", //  Số bill đối tác
      "c.customer_code as customer_code", // Mã khách hàng
      "c.full_name as full_name", // Tên khách hàng
      `CONCAT(staff.staff_code, ' - ', staff.full_name) as staff_info`, // Kinh doanh
      "pu_delivery.type as booking_type", // Loại gửi
      "booking.receiver_country as receiver_country", // Kí hiệu nước
      "cpn.export_form as export_form", // Hình thức xuất
      "delivery_conditions.name as delivery_condition", // Điều kiện giao hàng
      "cpn.currency as currency", // Tiền tệ
      "mer.rate as rate", // Tỷ giá

      // Nước gửi
      "pu_delivery.require_partner_service_id as require_service", // 'service', // Dịch vụ gửi
      "connect_bill.partner_id as partner_service", // 'partner_service.name as partner_service', // Dịch vụ Checkout
      "connect_bill.connection_partner_id as connection_partner_service", // 'connection_service.name as connection_partner_service', // Nhà cung cấp chính
      "unit.name as unit_name", // TTGD quản lý
      "booking.service_booking_id as service_booking_name", // 'service_booking.name as service_booking_name', // Nhóm dịch vụ
      "cpn.billable_weight as billable_weight", // TL tính cước
      "cpn.op_billable_weight as op_billable_weight", // Dieu chinh TL tính cước
      "cpn.partner_billable_weight as partner_billable_weight", // TL đối tác chot
      "type_of_payment.key as type_of_payment", // Loai thanh toán
      "cpn.pp1_price as pp1_price", // Giá bán PHÍ BIẾN ĐỘNG
      "cpn.gvg_pp1_price as gvg_pp1_price", // Giá vốn PHÍ BIẾN ĐỘNG
      "cpn.pp2_price as pp2_price", // Giá bán PHÍ HÀNG HÓA
      "cpn.gvg_pp2_price as gvg_pp2_price", // Giá vốn PHÍ HÀNG HÓA
      "cpn.pp3_price as pp3_price", // 'Giá bán PHÍ KHÁC'
      "cpn.gvg_pp3_price as gvg_pp3_price", // 'Giá vốn PHÍ KHÁC'
      "cpn.extend_pp_1 as extend_pp_1", // 'Giá bán GOM, DELIVERY…'
      "cpn.extend_gvg_pp_1 as extend_gvg_pp_1", // 'Giá vốn GOM, DELIVERY…'
      "cpn.extend_pp_2 as extend_pp_2", // 'Giá bán HANDLING (XỬ LÝ HẢI QUAN…)'
      "cpn.extend_gvg_pp_2 as extend_gvg_pp_2", // 'Giá vốn HANDLING (XỬ LÝ HẢI QUAN…)'
      "cpn.extend_pp_3 as extend_pp_3", // 'Giá bán TRUCKING, KẾT NỐI…'
      "cpn.extend_gvg_pp_3 as extend_gvg_pp_3", // 'Giá vốn TRUCKING, KẾT NỐI…'
      "cpn.extend_pp_4 as extend_pp_4", // 'Giá bán TỜ KHAI/CO…'
      "cpn.extend_gvg_pp_4 as extend_gvg_pp_4", // 'Giá vốn TỜ KHAI/CO…'
      "cpn.extend_pp_5 as extend_pp_5", // 'Giá bán KHÁC…'
      "cpn.extend_gvg_pp_5 as extend_gvg_pp_5", // 'Giá vốn KHÁC…'

      "cpn.ncc_pp as ncc_pp", //NCC PP Gom, Delivery, Trucking, Kết nối...
      "cpn.ncc_co as ncc_co", // NCC Tờ khai, CO…
      "cpn.ncc_handling as ncc_handling", // NCC Handling, Khác…
      "cpn.price_list_type as price_list_type", // Loại bảng giá

      "cpn.sales_price as sales_price", // 'Gía bán BẢNG'
      "cpn.original_cost_price as original_cost_price", // 'Gía mua BẢNG'
      "cpn.lkd_sales_price as lkd_sales_price", // 'LKD/GIÁ BÁN'
      "cpn.total_pp_price as total_pp_price", // 'Giá bán TỔNG PP+/GIÁ'
      "cpn.gv_origin_total_pp_price as gv_origin_total_pp_price", // 'Giá vốn TỔNG PP+/GIÁ'
      "cpn.total_sales_price as total_sales_price", // 'Tổng giá bán + PP trước PPXD'
      "cpn.gv_origin_sales_price as gv_origin_sales_price", // 'Tổng giá vốn + PP trước PPXD'
      "cpn.ppxd as ppxd", // 'Giá bán PPXD'
      "cpn.gv_origin_ppxd as gv_origin_ppxd", // 'Giá vốn PPXD'
      "cpn.total_extend_pp as total_extend_pp", // 'Giá bán TỔNG PP NGOÀI'
      "cpn.total_origin_extend_gv_pp as total_origin_extend_gv_pp", // 'Giá vốn TỔNG PP NGOÀI'
      "cpn.total_sales as total_sales", // 'TỔNG DOANH SỐ THEO LOẠI TIỀN BÁN RA'
      "cpn.total_origin_gv_acf as total_origin_gv_acf", // 'TỔNG GIÁ VỐN THEO LOẠI TIỀN BÁN RA'
      "cpn.total_origin_sales as total_origin_sales", // 'Tổng Lợi nhuận theo loại tiền bán ra'
      "cpn.vat as vat", // 'VAT'
      "cpn.total_sales_vat as total_sales_vat", // 'TỔNG Doanh số Cả VAT'
      "cpn.original_revenue_before_diff as original_revenue_before_diff", // DOANH THU GỐC TRƯỚC CHÊNH
      "cpn.price_diff as price_diff", // SỐ TIỀN CHÊNH GIÁ
      "cpn.cost_of_main_ncc as cost_of_main_ncc", // GIÁ VỐN THEO NCC CHÍNH
      "cpn.total_cost_capital_main_type_ncc as total_cost_capital_main_type_ncc", // TỔNG GIÁ VỐN THEO LOẠI TIỀN NCC CHÍNH
      "cpn.type_invoice_of_main_ncc as type_invoice_of_main_ncc", // LOẠI XUẤT HÓA ĐƠN CỦA NCC CHÍNH
      `
      CASE 
          WHEN cpn.total_sales = 0 THEN 0
          ELSE (cpn.total_origin_sales / cpn.total_sales) 
      END as ros
      `, // Tỷ suất LN/ DT

      "cpn.verified as verified", // 'CHECK'
      "cpn.note as note", // 'NOTE'
    ]);

    query
      .orderBy("booking.created_at", "DESC")
      .addOrderBy("booking.booking_code", "DESC");
    query
      .groupBy("booking.id")
      .addGroupBy("delivery_conditions.id")
      .addGroupBy("unit.id")
      .addGroupBy("type_of_payment.id")
      .addGroupBy("c.id")
      .addGroupBy("cpn.id")
      .addGroupBy("staff.id")
      .addGroupBy("pu_delivery.id")
      .addGroupBy("connect_bill.id")
      .addGroupBy("mer.id");

    return {
      query,
    };
  }

  parseAndFormat = (value: any): any =>
    parseFloat(value) ? parseFloat(value) : "-";
  parseAndFormatPercent = (value: any): any =>
    parseFloat(value) ? parseFloat(value) * 100 : "-";

  getConversionValue(currency: string, rate: any, value: any): number {
    if (currency === "USD") {
      return value * rate;
    }

    return value;
  }

  async exportStatisticalByStaffFile(
    statisticalByStaffDto: StatisticalByStaffDto,
    payload: IJwtPayload
  ) {
    const data = [ExportStatisticalFileColumnName] as any[][];
    const { query } = await this.statisticalQuery(
      statisticalByStaffDto,
      payload
    );
    const results = await query.getRawMany();
    // map services
    const services = await this.serviceBookingRepository.find({});
    const mapService = services.reduce((acc, service) => {
      acc[service.id] = service.name;
      return acc;
    }, {});

    results.forEach((item: any) => {
      const receiverCountry = removeAccents(item.receiver_country ?? "");
      const countryCode =
        countryNameToCode[receiverCountry.toUpperCase()] ?? receiverCountry;
      const countryName =
        countryCodeToName[receiverCountry.toUpperCase()] ?? receiverCountry;
      item = this.mapstatisticalByStaffData(mapService, {
        ...item,
        country_code: countryCode,
        country_name: countryName,
      });

      const row = [
        item.export_date, // Ngày xuất
        item.booking_code, // Số bill gốc
        item.partner_bill_code, // Số bill đối tác
        item.customer_code, // Mã khách hàng
        item.full_name, // Tên khách hàng
        item.staff_info, // Kinh doanh
        GetMessageBookingType(BookingType[item.booking_type]), // Loại gửi
        countryCode, // Kí hiệu nước
        countryName, // Nước gửi
        item.export_form, // 'Hình thức xuất',
        item.delivery_condition, // 'Điều kiện giao hàng',
        item.service_checkout, // Dịch vụ gửi
        item.partner_service, // 'Dịch vụ Checkout',
        item.connection_partner_service, // 'Nhà cung cấp chính',
        item.unit_name, // 'TTGD Quản lý',
        item.service_booking_name, // 'Nhóm Dịch vụ',
        this.parseAndFormat(item.billable_weight), // TL tính cước
        this.parseAndFormat(item.op_billable_weight), // 'Điều chỉnh TL Tính cước',
        this.parseAndFormat(item.partner_billable_weight), // 'TL Đối tác chốt',
        item.type_of_payment, // 'Loại thanh toán',
        this.parseAndFormat(item.pp1_price), // Giá bán PHÍ BIẾN ĐỘNG
        this.parseAndFormat(item.gvg_pp1_price), // Giá vốn PHÍ BIẾN ĐỘNG
        this.parseAndFormat(item.pp2_price), // Giá bán PHÍ HÀNG HÓA
        this.parseAndFormat(item.gvg_pp2_price), // Giá vốn PHÍ HÀNG HÓA
        this.parseAndFormat(item.pp3_price), // Giá bán PHÍ KHÁC
        this.parseAndFormat(item.gvg_pp3_price), // Giá vốn PHÍ KHÁC
        this.parseAndFormat(item.extend_pp_1), // Giá bán GOM, DELIVERY…
        this.parseAndFormat(item.extend_gvg_pp_1), // Giá vốn GOM, DELIVERY…
        this.parseAndFormat(item.extend_pp_2), // Giá bán HANDLING (XỬ LÝ HẢI QUAN…)
        this.parseAndFormat(item.extend_gvg_pp_2), // Giá vốn HANDLING (XỬ LÝ HẢI QUAN…)
        this.parseAndFormat(item.extend_pp_3), // Giá bán TRUCKING, KẾT NỐI…
        this.parseAndFormat(item.extend_gvg_pp_3), // Giá vốn TRUCKING, KẾT NỐI…
        this.parseAndFormat(item.extend_pp_4), // Giá bán TỜ KHAI/CO…
        this.parseAndFormat(item.extend_gvg_pp_4), // Giá vốn TỜ KHAI/CO…
        this.parseAndFormat(item.extend_pp_5), // Giá bán KHÁC…
        this.parseAndFormat(item.extend_gvg_pp_5), // Giá vốn KHÁC…
        item.ncc_pp, // 'NCC PP Gom, Delivery, Trucking, Kết nối…',
        item.ncc_co, // 'NCC Tờ khai, CO…',
        item.ncc_handling, // 'NCC Handling, Khác…',
        item.price_list_type, // 'Loại bảng giá',
        this.parseAndFormat(item.sales_price), // Giá bán BẢNG
        this.parseAndFormat(item.original_cost_price), // Giá mua BẢNG
        this.parseAndFormat(item.lkd_sales_price), // LKD/GIÁ BÁN
        this.parseAndFormat(item.total_pp_price), // Giá bán TỔNG PP+/GIÁ
        this.parseAndFormat(item.gv_origin_total_pp_price), // Giá vốn TỔNG PP+/GIÁ
        this.parseAndFormat(item.total_sales_price), // Tổng giá bán + PP trước PPXD
        this.parseAndFormat(item.gv_origin_sales_price), // Tổng giá vốn + PP trước PPXD
        this.parseAndFormat(item.ppxd), // Giá bán PPXD
        this.parseAndFormat(item.gv_origin_ppxd), // Giá vốn PPXD
        this.parseAndFormat(item.total_extend_pp), // Giá bán TỔNG PP NGOÀI
        this.parseAndFormat(item.total_origin_extend_gv_pp), // Giá vốn TỔNG PP NGOÀI
        this.parseAndFormat(item.total_sales), // TỔNG DOANH SỐ THEO LOẠI TIỀN BÁN RA
        this.parseAndFormat(item.total_origin_gv_acf), // TỔNG GIÁ VỐN THEO LOẠI TIỀN BÁN RA
        this.parseAndFormat(item.total_origin_sales), // Tổng Lợi nhuận theo loại tiền bán ra
        this.parseAndFormatPercent((item.ros / 10000).toFixed(4)), // Tỷ suất LN/ DT
        this.parseAndFormat(item.vat), // VAT
        this.parseAndFormat(item.total_sales_vat), // TỔNG Doanh số Cả VAT
        this.parseAndFormat(
          this.getConversionValue(item.currency, item.rate, item.total_sales)
        ), // TỔNG DOANH SỐ QUY ĐỔI
        this.parseAndFormat(
          this.getConversionValue(
            item.currency,
            item.rate,
            item.total_origin_gv_acf
          )
        ), // TỔNG GIÁ VỐN QUY ĐỔI
        this.parseAndFormat(
          this.getConversionValue(
            item.currency,
            item.rate,
            item.total_origin_sales
          )
        ), // Tổng Lợi nhuận QUY ĐỔI
        this.parseAndFormatPercent((item.ros / 10000).toFixed(4)), // Tỷ suất LN/ DT QUY ĐỔI
        this.parseAndFormat(
          this.getConversionValue(item.currency, item.rate, item.vat)
        ), //  'VAT QUY ĐỔI',
        this.parseAndFormat(
          this.getConversionValue(
            item.currency,
            item.rate,
            item.total_sales_vat
          )
        ), // 'TỔNG Doanh số Cả VAT QUY ĐỔI',
        this.parseAndFormat(item.original_revenue_before_diff), // 'DOANH THU GỐC TRƯỚC CHÊNH',
        this.parseAndFormat(item.price_diff), // 'SỐ TIỀN CHÊNH GIÁ',
        this.parseAndFormat(item.cost_of_main_ncc), // 'GIÁ VỐN THEO NCC CHÍNH',
        this.parseAndFormat(item.total_cost_capital_main_type_ncc), // 'TỔNG GIÁ VỐN THEO LOẠI TIỀN NCC CHÍNH',
        item.type_invoice_of_main_ncc, // 'LOẠI XUẤT HÓA ĐƠN CỦA NCC CHÍNH',
        item.verified ? String(item.verified).toUpperCase() : "FALSE", // CHECK
        item.note, // NOTE
      ];

      data.push(row);
    });

    // Add SUBTOTAL formulas to the sumRow
    // const sumRowWithFormulas = [
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '', // Empty cells for non-numeric columns
    //   { t: 'n', f: `SUBTOTAL(9, K3:K${results.length + 2})` }, // SUBTOTAL formula for TL tính cước
    //   { t: 'n', f: `SUBTOTAL(9, L3:L${results.length + 2})` }, // SUBTOTAL formula for Giá bán PHÍ BIẾN ĐỘNG
    //   { t: 'n', f: `SUBTOTAL(9, M3:M${results.length + 2})` }, // SUBTOTAL formula for Giá vốn PHÍ BIẾN ĐỘNG
    //   { t: 'n', f: `SUBTOTAL(9, N3:N${results.length + 2})` }, // SUBTOTAL formula for Giá bán PHÍ HÀNG HÓA
    //   { t: 'n', f: `SUBTOTAL(9, O3:O${results.length + 2})` }, // SUBTOTAL formula for Giá vốn PHÍ HÀNG HÓA
    //   { t: 'n', f: `SUBTOTAL(9, P3:P${results.length + 2})` }, // SUBTOTAL formula for Giá bán PHÍ KHÁC
    //   { t: 'n', f: `SUBTOTAL(9, Q3:Q${results.length + 2})` }, // SUBTOTAL formula for Giá vốn PHÍ KHÁC
    //   { t: 'n', f: `SUBTOTAL(9, R3:R${results.length + 2})` }, // SUBTOTAL formula for Giá bán GOM, DELIVERY…
    //   { t: 'n', f: `SUBTOTAL(9, S3:S${results.length + 2})` }, // SUBTOTAL formula for Giá vốn GOM, DELIVERY…
    //   { t: 'n', f: `SUBTOTAL(9, T3:T${results.length + 2})` }, // SUBTOTAL formula for Giá bán HANDLING (XỬ LÝ HẢI QUAN…)
    //   { t: 'n', f: `SUBTOTAL(9, U3:U${results.length + 2})` }, // SUBTOTAL formula for Giá vốn HANDLING (XỬ LÝ HẢI QUAN…)
    //   { t: 'n', f: `SUBTOTAL(9, V3:V${results.length + 2})` }, // SUBTOTAL formula for Giá bán TRUCKING, KẾT NỐI…
    //   { t: 'n', f: `SUBTOTAL(9, W3:W${results.length + 2})` }, // SUBTOTAL formula for Giá vốn TRUCKING, KẾT NỐI…
    //   { t: 'n', f: `SUBTOTAL(9, X3:X${results.length + 2})` }, // SUBTOTAL formula for Giá bán TỜ KHAI/CO…
    //   { t: 'n', f: `SUBTOTAL(9, Y3:Y${results.length + 2})` }, // SUBTOTAL formula for Giá vốn TỜ KHAI/CO…
    //   { t: 'n', f: `SUBTOTAL(9, Z3:Z${results.length + 2})` }, // SUBTOTAL formula for Giá bán KHÁC…
    //   { t: 'n', f: `SUBTOTAL(9, AA3:AA${results.length + 2})` }, // SUBTOTAL formula for Giá vốn KHÁC…
    //   { t: 'n', f: `SUBTOTAL(9, AB3:AB${results.length + 2})` }, // SUBTOTAL formula for Giá bán BẢNG
    //   { t: 'n', f: `SUBTOTAL(9, AC3:AC${results.length + 2})` }, // SUBTOTAL formula for Giá mua BẢNG
    //   { t: 'n', f: `SUBTOTAL(9, AD3:AD${results.length + 2})` }, // SUBTOTAL formula for LKD/GIÁ BÁN
    //   { t: 'n', f: `SUBTOTAL(9, AE3:AE${results.length + 2})` }, // SUBTOTAL formula for Giá bán TỔNG PP+/GIÁ
    //   { t: 'n', f: `SUBTOTAL(9, AF3:AF${results.length + 2})` }, // SUBTOTAL formula for Giá vốn TỔNG PP+/GIÁ
    //   { t: 'n', f: `SUBTOTAL(9, AG3:AG${results.length + 2})` }, // SUBTOTAL formula for Tổng giá bán + PP trước PPXD
    //   { t: 'n', f: `SUBTOTAL(9, AH3:AH${results.length + 2})` }, // SUBTOTAL formula for Tổng giá vốn + PP trước PPXD
    //   { t: 'n', f: `SUBTOTAL(9, AI3:AI${results.length + 2})` }, // SUBTOTAL formula for Giá bán PPXD
    //   { t: 'n', f: `SUBTOTAL(9, AJ3:AJ${results.length + 2})` }, // SUBTOTAL formula for Giá vốn PPXD
    //   { t: 'n', f: `SUBTOTAL(9, AK3:AK${results.length + 2})` }, // SUBTOTAL formula for Giá bán TỔNG PP NGOÀI
    //   { t: 'n', f: `SUBTOTAL(9, AL3:AL${results.length + 2})` }, // SUBTOTAL formula for Giá vốn TỔNG PP NGOÀI
    //   { t: 'n', f: `SUBTOTAL(9, AM3:AM${results.length + 2})` }, // SUBTOTAL formula for TỔNG DOANH SỐ
    //   { t: 'n', f: `SUBTOTAL(9, AN3:AN${results.length + 2})` }, // SUBTOTAL formula for TỔNG GIÁ VỐN
    //   { t: 'n', f: `SUBTOTAL(9, AO3:AO${results.length + 2})` }, // SUBTOTAL formula for Tổng Lợi nhuận
    //   { t: 'n', f: `(AO2/AM2)*100` }, // SUBTOTAL formula for Tỷ suất LN/ DT
    //   { t: 'n', f: `SUBTOTAL(9, AQ3:AQ${results.length + 2})` }, // SUBTOTAL formula for VAT
    //   { t: 'n', f: `SUBTOTAL(9, AR3:AR${results.length + 2})` }, // SUBTOTAL formula for TỔNG Doanh số Cả VAT
    //   '',
    //   '', // Empty cells for non-numeric columns
    // ];

    // data[1] = sumRowWithFormulas;

    const worksheet = xlsx.utils.aoa_to_sheet(data);

    // Set column widths
    worksheet["!cols"] = [
      { wpx: 100 }, // Width for Ngày xuất
      { wpx: 100 }, // Width for Số bill gốc
      { wpx: 100 }, // Width for Số bill đối tác
      { wpx: 100 }, // Width for Mã khách hàng
      // Add more column widths as needed
    ];

    // Freeze the first 4 columns and the first row
    worksheet["!freeze"] = { xSplit: 4, ySplit: 1 };

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Báo cáo");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    return {
      buffer,
      filename: `Báo cáo doanh số.xlsx`,
    };
  }

  mapstatisticalByStaffData(mapService: any, v: object) {
    v["service_booking_name"] =
      mapService[v["service_booking_name"]] ?? v["service_booking_name"];
    v["require_service"] =
      mapService[v["require_service"]] ?? v["require_service"];
    v["partner_service"] =
      mapService[v["partner_service"]] ?? v["partner_service"];
    v["connection_partner_service"] =
      mapService[v["connection_partner_service"]] ??
      v["connection_partner_service"];

    Object.keys(v).forEach((k) => {
      if (v[k] === null) {
        switch (k) {
          case "verified":
            v[k] = false;
            break;
          case "note":
            v[k] = "";
            break;

          default:
            v[k] = 0;
            break;
        }
      }
      if (k === "ros") {
        v[k] = v[k] * 100;
      }
    });

    return v;
  }

  async statisticalByStaff(
    statisticalByStaffDto: StatisticalByStaffDto,
    payload: IJwtPayload
  ) {
    const { query } = await this.statisticalQuery(
      statisticalByStaffDto,
      payload
    );
    const paginationRawData = await CommonPaginationRaw(
      statisticalByStaffDto,
      query
    );
    // map services
    const services = await this.serviceBookingRepository.find({});
    const mapService = services.reduce((acc, service) => {
      acc[service.id] = service.name;
      return acc;
    }, {});

    // map country code - name
    paginationRawData.data = paginationRawData.data.map((item: any): any => {
      const receiverCountry = removeAccents(item.receiver_country ?? "");
      const countryCode =
        countryNameToCode[receiverCountry.toUpperCase()] ?? receiverCountry;
      const countryName =
        countryCodeToName[receiverCountry.toUpperCase()] ?? receiverCountry;

      return this.mapstatisticalByStaffData(mapService, {
        ...item,
        country_code: countryCode,
        country_name: countryName,
      });
    });

    return paginationRawData;
  }

  // statistical by customer
  async getStatisticalByCustomerQuery(
    inputDto: StatisticalByCustomerDto,
    payload: IJwtPayload
  ) {
    const saleIdFilter = inputDto.salesId;
    let { customerId, from, to, year, salesId } = inputDto;
    year = year ?? new Date().getFullYear();
    if (
      payload.typeUser === ETypeUser.STAFF &&
      !payload.permissions.includes(EPermissionActionKey.REPORT_FOR_ACCOUNTING)
    ) {
      const staff = await this.staffService.getStaffByPayload(payload);
      salesId = staff.id;
    }

    const query = this.dataSource.createQueryBuilder().from((subQuery) => {
      subQuery
        .select([
          "c.id as customer_id",
          "c.customer_code as customer_code",
          "c.full_name as full_name",
          "c.open_date as open_date",
          "c.created_at as created_at",
          "c.customer_group as customer_group",
          "u.name as unit_name",
          "s.id as staff_id",
          `CONCAT(s.staff_code, ' - ', s.full_name) as staff_name`,
          `TO_CHAR(cb.created_at, 'YYYY-MM') as month`,
          `SUM(fc.total_sales) as sum_total_sales_vnd`,
          `SUM(fc.total_origin_gv_acf) as sum_total_origin_gv_acf_vnd`,
          `SUM(fc.total_origin_sales) as sum_total_origin_sales_vnd`,
        ])
        .from((subQueryLv2) => {
          subQueryLv2
            .select([
              "fcpn.id as id",
              "fcpn.booking_id as booking_id",
              `
              CASE 
                  WHEN fcpn.currency = 'USD' THEN fcpn.total_sales * mer.rate
                  ELSE fcpn.total_sales
              END as total_sales
              `,
              `
              CASE 
                  WHEN fcpn.currency = 'USD' THEN fcpn.total_origin_gv_acf * mer.rate
                  ELSE fcpn.total_origin_gv_acf
              END as total_origin_gv_acf
              `,
              `
              CASE 
                  WHEN fcpn.currency = 'USD' THEN fcpn.total_origin_sales * mer.rate
                  ELSE fcpn.total_origin_sales
              END as total_origin_sales
              `,
            ])
            .from("finance_cpn", "fcpn")
            .leftJoin(
              "ml_exchange_rates",
              "mer",
              "mer.id = fcpn.exchange_rate_id"
            );

          return subQueryLv2.groupBy(`fcpn.id, mer.id`);
        }, "fc")
        .innerJoin("booking", "b", "b.id = fc.booking_id")
        .innerJoin("pu_deliveries", "pu", "pu.booking_id = b.id")
        .innerJoin("connect_bill", "cb", "cb.id = pu.connect_bill_id")
        .innerJoin("customers", "c", "b.customer_id = c.id")
        .leftJoin("units", "u", "u.id = c.unit_id")
        .leftJoin(
          "management_staff",
          "ms",
          `ms.customer_id = c.id AND ms.type_staff = '${ETypeStaff.CODE_OPENING_STAFF}'`
        )
        .leftJoin("staffs", "s", "ms.staff_id = s.id");

      if (year) {
        subQuery.andWhere(`TO_CHAR(cb.created_at, 'YYYY') = :year`, { year });
      }

      return subQuery.groupBy(
        `c.id, u.id, s.id, TO_CHAR(cb.created_at, 'YYYY-MM')`
      );
    }, "cs");

    if (customerId) {
      query.andWhere("cs.customer_id = :customerId", { customerId });
    }
    if (from) {
      const startOfDay = new Date(from);
      startOfDay.setHours(0, 0, 0, 0);
      query.andWhere("cs.open_date >= :from", { from: startOfDay });
    }
    if (to) {
      const endOfDay = new Date(to);
      endOfDay.setHours(23, 59, 59, 999);
      query.andWhere("cs.open_date <= :to", { to: endOfDay });
    }
    if (
      saleIdFilter ||
      (salesId &&
        payload.typeUser === ETypeUser.STAFF &&
        !payload.permissions.includes(
          EPermissionActionKey.REPORT_FOR_ACCOUNTING
        ))
    ) {
      query.andWhere("cs.staff_id = :salesId", { salesId });
    }

    const countQuery = query
      .clone()
      .select([
        "ARRAY_AGG(cs.month) as months",
        "ARRAY_AGG(cs.sum_total_sales_vnd) as sum_total_sales_vnd",
        "ARRAY_AGG(cs.sum_total_origin_gv_acf_vnd) as sum_total_origin_gv_acf_vnd",
        "ARRAY_AGG(cs.sum_total_origin_sales_vnd) as sum_total_origin_sales_vnd",
      ]);

    query.select([
      "cs.customer_code as customer_code",
      "cs.full_name as full_name",
      "cs.open_date as open_date",
      "cs.created_at as created_at",
      "cs.customer_group as customer_group",
      "cs.staff_name as staff_name",
      "cs.unit_name as unit_name",
      "ARRAY_AGG(cs.month) as months",
      "ARRAY_AGG(cs.sum_total_sales_vnd) as sum_total_sales_vnd",
      "ARRAY_AGG(cs.sum_total_origin_gv_acf_vnd) as sum_total_origin_gv_acf_vnd",
      "ARRAY_AGG(cs.sum_total_origin_sales_vnd) as sum_total_origin_sales_vnd",
    ]);

    return {
      query,
      countQuery,
    };
  }

  mapStatisticalByCustomerData(
    v: object[],
    year: number
  ): IFinanceStatisticalViaCustomer[] {
    const months = Array.from(
      { length: 12 },
      (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`
    );
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const monthMap: Record<string, string> = months.reduce(
      (acc, month, index) => {
        acc[month] = monthNames[index];
        return acc;
      },
      {}
    );

    return v.map((item: any): IFinanceStatisticalViaCustomer => {
      let statisticalMap: Record<string, IFinanceStatisticalDetail> = {};
      let summary: IFinanceStatisticalDetail = {
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: 0,
      };
      for (let i = 0; i < months.length; i++) {
        statisticalMap[monthMap[months[i]]] = {
          revenue: 0,
          cost: 0,
          profit: 0,
          profitMargin: 0,
        };
        for (let j = 0; j < item.months.length; j++) {
          if (item.months[j] !== months[i]) {
            continue;
          }
          statisticalMap[monthMap[item.months[j]]].revenue = parseFloat(
            item.sum_total_sales_vnd[j]
          ); // Doanh thu
          statisticalMap[monthMap[item.months[j]]].cost = parseFloat(
            item.sum_total_origin_gv_acf_vnd[j]
          ); // Chi phí
          statisticalMap[monthMap[item.months[j]]].profit = parseFloat(
            item.sum_total_origin_sales_vnd[j]
          ); // Lợi nhuận
          statisticalMap[monthMap[item.months[j]]].profitMargin =
            statisticalMap[monthMap[item.months[j]]].revenue
              ? statisticalMap[monthMap[item.months[j]]].profit /
                statisticalMap[monthMap[item.months[j]]].revenue
              : 0; // Lợi nhuận / Doanh thu

          summary.revenue += statisticalMap[monthMap[item.months[j]]].revenue;
          summary.cost += statisticalMap[monthMap[item.months[j]]].cost;
          summary.profit += statisticalMap[monthMap[item.months[j]]].profit;
          break;
        }
      }

      summary.profitMargin = summary.revenue
        ? summary.profit / summary.revenue
        : 0;
      statisticalMap["summary"] = summary;

      return {
        customerCode: item?.customer_code,
        customerName: item?.full_name,
        openDate: item?.open_date,
        unit: item?.unit_name,
        groupCustomer: ECustomerGroupMessage[item?.customer_group],
        salesName: item.staff_name,
        statistical: statisticalMap,
      };
    });
  }

  mapResponseToStatistical(
    data: any[]
  ): Record<string, IFinanceStatisticalDetail> {
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const monthMap: Record<string, string> = {
      "01": "jan",
      "02": "feb",
      "03": "mar",
      "04": "apr",
      "05": "may",
      "06": "jun",
      "07": "jul",
      "08": "aug",
      "09": "sep",
      "10": "oct",
      "11": "nov",
      "12": "dec",
    };

    const initialStatistical: Record<string, IFinanceStatisticalDetail> =
      months.reduce((acc, month) => {
        acc[month] = { revenue: 0, cost: 0, profit: 0, profitMargin: 0 };
        return acc;
      }, {} as Record<string, IFinanceStatisticalDetail>);

    initialStatistical.summary = {
      revenue: 0,
      cost: 0,
      profit: 0,
      profitMargin: 0,
    };

    data.forEach((item) => {
      item.months?.forEach((month: string, index: number) => {
        const monthKey = monthMap[month.split("-")[1]];
        if (monthKey) {
          initialStatistical[monthKey].revenue += parseFloat(
            item.sum_total_sales_vnd[index]
          );
          initialStatistical[monthKey].cost += parseFloat(
            item.sum_total_origin_gv_acf_vnd[index]
          );
          initialStatistical[monthKey].profit += parseFloat(
            item.sum_total_origin_sales_vnd[index]
          );
          initialStatistical[monthKey].profitMargin = initialStatistical[
            monthKey
          ].revenue
            ? initialStatistical[monthKey].profit /
              initialStatistical[monthKey].revenue
            : 0;

          initialStatistical.summary.revenue += parseFloat(
            item.sum_total_sales_vnd[index]
          );
          initialStatistical.summary.cost += parseFloat(
            item.sum_total_origin_gv_acf_vnd[index]
          );
          initialStatistical.summary.profit += parseFloat(
            item.sum_total_origin_sales_vnd[index]
          );
        }
      });
    });

    initialStatistical.summary.profitMargin = initialStatistical.summary.revenue
      ? initialStatistical.summary.profit / initialStatistical.summary.revenue
      : 0;

    return initialStatistical;
  }

  async statisticalByCustomer(
    inputDto: StatisticalByCustomerDto,
    payload: IJwtPayload
  ) {
    const { query, countQuery } = await this.getStatisticalByCustomerQuery(
      inputDto,
      payload
    );
    const countRecords = await query.clone().select("count(*)").getRawOne();
    const sumValuesResult = await countQuery.execute();

    query
      .groupBy(
        "cs.customer_code, cs.full_name, cs.open_date, cs.created_at, cs.customer_group, cs.staff_name, cs.unit_name"
      )
      .orderBy("cs.customer_code", "DESC");

    const page = parseInt(inputDto.page, commonRadix) - 1;
    const pageSize = parseInt(inputDto.pageSize, commonRadix);
    if (page < 0 || pageSize < 1) {
      throw new BadRequestException();
    }
    const data = await query
      .limit(pageSize)
      .offset(page * pageSize)
      .execute();

    const result: ResponsePagination<any> = {
      data: data,
      pagination: {
        currentPage: page + 1,
        pageSize,
        totalPage: Math.ceil(countRecords.count / pageSize),
        totalCount: countRecords.count ?? 0,
      },
    };
    result.data = this.mapStatisticalByCustomerData(
      result.data,
      inputDto.year ?? new Date().getFullYear()
    );

    return {
      ...result,
      sumValues: this.mapResponseToStatistical(sumValuesResult),
    };
  }

  async exportStatisticalByCustomer(
    inputDto: StatisticalByCustomerDto,
    payload: IJwtPayload
  ) {
    const { query } = await this.getStatisticalByCustomerQuery(
      inputDto,
      payload
    );
    inputDto.year = inputDto.year ?? new Date().getFullYear();
    query
      .groupBy(
        "cs.customer_code, cs.full_name, cs.open_date, cs.created_at, cs.customer_group, cs.staff_name, cs.unit_name"
      )
      .orderBy("cs.customer_code", "DESC");

    const result = this.mapStatisticalByCustomerData(
      await query.getRawMany(),
      inputDto.year ?? new Date().getFullYear()
    );
    let data = [...ExportStatisticalViaCustomerFileColumnName];
    data.push([]);
    result.forEach((item, index) => {
      data.push([
        String(index + 1),
        item.customerCode,
        item.customerName,
        item.salesName,
        item.openDate,
        item.unit,
        item.groupCustomer,
        this.parseAndFormat(item.statistical.jan.revenue), // t1
        this.parseAndFormat(item.statistical.jan.cost),
        this.parseAndFormat(item.statistical.jan.profit),
        this.parseAndFormatPercent(item.statistical.jan.profitMargin),
        this.parseAndFormat(item.statistical.feb.revenue), // t2
        this.parseAndFormat(item.statistical.feb.cost),
        this.parseAndFormat(item.statistical.feb.profit),
        this.parseAndFormatPercent(item.statistical.feb.profitMargin),
        this.parseAndFormat(item.statistical.mar.revenue), // t3
        this.parseAndFormat(item.statistical.mar.cost),
        this.parseAndFormat(item.statistical.mar.profit),
        this.parseAndFormatPercent(item.statistical.mar.profitMargin),
        this.parseAndFormat(item.statistical.apr.revenue), // t4
        this.parseAndFormat(item.statistical.apr.cost),
        this.parseAndFormat(item.statistical.apr.profit),
        this.parseAndFormatPercent(item.statistical.apr.profitMargin),
        this.parseAndFormat(item.statistical.may.revenue), // t5
        this.parseAndFormat(item.statistical.may.cost),
        this.parseAndFormat(item.statistical.may.profit),
        this.parseAndFormatPercent(item.statistical.may.profitMargin),
        this.parseAndFormat(item.statistical.jun.revenue), // t6
        this.parseAndFormat(item.statistical.jun.cost),
        this.parseAndFormat(item.statistical.jun.profit),
        this.parseAndFormatPercent(item.statistical.jun.profitMargin),
        this.parseAndFormat(item.statistical.jul.revenue), // t7
        this.parseAndFormat(item.statistical.jul.cost),
        this.parseAndFormat(item.statistical.jul.profit),
        this.parseAndFormatPercent(item.statistical.jul.profitMargin),
        this.parseAndFormat(item.statistical.aug.revenue), // t8
        this.parseAndFormat(item.statistical.aug.cost),
        this.parseAndFormat(item.statistical.aug.profit),
        this.parseAndFormatPercent(item.statistical.aug.profitMargin),
        this.parseAndFormat(item.statistical.sep.revenue), // t9
        this.parseAndFormat(item.statistical.sep.cost),
        this.parseAndFormat(item.statistical.sep.profit),
        this.parseAndFormatPercent(item.statistical.sep.profitMargin),
        this.parseAndFormat(item.statistical.oct.revenue), // t10
        this.parseAndFormat(item.statistical.oct.cost),
        this.parseAndFormat(item.statistical.oct.profit),
        this.parseAndFormatPercent(item.statistical.oct.profitMargin),
        this.parseAndFormat(item.statistical.nov.revenue), // t11
        this.parseAndFormat(item.statistical.nov.cost),
        this.parseAndFormat(item.statistical.nov.profit),
        this.parseAndFormatPercent(item.statistical.nov.profitMargin),
        this.parseAndFormat(item.statistical.dec.revenue), // t12
        this.parseAndFormat(item.statistical.dec.cost),
        this.parseAndFormat(item.statistical.dec.profit),
        this.parseAndFormatPercent(item.statistical.dec.profitMargin),
        this.parseAndFormat(item.statistical.summary.revenue), // summary
        this.parseAndFormat(item.statistical.summary.cost),
        this.parseAndFormat(item.statistical.summary.profit),
        this.parseAndFormatPercent(item.statistical.summary.profitMargin),
      ]);
    });

    // Add SUBTOTAL formulas to the sumRow
    const sumRowWithFormulas = [
      "Tổng",
      "",
      "",
      "",
      "",
      "",
      "",
      { t: "n", f: `SUBTOTAL(9, H4:H${result.length + 4})` }, // t1
      { t: "n", f: `SUBTOTAL(9, I4:I${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, J4:J${result.length + 4})` },
      { t: "n", f: `IF(H3=0, 0, (J3/H3)*100)` },
      { t: "n", f: `SUBTOTAL(9, L4:L${result.length + 4})` }, // t2
      { t: "n", f: `SUBTOTAL(9, M4:M${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, N4:N${result.length + 4})` },
      { t: "n", f: `IF(L3=0, 0, (N3/L3)*100)` },
      { t: "n", f: `SUBTOTAL(9, P4:P${result.length + 4})` }, // t3
      { t: "n", f: `SUBTOTAL(9, Q4:Q${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, R4:R${result.length + 4})` },
      { t: "n", f: `IF(P3=0, 0, (R3/P3)*100)` },
      { t: "n", f: `SUBTOTAL(9, T4:T${result.length + 4})` }, // t4
      { t: "n", f: `SUBTOTAL(9, U4:U${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, V4:V${result.length + 4})` },
      { t: "n", f: `IF(T3=0, 0, (V3/T3)*100)` },
      { t: "n", f: `SUBTOTAL(9, X4:X${result.length + 4})` }, // t5
      { t: "n", f: `SUBTOTAL(9, Y4:Y${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, Z4:Z${result.length + 4})` },
      { t: "n", f: `IF(X3=0, 0, (Z3/X3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AB4:AB${result.length + 4})` }, // t6
      { t: "n", f: `SUBTOTAL(9, AC4:AC${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AD4:AD${result.length + 4})` },
      { t: "n", f: `IF(AB3=0, 0, (AD3/AB3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AF4:AF${result.length + 4})` }, // t7
      { t: "n", f: `SUBTOTAL(9, AG4:AG${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AH4:AH${result.length + 4})` },
      { t: "n", f: `IF(AF3=0, 0, (AH3/AF3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AJ4:AJ${result.length + 4})` }, // t8
      { t: "n", f: `SUBTOTAL(9, AK4:AK${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AL4:AL${result.length + 4})` },
      { t: "n", f: `IF(AJ3=0, 0, (AL3/AJ3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AN4:AN${result.length + 4})` }, // t9
      { t: "n", f: `SUBTOTAL(9, AO4:AO${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AP4:AP${result.length + 4})` },
      { t: "n", f: `IF(AN3=0, 0, (AP3/AN3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AR4:AR${result.length + 4})` }, // t10
      { t: "n", f: `SUBTOTAL(9, AS4:AS${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AT4:AT${result.length + 4})` },
      { t: "n", f: `IF(AR3=0, 0, (AT3/AR3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AV4:AV${result.length + 4})` }, // t11
      { t: "n", f: `SUBTOTAL(9, AW4:AW${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AX4:AX${result.length + 4})` },
      { t: "n", f: `IF(AV3=0, 0, (AX3/AV3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AZ4:AZ${result.length + 4})` }, // t12
      { t: "n", f: `SUBTOTAL(9, BA4:BA${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, BB4:BB${result.length + 4})` },
      { t: "n", f: `IF(AZ3=0, 0, (BB3/AZ3)*100)` },
      { t: "n", f: `SUBTOTAL(9, BD4:BD${result.length + 4})` }, // summary
      { t: "n", f: `SUBTOTAL(9, BE4:BE${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, BF4:BF${result.length + 4})` },
      { t: "n", f: `IF(BD3=0, 0, (BF3/BD3)*100)` },
    ] as any;
    data[2] = sumRowWithFormulas;

    const worksheet = xlsx.utils.aoa_to_sheet(data);
    const mergesRanges = [
      {
        s: { r: 2, c: 0 },
        e: { r: 2, c: 6 },
      },
      {
        s: { r: 0, c: 0 },
        e: { r: 1, c: 0 },
      },
      {
        s: { r: 0, c: 1 },
        e: { r: 1, c: 1 },
      },
      {
        s: { r: 0, c: 2 },
        e: { r: 1, c: 2 },
      },
      {
        s: { r: 0, c: 3 },
        e: { r: 1, c: 3 },
      },
      {
        s: { r: 0, c: 4 },
        e: { r: 1, c: 4 },
      },
      {
        s: { r: 0, c: 5 },
        e: { r: 1, c: 5 },
      },
      {
        s: { r: 0, c: 6 },
        e: { r: 1, c: 6 },
      },
    ];
    // merge statistical month
    for (let i = 0; i <= 12; i++) {
      mergesRanges.push({
        s: { r: 0, c: 7 + i * 4 },
        e: { r: 0, c: 10 + i * 4 },
      });
    }

    // Set column widths
    worksheet["!merges"] = mergesRanges;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Báo cáo");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    return {
      buffer,
      filename: `Report theo KH va KD ${inputDto.year}.xlsx`,
    };
  }

  // statistical by service
  async getStatisticalByServiceQuery(
    inputDto: StatisticalByServiceDto,
    payload: IJwtPayload
  ) {
    const { year } = inputDto;
    const { typeUser, permissions } = payload;
    let staffId = null;
    if (
      typeUser === ETypeUser.STAFF &&
      !permissions.includes(EPermissionActionKey.REPORT_FOR_ACCOUNTING)
    ) {
      const staff = await this.staffService.getStaffByPayload(payload);
      staffId = staff.id;
    }

    const query = this.dataSource.createQueryBuilder().from((subQuery) => {
      subQuery
        .select([
          "service.name as service_name",
          `TO_CHAR(cb.created_at, 'YYYY-MM') as month`,
          "SUM(fc.total_sales) as sum_total_sales_vnd",
          "SUM(fc.total_origin_gv_acf) as sum_total_origin_gv_acf_vnd",
          "SUM(fc.total_origin_sales) as sum_total_origin_sales_vnd",
        ])
        .from((subQueryLv2) => {
          subQueryLv2
            .select([
              "fcpn.id as id",
              "fcpn.booking_id as booking_id",
              "fcpn.business_staff_id as business_staff_id",
              `
              CASE 
                  WHEN fcpn.currency = 'USD' THEN fcpn.total_sales * mer.rate
                  ELSE fcpn.total_sales
              END as total_sales
              `,
              `
              CASE 
                  WHEN fcpn.currency = 'USD' THEN fcpn.total_origin_gv_acf * mer.rate
                  ELSE fcpn.total_origin_gv_acf
              END as total_origin_gv_acf
              `,
              `
              CASE 
                  WHEN fcpn.currency = 'USD' THEN fcpn.total_origin_sales * mer.rate
                  ELSE fcpn.total_origin_sales
              END as total_origin_sales
              `,
            ])
            .from("finance_cpn", "fcpn")
            .leftJoin(
              "ml_exchange_rates",
              "mer",
              "mer.id = fcpn.exchange_rate_id"
            );
          if (staffId) {
            subQueryLv2.andWhere("fcpn.business_staff_id = :staffId", {
              staffId,
            });
          }

          return subQueryLv2.groupBy(`fcpn.id, mer.id`);
        }, "fc")
        .innerJoin("booking", "b", "b.id = fc.booking_id")
        .leftJoin(
          "pu_deliveries",
          "pu_delivery",
          "pu_delivery.booking_id = b.id"
        )
        .leftJoin("connect_bill", "cb", "cb.id = pu_delivery.connect_bill_id")
        .leftJoin(
          "services",
          "service",
          "service.id = pu_delivery.booking_partner_service"
        );

      if (year) {
        subQuery.andWhere(`TO_CHAR(cb.created_at, 'YYYY') = :year`, { year });
      }

      return subQuery.groupBy(`service.id, TO_CHAR(cb.created_at, 'YYYY-MM')`);
    }, "cs");

    const countQuery = query
      .clone()
      .select([
        "ARRAY_AGG(cs.month) as months",
        "ARRAY_AGG(cs.sum_total_sales_vnd) as sum_total_sales_vnd",
        "ARRAY_AGG(cs.sum_total_origin_gv_acf_vnd) as sum_total_origin_gv_acf_vnd",
        "ARRAY_AGG(cs.sum_total_origin_sales_vnd) as sum_total_origin_sales_vnd",
      ]);
    query.select([
      "cs.service_name as service_name",
      "ARRAY_AGG(cs.month) as months",
      "ARRAY_AGG(cs.sum_total_sales_vnd) as sum_total_sales_vnd",
      "ARRAY_AGG(cs.sum_total_origin_gv_acf_vnd) as sum_total_origin_gv_acf_vnd",
      "ARRAY_AGG(cs.sum_total_origin_sales_vnd) as sum_total_origin_sales_vnd",
    ]);

    return { query, countQuery };
  }

  mapStatisticalByServiceData(
    v: object[],
    year: number
  ): IFinanceStatisticalViaService[] {
    const months = Array.from(
      { length: 12 },
      (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`
    );
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const monthMap: Record<string, string> = months.reduce(
      (acc, month, index) => {
        acc[month] = monthNames[index];
        return acc;
      },
      {}
    );

    return v.map((item: any): IFinanceStatisticalViaService => {
      let statisticalMap: Record<string, IFinanceStatisticalDetail> = {};
      let summary: IFinanceStatisticalDetail = {
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: 0,
      };
      for (let i = 0; i < months.length; i++) {
        statisticalMap[monthMap[months[i]]] = {
          revenue: 0,
          cost: 0,
          profit: 0,
          profitMargin: 0,
        };
        for (let j = 0; j < item.months.length; j++) {
          if (item.months[j] !== months[i]) {
            continue;
          }
          statisticalMap[monthMap[item.months[j]]].revenue =
            parseFloat(item.sum_total_sales_vnd[j]) || 0; // Doanh thu
          statisticalMap[monthMap[item.months[j]]].cost =
            parseFloat(item.sum_total_origin_gv_acf_vnd[j]) || 0; // Chi phí
          statisticalMap[monthMap[item.months[j]]].profit =
            parseFloat(item.sum_total_origin_sales_vnd[j]) || 0; // Lợi nhuận
          statisticalMap[monthMap[item.months[j]]].profitMargin =
            statisticalMap[monthMap[item.months[j]]].revenue
              ? statisticalMap[monthMap[item.months[j]]].profit /
                statisticalMap[monthMap[item.months[j]]].revenue
              : 0; // Lợi nhuận / Doanh thu

          summary.revenue += statisticalMap[monthMap[item.months[j]]].revenue;
          summary.cost += statisticalMap[monthMap[item.months[j]]].cost;
          summary.profit += statisticalMap[monthMap[item.months[j]]].profit;
          break;
        }
      }

      summary.profitMargin = summary.revenue
        ? summary.profit / summary.revenue
        : 0;
      statisticalMap["summary"] = summary;

      return {
        serviceName: item.service_name,
        statistical: statisticalMap,
      };
    });
  }

  async statisticalByService(
    inputDto: StatisticalByServiceDto,
    payload: IJwtPayload
  ) {
    inputDto.year = inputDto.year ?? new Date().getFullYear();
    const { query, countQuery } = await this.getStatisticalByServiceQuery(
      inputDto,
      payload
    );
    const countRecords = await query.clone().select("count(*)").getRawOne();
    const sumValuesResult = await countQuery.execute();

    query.groupBy("cs.service_name").orderBy("cs.service_name", "DESC");

    const page = parseInt(inputDto.page, commonRadix) - 1;
    const pageSize = parseInt(inputDto.pageSize, commonRadix);
    if (page < 0 || pageSize < 1) {
      throw new BadRequestException();
    }
    const data = await query
      .limit(pageSize)
      .offset(page * pageSize)
      .execute();

    const result: ResponsePagination<any> = {
      data: data,
      pagination: {
        currentPage: page + 1,
        pageSize,
        totalPage: Math.ceil(countRecords.count / pageSize),
        totalCount: countRecords.count ?? 0,
      },
    };
    result.data = this.mapStatisticalByServiceData(
      result.data,
      inputDto.year ?? new Date().getFullYear()
    );

    return {
      ...result,
      sumValues: this.mapResponseToStatistical(sumValuesResult),
    };
  }

  async exportStatisticalByService(
    inputDto: StatisticalByServiceDto,
    payload: IJwtPayload
  ) {
    inputDto.year = inputDto.year ?? new Date().getFullYear();
    const { query } = await this.getStatisticalByServiceQuery(
      inputDto,
      payload
    );

    query.groupBy("cs.service_name").orderBy("cs.service_name", "DESC");

    const result = this.mapStatisticalByServiceData(
      await query.getRawMany(),
      inputDto.year
    );
    let data = [...ExportStatisticalViaServiceFileColumnName];
    data.push([]);
    result.forEach((item, index) => {
      data.push([
        String(index + 1),
        item.serviceName,
        this.parseAndFormat(item.statistical.jan.revenue), // t1
        this.parseAndFormat(item.statistical.jan.cost),
        this.parseAndFormat(item.statistical.jan.profit),
        this.parseAndFormatPercent(item.statistical.jan.profitMargin),
        this.parseAndFormat(item.statistical.feb.revenue), // t2
        this.parseAndFormat(item.statistical.feb.cost),
        this.parseAndFormat(item.statistical.feb.profit),
        this.parseAndFormatPercent(item.statistical.feb.profitMargin),
        this.parseAndFormat(item.statistical.mar.revenue), // t3
        this.parseAndFormat(item.statistical.mar.cost),
        this.parseAndFormat(item.statistical.mar.profit),
        this.parseAndFormatPercent(item.statistical.mar.profitMargin),
        this.parseAndFormat(item.statistical.apr.revenue), // t4
        this.parseAndFormat(item.statistical.apr.cost),
        this.parseAndFormat(item.statistical.apr.profit),
        this.parseAndFormatPercent(item.statistical.apr.profitMargin),
        this.parseAndFormat(item.statistical.may.revenue), // t5
        this.parseAndFormat(item.statistical.may.cost),
        this.parseAndFormat(item.statistical.may.profit),
        this.parseAndFormatPercent(item.statistical.may.profitMargin),
        this.parseAndFormat(item.statistical.jun.revenue), // t6
        this.parseAndFormat(item.statistical.jun.cost),
        this.parseAndFormat(item.statistical.jun.profit),
        this.parseAndFormatPercent(item.statistical.jun.profitMargin),
        this.parseAndFormat(item.statistical.jul.revenue), // t7
        this.parseAndFormat(item.statistical.jul.cost),
        this.parseAndFormat(item.statistical.jul.profit),
        this.parseAndFormatPercent(item.statistical.jul.profitMargin),
        this.parseAndFormat(item.statistical.aug.revenue), // t8
        this.parseAndFormat(item.statistical.aug.cost),
        this.parseAndFormat(item.statistical.aug.profit),
        this.parseAndFormatPercent(item.statistical.aug.profitMargin),
        this.parseAndFormat(item.statistical.sep.revenue), // t9
        this.parseAndFormat(item.statistical.sep.cost),
        this.parseAndFormat(item.statistical.sep.profit),
        this.parseAndFormatPercent(item.statistical.sep.profitMargin),
        this.parseAndFormat(item.statistical.oct.revenue), // t10
        this.parseAndFormat(item.statistical.oct.cost),
        this.parseAndFormat(item.statistical.oct.profit),
        this.parseAndFormatPercent(item.statistical.oct.profitMargin),
        this.parseAndFormat(item.statistical.nov.revenue), // t11
        this.parseAndFormat(item.statistical.nov.cost),
        this.parseAndFormat(item.statistical.nov.profit),
        this.parseAndFormatPercent(item.statistical.nov.profitMargin),
        this.parseAndFormat(item.statistical.dec.revenue), // t12
        this.parseAndFormat(item.statistical.dec.cost),
        this.parseAndFormat(item.statistical.dec.profit),
        this.parseAndFormatPercent(item.statistical.dec.profitMargin),
        this.parseAndFormat(item.statistical.summary.revenue), // summary
        this.parseAndFormat(item.statistical.summary.cost),
        this.parseAndFormat(item.statistical.summary.profit),
        this.parseAndFormatPercent(item.statistical.summary.profitMargin),
      ]);
    });

    // Add SUBTOTAL formulas to the sumRow
    const sumRowWithFormulas = [
      "Tổng",
      "",
      { t: "n", f: `SUBTOTAL(9, C4:C${result.length + 4})` }, // t1
      { t: "n", f: `SUBTOTAL(9, D4:D${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, E4:E${result.length + 4})` },
      { t: "n", f: `IF(C3=0, 0, (E3/C3)*100)` },
      { t: "n", f: `SUBTOTAL(9, G4:G${result.length + 4})` }, // t2
      { t: "n", f: `SUBTOTAL(9, H4:H${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, I4:I${result.length + 4})` },
      { t: "n", f: `IF(G3=0, 0, (I3/G3)*100)` },
      { t: "n", f: `SUBTOTAL(9, K4:K${result.length + 4})` }, // t3
      { t: "n", f: `SUBTOTAL(9, L4:L${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, M4:M${result.length + 4})` },
      { t: "n", f: `IF(K3=0, 0, (M3/K3)*100)` },
      { t: "n", f: `SUBTOTAL(9, O4:O${result.length + 4})` }, // t4
      { t: "n", f: `SUBTOTAL(9, P4:P${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, Q4:Q${result.length + 4})` },
      { t: "n", f: `IF(O3=0, 0, (Q3/O3)*100)` },
      { t: "n", f: `SUBTOTAL(9, S4:S${result.length + 4})` }, // t5
      { t: "n", f: `SUBTOTAL(9, T4:T${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, U4:U${result.length + 4})` },
      { t: "n", f: `IF(S3=0, 0, (U3/S3)*100)` },
      { t: "n", f: `SUBTOTAL(9, W4:W${result.length + 4})` }, // t6
      { t: "n", f: `SUBTOTAL(9, X4:X${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, Y4:Y${result.length + 4})` },
      { t: "n", f: `IF(W3=0, 0, (Y3/W3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AA4:AA${result.length + 4})` }, // t7
      { t: "n", f: `SUBTOTAL(9, AB4:AB${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AC4:AC${result.length + 4})` },
      { t: "n", f: `IF(AA3=0, 0, (AC3/AA3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AE4:AE${result.length + 4})` }, // t8
      { t: "n", f: `SUBTOTAL(9, AF4:AF${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AG4:AG${result.length + 4})` },
      { t: "n", f: `IF(AE3=0, 0, (AG3/AE3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AI4:AI${result.length + 4})` }, // t9
      { t: "n", f: `SUBTOTAL(9, AJ4:AJ${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AK4:AK${result.length + 4})` },
      { t: "n", f: `IF(AI3=0, 0, (AK3/AI3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AM4:AM${result.length + 4})` }, // t10
      { t: "n", f: `SUBTOTAL(9, AN4:AN${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AO4:AO${result.length + 4})` },
      { t: "n", f: `IF(AM3=0, 0, (AO3/AM3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AQ4:AQ${result.length + 4})` }, // t11
      { t: "n", f: `SUBTOTAL(9, AR4:AR${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AS4:AS${result.length + 4})` },
      { t: "n", f: `IF(AQ3=0, 0, (AS3/AQ3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AU4:AU${result.length + 4})` }, // t12
      { t: "n", f: `SUBTOTAL(9, AV4:AV${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, AW4:AW${result.length + 4})` },
      { t: "n", f: `IF(AU3=0, 0, (AW3/AU3)*100)` },
      { t: "n", f: `SUBTOTAL(9, AY4:AY${result.length + 4})` }, // summary
      { t: "n", f: `SUBTOTAL(9, AZ4:AZ${result.length + 4})` },
      { t: "n", f: `SUBTOTAL(9, BA4:BA${result.length + 4})` },
      { t: "n", f: `IF(AY3=0, 0, (BA3/AY3)*100)` },
    ] as any;
    data[2] = sumRowWithFormulas;

    const worksheet = xlsx.utils.aoa_to_sheet(data);
    const mergesRanges = [
      {
        s: { r: 2, c: 0 },
        e: { r: 2, c: 1 },
      },
      {
        s: { r: 0, c: 0 },
        e: { r: 1, c: 0 },
      },
      {
        s: { r: 0, c: 1 },
        e: { r: 1, c: 1 },
      },
    ];
    // merge statistical month
    for (let i = 0; i <= 12; i++) {
      mergesRanges.push({
        s: { r: 0, c: 2 + i * 4 },
        e: { r: 0, c: 5 + i * 4 },
      });
    }

    // Set column widths
    worksheet["!merges"] = mergesRanges;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Báo cáo");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    return {
      buffer,
      filename: `Report theo Dịch vụ ${inputDto.year}.xlsx`,
    };
  }

  // statistical revenue by customer
  async getStatisticalRevenueByCustomerQuery(
    inputDto: StatisticalRevenueByCustomerDto,
    payload: IJwtPayload
  ) {
    const { typeStatistical } = inputDto;
    let conditions = [],
      financeConvertFilter = [];
    let conditionsString = "",
      financeConvertFilterString = "";

    switch (typeStatistical) {
      case ETypeStatisticalRevenueCustomer.CUSTOMERS_NOT_ENTER_NETWORK:
        conditions.push(
          "cmr.sum_total_sales IS NULL OR cmr.sum_total_sales = 0"
        );
        break;

      case ETypeStatisticalRevenueCustomer.CUSTOMERS_SEND_REDUCTION:
        conditions.push(
          "(COALESCE(cmr.sum_total_sales, 0) - COALESCE(ptmar.avg_sales, 0) < 0)"
        );
        break;

      case ETypeStatisticalRevenueCustomer.CUSTOMERS_SEND_INCREASE:
        conditions.push(
          "(COALESCE(cmr.sum_total_sales, 0) - COALESCE(ptmar.avg_sales, 0) > 0)"
        );
        break;

      default:
        break;
    }
    conditionsString =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    if (
      payload.typeUser === ETypeUser.STAFF &&
      !payload.permissions.includes(EPermissionActionKey.REPORT_FOR_ACCOUNTING)
    ) {
      const staff = await this.staffService.getStaffByPayload(payload);
      financeConvertFilter.push(`fc.business_staff_id = '${staff.id}'`);
    }
    financeConvertFilterString =
      financeConvertFilter.length > 0
        ? `WHERE ${financeConvertFilter.join(" AND ")}`
        : "";

    const query = `
      WITH finance_convert AS (
        SELECT 
          fc.id as id,
          fc.booking_id as booking_id,
          fc.business_staff_id as business_staff_id,
          fc.total_sales AS sum_total_sales,
          CASE 
              WHEN fc.currency = 'USD' THEN fc.total_sales * mer.rate
              ELSE fc.total_sales
          END as total_sales
        FROM finance_cpn fc
        INNER JOIN ml_exchange_rates mer ON mer.id = fc.exchange_rate_id
        ${financeConvertFilterString}
      ),
      customer_revenues AS (
      SELECT 
        c.id AS id,
        TO_CHAR(cb.created_at, 'YYYY-MM') AS month,
        SUM(fc.total_sales) AS sum_total_sales
      FROM finance_convert fc 
      INNER JOIN booking b ON b.id = fc.booking_id 
      INNER JOIN customers c ON b.customer_id = c.id
      INNER JOIN pu_deliveries pu ON pu.booking_id = b.id
      INNER JOIN connect_bill cb ON cb.id = pu.connect_bill_id
      GROUP BY c.id, TO_CHAR(cb.created_at, 'YYYY-MM')
      ),
      current_month_revenues AS (
      SELECT 
        id,
        sum_total_sales
      FROM customer_revenues
      WHERE month = TO_CHAR($1::timestamp, 'YYYY-MM')
      ),
      previous_three_months_avg_revenues AS (
      SELECT 
        id,
        AVG(sum_total_sales) AS avg_sales
      FROM customer_revenues
      WHERE month BETWEEN TO_CHAR($1::timestamp - INTERVAL '3 MONTH', 'YYYY-MM') AND TO_CHAR($1::timestamp - INTERVAL '1 MONTH', 'YYYY-MM')
      GROUP BY id
      )
      SELECT
      cs.customer_code, 
      cs.full_name, 
      cs.open_date, 
      cs.created_at,
      cs.customer_group, 
      cs.unit_name, 
      cs.staff_name,
      cmr.sum_total_sales as total_current_month_sales,
      ptmar.avg_sales as avg_sales_last_3_months,
      array_agg(cs.month) AS months,
      array_agg(cs.sum_total_sales) AS sum_total_sales,
      cmr.sum_total_sales - ptmar.avg_sales AS total_diff_current_month_last_3_months
      FROM (
        SELECT 
          c.id AS id,
          c.customer_code, 
          c.full_name, 
          c.open_date, 
          c.created_at,
          c.customer_group, 
          u.name as unit_name, 
          CONCAT(s.staff_code, ' - ', s.full_name) AS staff_name,
          TO_CHAR(cb.created_at, 'YYYY-MM') AS month,
          SUM(fc.total_sales) AS sum_total_sales
        FROM finance_convert fc 
        INNER JOIN booking b ON b.id = fc.booking_id
        INNER JOIN pu_deliveries pu ON pu.booking_id = b.id
        INNER JOIN customers c ON b.customer_id = c.id
        INNER JOIN connect_bill cb ON cb.id = pu.connect_bill_id 
        LEFT JOIN units u ON u.id = c.unit_id
        LEFT JOIN staffs s ON fc.business_staff_id = s.id
        GROUP BY c.id, u.id, s.id, TO_CHAR(cb.created_at, 'YYYY-MM')
      ) AS cs
      LEFT JOIN current_month_revenues cmr ON cs.id = cmr.id
      LEFT JOIN previous_three_months_avg_revenues ptmar ON cs.id = ptmar.id
      ${conditionsString}
      GROUP BY cs.id, cs.customer_code, cs.full_name, cs.open_date, cs.created_at, cs.customer_group, cs.unit_name, cs.staff_name, cmr.sum_total_sales, ptmar.avg_sales
      ORDER BY cs.customer_code DESC
      `;

    const countQuery = `
      WITH finance_convert AS (
        SELECT 
          fc.id as id,
          fc.booking_id as booking_id,
          fc.business_staff_id as business_staff_id,
          fc.total_sales AS sum_total_sales,
          CASE 
              WHEN fc.currency = 'USD' THEN fc.total_sales * mer.rate
              ELSE fc.total_sales
          END as total_sales
        FROM finance_cpn fc
        INNER JOIN ml_exchange_rates mer ON mer.id = fc.exchange_rate_id
      ),
      customer_revenues AS (
      SELECT 
        c.id AS id,
        TO_CHAR(cb.created_at, 'YYYY-MM') AS month,
        SUM(fc.total_sales) AS sum_total_sales
      FROM finance_convert fc 
      INNER JOIN booking b ON b.id = fc.booking_id 
      INNER JOIN customers c ON b.customer_id = c.id
      INNER JOIN pu_deliveries pu ON pu.booking_id = b.id
      INNER JOIN connect_bill cb ON cb.id = pu.connect_bill_id 
      GROUP BY c.id, TO_CHAR(cb.created_at, 'YYYY-MM')
      ),
      current_month_revenues AS (
      SELECT 
        id,
        sum_total_sales
      FROM customer_revenues
      WHERE month = TO_CHAR($1::timestamp, 'YYYY-MM')
      ),
      previous_three_months_avg_revenues AS (
      SELECT 
        id,
        AVG(sum_total_sales) AS avg_sales
      FROM customer_revenues
      WHERE month BETWEEN TO_CHAR($1::timestamp - INTERVAL '3 MONTH', 'YYYY-MM') AND TO_CHAR($1::timestamp - INTERVAL '1 MONTH', 'YYYY-MM')
      GROUP BY id
      )
      SELECT
      COUNT(cs.customer_code)
      FROM (
      SELECT 
        c.id AS id,
        c.customer_code, 
        c.full_name, 
        c.open_date, 
        c.created_at,
        c.customer_group, 
        u.name as unit_name, 
        s.id as staff_id,
        CONCAT(s.staff_code, ' - ', s.full_name) AS staff_name,
        TO_CHAR(cb.created_at, 'YYYY-MM') AS month,
        SUM(fc.total_sales) AS sum_total_sales
      FROM finance_convert fc 
      INNER JOIN booking b ON b.id = fc.booking_id 
      INNER JOIN customers c ON b.customer_id = c.id
      INNER JOIN pu_deliveries pu ON pu.booking_id = b.id
      INNER JOIN connect_bill cb ON cb.id = pu.connect_bill_id 
      LEFT JOIN units u ON u.id = c.unit_id
      LEFT JOIN staffs s ON fc.business_staff_id = s.id
      GROUP BY c.id, u.id, s.id, TO_CHAR(cb.created_at, 'YYYY-MM')
      ) AS cs
      LEFT JOIN current_month_revenues cmr ON cs.id = cmr.id
      LEFT JOIN previous_three_months_avg_revenues ptmar ON cs.id = ptmar.id
      ${conditionsString}
      GROUP BY cs.id, cs.customer_code;
      `;

    return { query, countQuery };
  }

  mapStatisticalRevenueByCustomerData(
    v: object[],
    inputDto: StatisticalRevenueByCustomerDto
  ): any[] {
    const { month, year } = inputDto;
    const dateFilter = new Date(
      Date.UTC(year, month - 1, 1, 0, 0, 0) + 7 * 60 * 60 * 1000
    );
    const months = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(dateFilter);
      date.setMonth(dateFilter.getMonth() - i);

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    });

    return v.map((item: any) => {
      const revenueLastMonths = months.map((m) => {
        const idx = item.months.indexOf(m);
        return idx !== -1 ? item.sum_total_sales[idx] : 0;
      });

      const revenueLast3MonthsWithCurrentMonth =
        item.total_current_month_sales - item.avg_sales_last_3_months;
      return {
        customerCode: item.customer_code,
        customerName: item.full_name,
        salesName: item.staff_name,
        openDate: item.open_date,
        unitInfo: item.unit_name,
        customerGroup: ECustomerGroupMessage[item.customer_group],
        currentMonthRevenue: parseFloat(item.total_current_month_sales ?? 0),
        revenueMonthN1: revenueLastMonths[1],
        revenueMonthN2: revenueLastMonths[2],
        revenueMonthN3: revenueLastMonths[3],
        revenueMonthN4: revenueLastMonths[4],
        revenueMonthN5: revenueLastMonths[5],
        revenueMonthN6: revenueLastMonths[6],
        avgRevenueLast3Months: parseFloat(item.avg_sales_last_3_months ?? 0),
        revenueDecreased:
          revenueLast3MonthsWithCurrentMonth < 0
            ? -revenueLast3MonthsWithCurrentMonth
            : 0,
        revenueIncreased:
          revenueLast3MonthsWithCurrentMonth < 0
            ? 0
            : revenueLast3MonthsWithCurrentMonth,
      };
    });
  }

  async statisticalRevenueByCustomer(
    inputDto: StatisticalRevenueByCustomerDto,
    payload: IJwtPayload
  ) {
    const { month, year } = inputDto;
    inputDto.month = month ?? new Date().getMonth() + 1;
    inputDto.year = year ?? new Date().getFullYear();

    const startOfMonth = new Date(
      Date.UTC(year, month - 1, 1, 0, 0, 0) + 7 * 60 * 60 * 1000
    );
    let { query, countQuery } = await this.getStatisticalRevenueByCustomerQuery(
      inputDto,
      payload
    );

    const page = parseInt(inputDto.page, commonRadix) - 1;
    const pageSize = parseInt(inputDto.pageSize, commonRadix);
    if (page < 0 || pageSize < 1) {
      throw new BadRequestException();
    }
    const [data, countRecords] = await Promise.all([
      this.dataSource.query(
        query + `LIMIT ${pageSize} OFFSET ${page * pageSize}`,
        [startOfMonth]
      ),
      this.dataSource.query(countQuery, [startOfMonth]),
    ]);

    const result: ResponsePagination<any> = {
      data: this.mapStatisticalRevenueByCustomerData(data, inputDto),
      pagination: {
        currentPage: page + 1,
        pageSize,
        totalPage: Math.ceil(countRecords?.length / pageSize),
        totalCount: countRecords?.length ?? 0,
      },
    };

    return result;
  }

  async exportStatisticalRevenueByCustomer(
    inputDto: StatisticalRevenueByCustomerDto,
    payload: IJwtPayload
  ) {
    const { month, year } = inputDto;
    inputDto.month = month ?? new Date().getMonth() + 1;
    inputDto.year = year ?? new Date().getFullYear();
    const data = [...ExportStatisticalRevenueViaCustomerColumnName];
    const { query } = await this.getStatisticalRevenueByCustomerQuery(
      inputDto,
      payload
    );
    const startOfMonth = new Date(
      Date.UTC(year, month - 1, 1, 0, 0, 0) + 7 * 60 * 60 * 1000
    );
    const result = this.mapStatisticalRevenueByCustomerData(
      await this.dataSource.query(query, [startOfMonth]),
      inputDto
    );

    result.forEach((item, index) => {
      data.push([
        index + 1,
        item.customerCode,
        item.customerName,
        item.salesName,
        item.openDate,
        item.unitInfo,
        item.customerGroup,
        this.parseAndFormat(item.currentMonthRevenue),
        this.parseAndFormat(item.revenueMonthN1),
        this.parseAndFormat(item.revenueMonthN2),
        this.parseAndFormat(item.revenueMonthN3),
        this.parseAndFormat(item.revenueMonthN4),
        this.parseAndFormat(item.revenueMonthN5),
        this.parseAndFormat(item.revenueMonthN6),
        this.parseAndFormat(item.avgRevenueLast3Months),
        this.parseAndFormat(item.revenueDecreased),
        this.parseAndFormat(item.revenueIncreased),
      ]);
    });

    const worksheet = xlsx.utils.aoa_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Báo cáo");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    return {
      buffer,
      filename: `Report KH Không vào mạng và gửi giảm.xlsx`,
    };
  }
}
