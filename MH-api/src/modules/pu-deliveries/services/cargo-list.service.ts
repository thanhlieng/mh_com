import {
  ETemplateEmail,
  GetTemplateEmail,
} from "@constants/templates/get_template_email";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import dayjs from "dayjs";
import xlsx from "node-xlsx";
import ExcelJS from "exceljs";
import {
  BookingType,
  CommonResponse,
} from "src/common/constants/common.constants";
import { commonResponse } from "src/common/helper/common-response";
import { sendRawMessageToEmail } from "src/common/helper/helper";
import { formatNumberWithCommas } from "src/common/utils/util";
import { awsConfig } from "src/configs/configs.constants";
import IJwtPayload from "src/modules/auth/payloads/jwt-payload";
import { GenerateBillService } from "src/modules/bookings/services/generate-bill.service";
import { CustomerService } from "src/modules/customers/customers.service";
import { In, Repository } from "typeorm";
import { GetBookingPaidDto, GetCargoListDto } from "../dto/get-cargo-list.dto";
import { ImportCargoListFileDto } from "../dto/import-cargo-list-file.dto";
import { SendCargoListViaEmailDto } from "../dto/send-cargo-list-via-email.dto";
import { CargoListLogEntity } from "../entities/cargo-list-log.entity";
import { PuDeliveriesEntity } from "../entities/pu-deliveries.entity";
import {
  IBookingCargoList,
  ICargoListDataSendMail,
} from "../interface/cargo-list-data-send-mail.interface";
import { ICargoListData } from "../interface/cargo-list-data.interface";
import {
  CargoListError,
  ECurrency,
  TemplateCargoListFile,
} from "../pu-deliveries.constants";
import { FinanceStatisticalRepository } from "src/modules/finance-statistical/finance-statistical.repository";
import path from "path";

@Injectable()
export class CargoListService {
  constructor(
    @InjectRepository(PuDeliveriesEntity)
    private readonly puDeliveriesRepository: Repository<PuDeliveriesEntity>,
    @InjectRepository(CargoListLogEntity)
    private readonly cargoListLogRepository: Repository<CargoListLogEntity>,
    private readonly financeCPNRepository: FinanceStatisticalRepository,

    private readonly customerService: CustomerService,
    private readonly generateBillService: GenerateBillService
  ) {}

  async mappingCargoListData(data: any[][]): Promise<ICargoListData[]> {
    const result: ICargoListData[] = [];
    const bookingCodes: string[] = [];

    if (data.length <= 2) {
      return result;
    }
    for (let i = 2; i < data.length; i++) {
      bookingCodes.push(data[i][2]);
    }
    if (!bookingCodes.length) {
      return result;
    }

    // query get puDelivery ID
    const pdIds = await this.puDeliveriesRepository
      .createQueryBuilder("pd")
      .leftJoinAndMapOne(
        "pd.booking",
        "booking",
        "booking",
        "booking.id = pd.booking_id"
      )
      .leftJoinAndMapOne(
        "booking.customer",
        "customer",
        "customer",
        "customer.id = booking.customer_id"
      )
      .where("booking.booking_code IN (:...bookingCodes)", {
        bookingCodes: bookingCodes,
      })
      .select([
        "booking.booking_code as booking_code",
        "booking.partner_bill_code as partner_bill_code",
        "customer.customer_code as customer_code",
        "customer.full_name as customer_name",
        "booking.type as shipping_type",
        "booking.sender_country as sender_country",
        "booking.service as service",
        "pd.id as pd_id",
      ])
      .orderBy("booking.booking_code", "ASC")
      .addGroupBy("pd.id")
      .addGroupBy("booking.id")
      .addGroupBy("customer.id")
      .getRawMany();

    for (let i = 2; i < data.length; i++) {
      for (let j = 0; j < pdIds.length; j++) {
        if (data[i][2] === pdIds[j].booking_code) {
          result.push({
            id: pdIds[j].pd_id,
            bookingCode: pdIds[j].booking_code,
            partnerBillCode: pdIds[j].partner_bill_code,
            customerCode: pdIds[j].customer_code,
            customerName: pdIds[j].customer_name,
            businessStaff: data[i][6] || "",
            shippingType: pdIds[j].shipping_type,
            senderCountry: pdIds[j].sender_country,
            service: pdIds[j].service,
            billableWeight: data[i][10],
            priceUSD: data[i][11],
            priceVND: data[i][12],
            lkdPriceUSD: data[i][13],
            lkdPriceVND: data[i][14],
            totalPPUSD: data[i][15],
            totalPPVND: data[i][16],
            totalSellingPriceUSD: data[i][17],
            totalSellingPriceVND: data[i][18],
            PPXDUSD: data[i][19],
            PPXDVND: data[i][20],
            totalExternalPPUSD: data[i][21],
            totalExternalPPVND: data[i][22],
            totalSalesUSD: data[i][23],
            totalSalesVND: data[i][24],
            VATUSD: data[i][25],
            totalSalesIncludingVATUSD: data[i][26],
            VATVND: data[i][27],
            totalSalesIncludingVATVND: data[i][28],
          });
          break;
        } else if (pdIds[j].booking_code > data[i][2]) {
          break;
        }
      }
    }

    return result;
  }

  async importCargoListFile(importCargoListFileDto: ImportCargoListFileDto) {
    const { file } = importCargoListFileDto;

    if (!file) {
      throw new BadRequestException(CargoListError.CARGO_LIST_FILE_IS_REQUIRED);
    }
    const [{ data }] = xlsx.parse(file.buffer, {
      blankrows: false,
    });
    if (JSON.stringify(data[1]) !== JSON.stringify(TemplateCargoListFile)) {
      throw new BadRequestException(CargoListError.INVALID_CARGO_LIST_FILE);
    }
    const dataMapping = await this.mappingCargoListData(data as any);
    await Promise.all(
      dataMapping.map(async (pdUpdate) => {
        await this.puDeliveriesRepository.update(
          {
            id: pdUpdate.id,
          },
          pdUpdate
        );
      })
    );

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  async getCargoList(getCargoListDto: GetCargoListDto) {
    return this.customerService.getCargoList(getCargoListDto);
  }

  async getListBookingPaid(getBookingPaidDto: GetBookingPaidDto) {
    let { customerId, from, to, ids } = getBookingPaidDto;
    if (!from) {
      from = dayjs().startOf("month").format();
    }
    if (!to) {
      to = dayjs().endOf("month").format();
    }

    const query = this.financeCPNRepository
      .createQueryBuilder("fc")
      .leftJoin("booking", "booking", "booking.id = fc.booking_id")
      .leftJoin("pu_deliveries", "pd", "pd.booking_id = booking.id")
      .leftJoin("connect_bill", "cb", "cb.id = pd.connect_bill_id")
      .innerJoin("ml_exchange_rates", "mer", "mer.id = fc.exchange_rate_id")
      .select([
        "fc.id as id",
        "booking.booking_code",
        'booking.reference_code as reference_code',
        "booking.sender_name_vi as sender_name",
        "booking.sender_contact_person as sender_contact_person",
        "booking.receiver_name as receiver_name",
        "booking.receiver_contact_person as receiver_contact_person",
        "booking.customs_declaration_number as customs_declaration_number",
        "booking.receiver_country as destination",
        "booking.type as booking_type",
        "cb.created_at as created_at",
        "fc.billable_weight as billable_weight",
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.sales_price * mer.rate 
            ELSE fc.sales_price 
          END
        ) as price_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.sales_price / mer.rate 
            ELSE fc.sales_price 
          END
        ) as price_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.lkd_sales_price * mer.rate 
            ELSE fc.lkd_sales_price 
          END
        ) as lkd_price_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.lkd_sales_price / mer.rate 
            ELSE fc.lkd_sales_price 
          END
        ) as lkd_price_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.total_pp_price * mer.rate 
            ELSE fc.total_pp_price 
          END
        ) as total_pp_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.total_pp_price / mer.rate 
            ELSE fc.total_pp_price 
          END
        ) as total_pp_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.total_sales * mer.rate 
            ELSE fc.total_sales 
          END
        ) as total_sales_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.total_sales / mer.rate 
            ELSE fc.total_sales 
          END
        ) as total_sales_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.ppxd * mer.rate 
            ELSE fc.ppxd 
          END
        ) as ppxd_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.ppxd / mer.rate 
            ELSE fc.ppxd 
          END
        ) as ppxd_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.total_extend_pp * mer.rate 
            ELSE fc.total_extend_pp 
          END
        ) as total_external_pp_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.total_extend_pp / mer.rate 
            ELSE fc.total_extend_pp 
          END
        ) as total_external_pp_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.total_sales * mer.rate 
            ELSE fc.total_sales 
          END
        ) as total_sales_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.total_sales / mer.rate 
            ELSE fc.total_sales 
          END
        ) as total_sales_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.vat * mer.rate 
            ELSE fc.vat 
          END
        ) as vat_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.vat / mer.rate 
            ELSE fc.vat 
          END
        ) as vat_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.total_sales_vat * mer.rate 
            ELSE fc.total_sales_vat 
          END
        ) as total_sales_including_vat_vnd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'VND' THEN fc.total_sales_vat / mer.rate 
            ELSE fc.total_sales_vat 
          END
        ) as total_sales_including_vat_usd
        `,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.total_pp_price * mer.rate 
            ELSE fc.total_pp_price 
          END
        ) as total_pp_price
        `,
        "fc.last_sent as last_sent",
      ])
      .where("booking.customer_id = :customerId", {
        customerId: customerId,
      });

    query.andWhere("DATE(cb.created_at) BETWEEN :from AND :to", {
      from,
      to,
    });

    if (ids && ids.length) {
      query.andWhere("fc.id IN (:...ids)", {
        ids,
      });
    }

    query
      .orderBy("booking.booking_code", "ASC")
      .addGroupBy("booking.id")
      .addGroupBy("fc.id")
      .addGroupBy("cb.id");

    return query.getRawMany();
  }

  async mappingCargoListDataSendMail(
    sendCargoListViaEmailDto: SendCargoListViaEmailDto
  ): Promise<ICargoListDataSendMail> {
    let { customerId, ids, month, year, currency, from, to } =
      sendCargoListViaEmailDto;
    if (!month) {
      month = dayjs().get("month") + 1;
    }
    if (!year) {
      year = dayjs().get("year");
    }
    const day = dayjs().get("D");
    const customer = await this.customerService.findOne(customerId);
    const bookings = await this.getListBookingPaid({
      customerId,
      ids,
      from,
      to,
    });
    if (!bookings.length) {
      throw new BadRequestException(CargoListError.NOT_FOUND_ANY_BOOKING);
    }

    let totalBookingCargoList = {
      weight: 0,
      fare: 0,
      surcharge: 0,
      other_surcharge: 0,
      total: 0,
      secondary_currency_total: 0,
      total_pp_price: 0,
    };
    let exchange_rate = 0;
    let total_service_fee = 0;

    const bookingData = bookings.map((v, i): IBookingCargoList => {
      let booking: IBookingCargoList = {
        index: i + 1,
        created_at: dayjs(v.created_at).format("DD/MM/YYYY"),
        booking_code: v.booking_code,
        reference_code: v.reference_code || '',
        sender_name: v.sender_name,
        sender_contact_person: v.sender_contact_person,
        receiver_name: v.receiver_name,
        receiver_contact_person: v.receiver_contact_person,
        customs_declaration_number: v.customs_declaration_number || '',
        destination: v.destination,
        booking_type: v.booking_type === BookingType.COMMODITY ? "P" : "D",
        weight: parseFloat(v.billable_weight ?? 0),
        fare: parseFloat(v.price_usd ?? 0),
        surcharge: parseFloat(v.ppxd_usd ?? 0),
        other_surcharge: parseFloat(v.total_external_pp_usd ?? 0),
        total: parseFloat(v.total_sales_usd ?? 0),
        secondary_currency_total: parseFloat(v.total_sales_vnd ?? 0),
        total_pp_price: parseFloat(v.total_pp_price ?? 0),
      };

      switch (currency) {
        case ECurrency.USD:
          booking.fare = parseFloat(v.price_usd ?? 0);
          booking.surcharge = parseFloat(v.ppxd_usd ?? 0);
          booking.other_surcharge = parseFloat(v.total_external_pp_usd ?? 0);
          booking.total = parseFloat(v.total_sales_usd ?? 0);
          booking.secondary_currency_total = parseFloat(v.total_sales_vnd ?? 0);
          break;

        default:
          booking.fare = parseFloat(v.price_vnd ?? 0);
          booking.surcharge = parseFloat(v.ppxd_vnd ?? 0);
          booking.other_surcharge = parseFloat(v.total_external_pp_vnd ?? 0);
          booking.total = parseFloat(v.total_sales_vnd ?? 0);
          booking.secondary_currency_total = parseFloat(v.total_sales_usd ?? 0);
          break;
      }
      totalBookingCargoList.weight += Number(booking.weight ?? 0);
      totalBookingCargoList.fare += Number(booking.fare ?? 0);
      totalBookingCargoList.surcharge += Number(booking.surcharge ?? 0);
      totalBookingCargoList.other_surcharge += Number(
        booking.other_surcharge ?? 0
      );
      totalBookingCargoList.total += Number(booking.total ?? 0);
      totalBookingCargoList.secondary_currency_total += Number(
        booking.secondary_currency_total ?? 0
      );
      totalBookingCargoList.total_pp_price += Number(
        booking.total_pp_price ?? 0
      );

      return booking;
    });

    switch (currency) {
      case ECurrency.USD:
        exchange_rate =
          totalBookingCargoList.secondary_currency_total /
          totalBookingCargoList.total;
        total_service_fee = totalBookingCargoList.secondary_currency_total;
        break;

      default:
        exchange_rate =
          totalBookingCargoList.total /
          totalBookingCargoList.secondary_currency_total;
        total_service_fee = totalBookingCargoList.total;

        break;
    }

    total_service_fee = total_service_fee ?? 0;
    return {
      month,
      year,
      time_and_address: `Hà Nội, ngày ${day} tháng ${month} năm ${year}`,
      customer_name: customer.fullName,
      customer_address: customer.detailAddress,
      customer_contact_name: customer.contactPerson,
      phone_number: customer.phoneNumber,
      tax_number: customer.identifier,
      email: customer?.bookingEmail?.split(',') || [],
      customer_code: customer.customerCode,
      date_now: dayjs().format("DD/MM/YYYY"),
      currency,
      secondary_currency:
        currency === ECurrency.USD ? ECurrency.VND : ECurrency.USD,
      exchange_rate: formatNumberWithCommas(
        Number(exchange_rate ?? 0).toFixed(2)
      ),
      total_service_fee_first: formatNumberWithCommas(
        Number(
          currency === ECurrency.VND
            ? total_service_fee
            : total_service_fee / exchange_rate
        ).toFixed(2)
      ),
      tax_fee_first: formatNumberWithCommas(
        Number(
          currency === ECurrency.VND
            ? total_service_fee * 0.08
            : (total_service_fee * 0.08) / exchange_rate
        ).toFixed(2)
      ),
      total_pay_first: formatNumberWithCommas(
        Number(
          currency === ECurrency.VND
            ? total_service_fee * 1.08
            : (total_service_fee * 1.08) / exchange_rate
        ).toFixed(2)
      ),
      total_service_fee_second: formatNumberWithCommas(
        Number(
          currency === ECurrency.USD
            ? total_service_fee
            : total_service_fee / exchange_rate
        ).toFixed(2)
      ),
      tax_fee_second: formatNumberWithCommas(
        Number(
          currency === ECurrency.USD
            ? total_service_fee * 0.08
            : (total_service_fee * 0.08) / exchange_rate
        ).toFixed(2)
      ),
      total_pay_second: formatNumberWithCommas(
        Number(
          currency === ECurrency.USD
            ? total_service_fee * 1.08
            : (total_service_fee * 1.08) / exchange_rate
        ).toFixed(2)
      ),
      bookings: [...bookingData, totalBookingCargoList as IBookingCargoList],
      booking_data: "",
    };
  }

  async sendMailCargoList(data: ICargoListDataSendMail) {
    let bookingData = ``;
    for (let i = 0; i < data.bookings.length; i++) {
      bookingData += `
      <tr>
        <td>${data.bookings[i].index || ""}</td>
        <td style="width: 40px;">${data.bookings[i].created_at || ""}</td>
        <td>${data.bookings[i].booking_code || ""}</td>
        <td>${data.bookings[i].destination || ""}</td>
        <td>${data.bookings[i].booking_type || ""}</td>
        <td style="text-align: right">${
          data.bookings[i].weight.toFixed(2) || ""
        }</td>
        <td style="text-align: right">${formatNumberWithCommas(
          data.bookings[i].fare?.toFixed(2)
        )}</td>
        <td style="text-align: right">${formatNumberWithCommas(
          data.bookings[i].surcharge?.toFixed(2)
        )}</td>
        <td style="text-align: right">${formatNumberWithCommas(
          data.bookings[i].other_surcharge?.toFixed(2)
        )}</td>
        <td style="text-align: right">${formatNumberWithCommas(
          data.bookings[i].total?.toFixed(2)
        )}</td>
        <td style="text-align: right">${formatNumberWithCommas(
          data.bookings[i].secondary_currency_total?.toFixed(2)
        )}</td>
      </tr>
      `;
    }
    data.booking_data = bookingData;
    const template = GetTemplateEmail(
      ETemplateEmail.MAIL_SEND_CARGO_LIST,
      data
    );

    const pdfBuffer = await this.generateBillService.generateCargoListFile(template);
    const excelBuffer = await this.getExcelCargoList(data);

    const params = {
      from: awsConfig.emailSend,
      to: [...data.email, awsConfig.emailReceiveCargoList],
      subject: `MH Great Sun gửi bảng kê XHĐ T${data.month}.${data.year} (${data.customer_code})`,
      text: `
      Dear Anh/Chị Quý Khách hàng! 

        Kế toán MH Great Sun gửi Bảng kê cước tháng ${data.month}/${data.year} chốt hết ngày 25.${data.month}.${data.year}. 
        Anh/Chị vui lòng kiểm tra chốt bảng kê trước 17h ngày 28.${data.month}.${data.year} 
        Sau thời hạn trên nếu Quý khách không có thắc mắc và phản hồi mail về số liệu. Team chốt cước MH Great Sun sẽ xuất hóa đơn theo số liệu đã gửi ở bảng kê này!

      Team chốt cước MH Great Sun
    `,
      attachments: [
        {
          filename: `${data.customer_code} - ${data.customer_name} - T${data.month}.${data.year} ${data.date_now}.xlsx`,
          content: excelBuffer,
        },
        {
          filename: `${data.customer_code} - ${data.customer_name} - T${data.month}.${data.year} ${data.date_now}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    return sendRawMessageToEmail(params);
  }

  async saveLogSendCargoList(
    payload: IJwtPayload,
    customerId: string,
    month: number,
    year: number
  ) {
    await this.cargoListLogRepository.delete({
      customerId: customerId,
      month,
      year,
    });

    return this.cargoListLogRepository.save({
      customerId: customerId,
      userId: payload.id,
      month,
      year,
    });
  }

  async getExcelCargoList(data: ICargoListDataSendMail) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(
      path.join(
        __dirname +
          "../../../../../src/common/constants/templates/template_cargo_list.xlsx"
      )
    );
    const cargoListSheet = workbook.getWorksheet("Bảng kê");
    const referSheet = workbook.getWorksheet("Tham chiếu");

    /// Map Sheet Bảng kê
    const cellTableStyle = cargoListSheet.getCell("A17").style
    // Set row heights
    cargoListSheet.getRows(1, 28).forEach((row) => {
      row.height = 20;
    });
    cargoListSheet.getRow(16).height = 30;

    // set date time send cargo list
    cargoListSheet.getCell('A6').value = data.time_and_address
    cargoListSheet.getCell("G9").value = `Tháng ${data.month} năm ${data.year}`;

    // set customer info
    cargoListSheet.getCell("C11").value = data.customer_name.toUpperCase();
    cargoListSheet.getCell("C12").value = data.customer_address;
    cargoListSheet.getCell("C13").value = data.tax_number;
    cargoListSheet.getCell("C14").value = data.customer_code;

    // set column name
    const cellsToReplace = [
      { cell: "G16", placeholder: "{{currency}}", value: data.currency },
      { cell: "H16", placeholder: "{{currency}}", value: data.currency },
      { cell: "I16", placeholder: "{{currency}}", value: data.currency },
      { cell: "J16", placeholder: "{{currency}}", value: data.currency },
      { cell: "K16", placeholder: "{{currency}}", value: data.currency },
      { cell: "L16", placeholder: "{{secondary_currency}}", value: data.secondary_currency },
    ];
    cellsToReplace.forEach(({ cell, placeholder, value }) => {
      const currentValue = cargoListSheet.getCell(cell).value?.toString() || "";
      cargoListSheet.getCell(cell).value = currentValue.replace(placeholder, value);
    });

    // Add data rows starting from A17
    data.bookings.forEach((item, index) => {
      index !== data.bookings.length - 1 && cargoListSheet.insertRow(17 + index, []);

      const row = cargoListSheet.getRow(17 + index);

      const sttCell = row.getCell("A"); // STT 
      sttCell.style = cellTableStyle;
      sttCell.value = index === data.bookings.length - 1 ? "" : index + 1; 

      const dateCell = row.getCell("B"); // Ngày
      dateCell.style = cellTableStyle;
      dateCell.value = item.created_at;

      const bookingCodeCell = row.getCell("C"); // Số bill gốc
      bookingCodeCell.style = cellTableStyle;
      bookingCodeCell.value = item.booking_code || "";

      const destinationCell = row.getCell("D"); // Noi den
      destinationCell.style = cellTableStyle;
      destinationCell.value = item.destination || "";

      const bookingTypeCell = row.getCell("E"); // Loai hang
      bookingTypeCell.style = cellTableStyle;
      bookingTypeCell.value = item.booking_type || "";

      const weightCell = row.getCell("F"); // Trong luong
      weightCell.style = cellTableStyle;
      weightCell.value = formatNumberWithCommas(item.weight.toFixed(2));

      const fareCell = row.getCell("G"); // Tien cuoc
      fareCell.style = cellTableStyle;
      fareCell.value = formatNumberWithCommas(item.fare.toFixed(2));

      const totalPPPriceCell = row.getCell("H"); // Phu phi
      totalPPPriceCell.style = cellTableStyle;
      totalPPPriceCell.value = formatNumberWithCommas(item.total_pp_price.toFixed(2));

      const surchargeCell = row.getCell("I"); // Phu phi xang dau
      surchargeCell.style = cellTableStyle;
      surchargeCell.value = formatNumberWithCommas(item.surcharge.toFixed(2));

      const otherSurchargeCell = row.getCell("J"); // Phu phi khac
      otherSurchargeCell.style = cellTableStyle;
      otherSurchargeCell.value = formatNumberWithCommas(item.other_surcharge.toFixed(2));

      const totalCell = row.getCell("K"); // Tong tien
      totalCell.style = cellTableStyle;
      totalCell.value = formatNumberWithCommas(item.total.toFixed(2));

      const secondaryCurrencyTotalCell = row.getCell("L"); // Tong tien 2
      secondaryCurrencyTotalCell.style = cellTableStyle;
      secondaryCurrencyTotalCell.value = formatNumberWithCommas(item.secondary_currency_total.toFixed(2));

      const noteCell = row.getCell("M"); // Ghi chu
      noteCell.style = cellTableStyle;
      noteCell.value = "";
    });

    // summary data
    const startRowSummaryData = 17 + data.bookings.length;
    const summaryData = [
      { column: "K", rowOffset: 0, value: data.exchange_rate },
      { column: "L", rowOffset: 0, value: data.exchange_rate },
      { column: "K", rowOffset: 1, value: data.total_service_fee_first },
      { column: "L", rowOffset: 1, value: data.total_service_fee_second },
      { column: "K", rowOffset: 2, value: data.tax_fee_first },
      { column: "L", rowOffset: 2, value: data.tax_fee_second },
      { column: "K", rowOffset: 3, value: data.total_pay_first },
      { column: "L", rowOffset: 3, value: data.total_pay_second },
      { column: "C", rowOffset: 10, value: data.customer_code },
    ];
    summaryData.forEach(({ column, rowOffset, value }) => {
      cargoListSheet.getCell(`${column}${startRowSummaryData + rowOffset}`).value = value;
    });

    // Map Sheet Tham chiếu
    for(let i=0;i<data.bookings.length-1;i++){
      const booking = data.bookings[i]
      const bookingCodeCell = referSheet.getCell(`A${i+2}`);
      bookingCodeCell.value = booking.booking_code || "";
      bookingCodeCell.style = cellTableStyle;

      const referenceCodeCell = referSheet.getCell(`B${i+2}`);
      referenceCodeCell.value = booking.reference_code || "";
      referenceCodeCell.style = cellTableStyle;

      const customsDeclarationCell = referSheet.getCell(`C${i+2}`);
      customsDeclarationCell.value = booking.customs_declaration_number || "";
      customsDeclarationCell.style = cellTableStyle;

      const senderNameCell = referSheet.getCell(`D${i+2}`);
      senderNameCell.value = `${booking.sender_contact_person || ""} - ${booking.sender_name || ""}`;
      senderNameCell.style = cellTableStyle;

      const receiverNameCell = referSheet.getCell(`E${i+2}`);
      receiverNameCell.value = `${booking.receiver_contact_person || ""} - ${booking.receiver_name || ""}`;
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async sendCargoListViaEmail(
    sendCargoListViaEmailDto: SendCargoListViaEmailDto,
    payload: IJwtPayload
  ) {
    if (!sendCargoListViaEmailDto.month) {
      sendCargoListViaEmailDto.month = dayjs().get("month") + 1;
    }
    if (!sendCargoListViaEmailDto.year) {
      sendCargoListViaEmailDto.year = dayjs().get("year");
    }
    const data = await this.mappingCargoListDataSendMail(
      sendCargoListViaEmailDto
    );
    if (!data.email) {
      throw new BadRequestException(
        `Tài khoản khách hàng ${data.customer_code} không có email nhận bảng kê! Vui lòng kiểm tra lại`
      );
    }

    await Promise.all([
      this.sendMailCargoList(data),
      this.saveLogSendCargoList(
        payload,
        sendCargoListViaEmailDto.customerId,
        sendCargoListViaEmailDto.month,
        sendCargoListViaEmailDto.year
      ),
      this.financeCPNRepository.update(
        {
          id: In(sendCargoListViaEmailDto.ids),
        },
        {
          lastSent: new Date(),
        }
      ),
    ]);

    return commonResponse("Gửi bảng kê thành công", null);
  }
}
