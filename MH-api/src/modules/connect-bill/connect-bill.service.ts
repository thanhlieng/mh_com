import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import xlsx from 'node-xlsx';
import {
  BookingType,
  EExportForm,
  EStatusDeliveryAcftership,
  EStatusDeliveryMessage,
  ETransportationTypeVN,
  ETypePuDeliveryDetail,
} from 'src/common/constants/common.constants';
import { CommonPaginationRaw } from 'src/common/helper/common-pagination';
import { sendRawMessageToEmail } from 'src/common/helper/helper';
import { mapToPercent } from 'src/common/utils/util';
import { awsConfig, nodeEnvConfig } from 'src/configs/configs.constants';
import { SharePointService } from 'src/share-point/share-point.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import IJwtPayload, { IHistoryInfo } from '../auth/payloads/jwt-payload';
import { BookingService } from '../bookings/services/bookings.service';
import { getValueAddedService } from '../bookings/utils/mapping';
import { EVENT_CONST } from '../events/event.const';
import { HistoryAction, HistoryType, TargetTable } from '../history/history.const';
import { PUDeliveryRepository } from '../pu-deliveries/repositories/pu-deliveries.repository';
import { PuDeliveriesService } from '../pu-deliveries/services/pu-deliveries.service';
import { IService } from '../services-booking/interface/services.interface';
import { ServiceService } from '../services-booking/services.service';
import {
  connectBillColumnName,
  connectBillMultiParcelColumnName,
  connectBillMultiParcelOPColumnName,
  connectBillOPColumnName,
  OrderRemainingReportColumnName,
  PODReportColumnName,
} from './connect-bill.type';
import { CreateConnectBillDto } from './dto/create-connect-bill.dto';
import {
  GetAnalyticsPOD,
  GetAnalyticsPODResponse,
  GetOrderRemaining,
  GetOrderRemainingResponse,
  UpdateOrderRemaining,
} from './dto/get-analytic-pod.dto';
import { GetConnectBillDto } from './dto/get-connect-bill.dto';
import { ConnectBillEntity } from './entities/connect-bill.entity';
import { IConnectBill } from './interface/connect-bill.interface';
import { getStartDateAndEndDate } from 'src/common/utils/mapping';
import { StaffRepository } from '../staffs/staffs.repository';
var dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ConnectBillService {
  private mapStaffCode = new Map<string, string>();

  constructor(
    @InjectRepository(ConnectBillEntity)
    private readonly connectBillRepository: Repository<ConnectBillEntity>,
    private readonly puDeliveriesRepository: PUDeliveryRepository,
    private readonly staffRepository: StaffRepository,

    private readonly puDeliveryService: PuDeliveriesService,
    private readonly serviceBookingService: ServiceService,
    private readonly sharePointService: SharePointService,
    private readonly bookingService: BookingService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.refreshMappingStaff();
  }

  async refreshMappingStaff() {
    const staffs = await this.staffRepository.find();
    this.mapStaffCode.clear();
    staffs.forEach((staff) => {
      this.mapStaffCode.set(staff.id, `${staff.staffCode} - ${staff.fullName}`);
    });
  }

  async updateStatusTrackingBooking(bookingId: string) {
    if (!bookingId) return;
    await this.puDeliveryService.updateStatusDelivery(
      bookingId,
      EStatusDeliveryAcftership.InfoReceived,
      EStatusDeliveryMessage.pickup_partner,
    );
  }

  async sendConnectBillFileToEmail(bufferOP: any, filenameOP: string, buffer: any, filename: string) {
    const params = {
      from: awsConfig.emailSend,
      to: awsConfig.emailReceiveManifest,
      subject: `${nodeEnvConfig === 'develop' ? '[DEVELOP]' : ''} ${filename}`,
      text: filename,
      attachments: [
        {
          filename: filename,
          content: buffer,
        },
        {
          filename: filenameOP,
          content: bufferOP,
        },
      ],
    };

    return sendRawMessageToEmail(params);
  }

  async uploadFileToSharepoint(buffer: any, connectBill: IConnectBill) {
    await this.sharePointService.uploadFileToSharePoint(buffer, connectBill.id, 'acf');
  }

  mappingClassify(pudId: string, parentBookingManifestId: string): string {
    if (!parentBookingManifestId || pudId === parentBookingManifestId) {
      return 'Bưu gốc';
    }

    return 'Bưu phân chia';
  }

  async mappingDataOpExport(connectBill: IConnectBill, listDeliverie: any, connectService: IService[], service: IService) {
    const bulkyWeight = listDeliverie?.bulky_weight || 0;
    const weight = listDeliverie?.weight || 0;
    const valueAddedService = getValueAddedService(listDeliverie.dhl, listDeliverie.fedex, listDeliverie.ups);
    const specializedServices = [
      listDeliverie.value_added_service_1,
      listDeliverie.value_added_service_2,
      listDeliverie.value_added_service_3,
    ].filter(Boolean);

    return [
      dayjs(connectBill.flightTime).tz('asia/ho_chi_minh').format('DD-MM-YYYY'), // DATE
      connectBill.mawbCode, // 'MAWB',
      connectBill.flightCode, // 'HAWB',
      listDeliverie?.pud_type === BookingType.COMMODITY ? 'Hàng hóa' : 'Chứng từ', // Type
      this.mappingClassify(listDeliverie?.pud_id, listDeliverie?.pud_parent_booking_manifest_id), // Classify
      listDeliverie?.partner_bill_code || '', //'Tracking No'
      listDeliverie?.parent_partner_bill_code, // Separate parcels
      listDeliverie?.booking_code || '', //'Reference number',
      listDeliverie?.customer_code || '', //'Account',
      listDeliverie?.booking_sender_contact_person || '', //'Shipper',
      listDeliverie?.booking_sender_name_en || '', // 'Shipper Company',
      listDeliverie?.booking_sender_address_en || '', //'Shipper Add 1',
      '', // 'Shipper Add 2'
      '', // 'Shipper Add 3'
      listDeliverie?.booking_sender_town || '', // 'Shipper district',
      listDeliverie?.booking_sender_province || '', //'Shipper province',
      listDeliverie?.booking_sender_postal_code || '', // 'Shipper Postal Code',
      listDeliverie?.booking_sender_phone_number || '', // 'Shipper Tel',
      listDeliverie?.booking_sender_country || '', // 'Shipper Country',
      '', //'Other Tracking',
      listDeliverie?.booking_receiver_contact_person || '', //'Cnee',
      listDeliverie?.booking_receiver_name, //'Cnee Company',
      listDeliverie?.booking_receiver_address || '', // 'Cnee Add 1',
      '', // 'Cnee Add 2',
      '', //'Cnee Add 3',
      listDeliverie?.booking_receiver_town || '', // 'Cnee district',
      listDeliverie?.booking_receiver_province || '', // 'Cnee province',
      '', // 'Cnee Code',
      listDeliverie?.booking_receiver_postal_code || '', //'Cnee Postal Code',
      listDeliverie?.booking_receiver_phone_number || '', // 'Cnee Tel',
      listDeliverie?.booking_receiver_country || '', // 'Cnee Country',
      Math.max(weight, bulkyWeight).toFixed(2), //'CW',
      weight.toFixed(2), // NW
      bulkyWeight.toFixed(2), //'GW',
      listDeliverie?.total_box || 0, // Box Number
      listDeliverie?.pud_detail_longs?.length ? listDeliverie?.pud_detail_longs[0] : '', //'Length',
      listDeliverie?.pud_detail_width?.length ? listDeliverie.pud_detail_width[0] : '', // 'Width',
      listDeliverie?.pud_detail_height?.length ? listDeliverie.pud_detail_height[0] : '', //'Height',
      listDeliverie?.pud_content_detail_invoice || '', // 'Commodity',
      connectBill.exportForm === EExportForm.DIRECT ? 'Trực tiếp' : 'Gián tiếp', // 'Export form',
      ETransportationTypeVN[connectBill.transportationType] || '', // 'Transportation',
      service?.name || '', // 'Service',
      listDeliverie?.require_partner_service_name || '', //'Connection Service Request',
      listDeliverie?.service_partner_name || '', // 'Connection service',
      connectService.find((item) => item.id === connectBill.connectionPartnerId)?.name || '', // 'Connection partner',
      listDeliverie?.partner_bill_code_domestic || '', //Postal code of domestic service connection partner in Vietnam
      listDeliverie?.partner_service_domestic_name || '', //Domestic partner services
      listDeliverie?.manufacture_domestic || '', // Domestic Supplier
      listDeliverie?.partner_bill_code_foreign || '', // Overseas Partner Postal Code
      listDeliverie?.overseas_partner_services || '', // Overseas partner services
      listDeliverie?.manufacture_foreign || '', // Foreign Supplier
      listDeliverie?.type_of_payment || '', // Type of payment
      listDeliverie?.delivery_conditions || '', // Delivery conditions
      listDeliverie?.pud_note, // Note
      listDeliverie?.reference_code || '', // Mã bill đối tác tracking
      specializedServices.join('\n'), // Dịch vụ chuyên tuyến/ Dịch vụ khác
      valueAddedService.dhl, // Dịch vụ DHL
      valueAddedService.fedex, // Dịch vụ Fedex
      valueAddedService.ups, // Dịch vụ UPS
      await this.getBookingManagementStaff(listDeliverie?.sales_staff),// Nhân viên kinh doanh
      await this.getBookingManagementStaff(listDeliverie?.pu_staff ?? listDeliverie?.pickup_staff),// Nhân viên pick up (Nhận hàng)
      await this.getBookingManagementStaff(listDeliverie?.checkin_staff),// Nhân viên pick up (Check in)
      await this.getBookingManagementStaff(listDeliverie?.checkout_staff),// Nhân viên vận hành (Check out)
      await this.getBookingManagementStaff(listDeliverie?.manifest_staff),// Nhân viên vận hành (Xuất Manifest)
    ];
  }

  async getBookingManagementStaff(staffID: string, isRefreshed?: boolean): Promise<string> {
    if (staffID){
      const staffCode = this.mapStaffCode.get(staffID)
      if (!isRefreshed && !staffCode) {
        await this.refreshMappingStaff()
        return this.getBookingManagementStaff(staffCode, true)
      }

      return staffCode
    }

    return '';
  }

  async mappingDataExport(
    connectBill: IConnectBill,
    listDeliverie: any,
    connectService: IService[],
    service: IService,
  ) {
    const bulkyWeight = listDeliverie.bulky_weight || 0;
    const weight = listDeliverie.weight || 0;

    const valueAddedService = getValueAddedService(listDeliverie.dhl, listDeliverie.fedex, listDeliverie.ups);
    const specializedServices = [
      listDeliverie.value_added_service_1,
      listDeliverie.value_added_service_2,
      listDeliverie.value_added_service_3,
    ].filter(Boolean);

    return [
      dayjs(connectBill.flightTime).tz('asia/ho_chi_minh').format('DD-MM-YYYY'), // DATE
      connectBill.mawbCode, // 'MAWB',
      connectBill.flightCode, // 'HAWB',
      listDeliverie?.pud_type === BookingType.COMMODITY ? 'Hàng hóa' : 'Chứng từ', // Type
      listDeliverie?.partner_bill_code || '', //'Tracking No'
      listDeliverie?.booking_code || '', //'Reference number',
      listDeliverie?.customer_code || '', //'Account',
      listDeliverie?.booking_sender_contact_person || '', //'Shipper',
      listDeliverie?.booking_sender_name_en || '', // 'Shipper Company',
      listDeliverie?.booking_sender_address_en || '', //'Shipper Add 1',
      '', // 'Shipper Add 2'
      '', // 'Shipper Add 3'
      listDeliverie?.booking_sender_town || '', // 'Shipper district',
      listDeliverie?.booking_sender_province || '', //'Shipper province',
      listDeliverie?.booking_sender_postal_code || '', // 'Shipper Postal Code',
      listDeliverie?.booking_sender_phone_number || '', // 'Shipper Tel',
      listDeliverie?.booking_sender_country || '', // 'Shipper Country',
      '', //'Other Tracking',
      listDeliverie?.booking_receiver_contact_person || '', //'Cnee',
      listDeliverie?.booking_receiver_name, //'Cnee Company',
      listDeliverie?.booking_receiver_address || '', // 'Cnee Add 1',
      '', // 'Cnee Add 2',
      '', //'Cnee Add 3',
      listDeliverie?.booking_receiver_town || '', // 'Cnee district',
      listDeliverie?.booking_receiver_province || '', // 'Cnee province',
      '', // 'Cnee Code',
      listDeliverie?.booking_receiver_postal_code || '', //'Cnee Postal Code',
      listDeliverie?.booking_receiver_phone_number || '', // 'Cnee Tel',
      listDeliverie?.booking_receiver_country || '', // 'Cnee Country',
      Math.max(weight, bulkyWeight).toFixed(2), //'CW',
      weight.toFixed(2), // NW
      bulkyWeight.toFixed(2), //'GW',
      listDeliverie?.total_box || 0, // Box Number
      listDeliverie?.pud_detail_longs?.length ? listDeliverie?.pud_detail_longs[0] : '', //'Length',
      listDeliverie.pud_detail_width?.length ? listDeliverie.pud_detail_width[0] : '', // 'Width',
      listDeliverie.pud_detail_height?.length ? listDeliverie.pud_detail_height[0] : '', //'Height',
      listDeliverie?.pud_content_detail_invoice || '', // 'Commodity',
      connectBill.exportForm === EExportForm.DIRECT ? 'Trực tiếp' : 'Gián tiếp', // 'Export form',
      ETransportationTypeVN[connectBill.transportationType] || '', // 'Transportation',
      service?.name || '', // 'Service',
      listDeliverie?.require_partner_service_name || '', //'Connection Service Request',
      listDeliverie?.service_partner_name || '', // 'Connection service',
      connectService.find((item) => item.id === connectBill.connectionPartnerId)?.name || '', // 'Connection partner',
      listDeliverie?.partner_bill_code_domestic || '', //Postal code of domestic service connection partner in Vietnam
      listDeliverie?.partner_service_domestic_name || '', //Domestic partner services
      listDeliverie?.manufacture_domestic || '', // Domestic Supplier
      listDeliverie?.partner_bill_code_foreign || '', // Overseas Partner Postal Code
      listDeliverie?.overseas_partner_services || '', // Overseas partner services
      listDeliverie?.manufacture_foreign || '', // Foreign Supplier
      listDeliverie?.type_of_payment || '', // Type of payment
      listDeliverie?.delivery_conditions || '', // Delivery conditions
      listDeliverie?.pud_note, // Note
      listDeliverie?.reference_code || '', // Mã bill đối tác tracking
      specializedServices.join('\n'), // Dịch vụ chuyên tuyến/ Dịch vụ khác
      valueAddedService.dhl, // Dịch vụ DHL
      valueAddedService.fedex, // Dịch vụ Fedex
      valueAddedService.ups, // Dịch vụ UPS
      await this.getBookingManagementStaff(listDeliverie?.sales_staff),// Nhân viên kinh doanh
      await this.getBookingManagementStaff(listDeliverie?.pu_staff ?? listDeliverie?.pickup_staff),// Nhân viên pick up (Nhận hàng)
      await this.getBookingManagementStaff(listDeliverie?.checkin_staff),// Nhân viên pick up (Check in)
      await this.getBookingManagementStaff(listDeliverie?.checkout_staff),// Nhân viên vận hành (Check out)
      await this.getBookingManagementStaff(listDeliverie?.manifest_staff),// Nhân viên vận hành (Xuất Manifest)
    ];
  }

  async createConnectBill(
    createConnectBillDto: CreateConnectBillDto, 
    info: IHistoryInfo,
    payload: IJwtPayload,
  ) {
    const { itemDeliveries, serviceId, partnerId } = createConnectBillDto;
    const [connectBill, connectService, service, partner] = await Promise.all([
      this.connectBillRepository.save(createConnectBillDto),
      this.serviceBookingService.findConnectServicePartner(),
      this.serviceBookingService.findOne({
        where: {
          id: serviceId,
        },
      }),
      this.serviceBookingService.findOne({
        where: {
          id: partnerId,
        },
      }),
    ]);
    await this.puDeliveryService.updateConnectBillId(payload, itemDeliveries, connectBill.id);

    const [listDeliveries, listDeliveriesPickUP] = await Promise.all([
      this.puDeliveryService.getListDeliveriesConnectBill(connectBill.id, ETypePuDeliveryDetail.OP),
      this.puDeliveryService.getListDeliveriesConnectBill(connectBill.id, ETypePuDeliveryDetail.PICKUP),
    ]);

    let data = [[...connectBillOPColumnName]];
    let dataPickUP = [[...connectBillColumnName]];
    const bookingIdsHandle = [];

    for (let i = 0; i < listDeliveries.length; i++) {
      this.updateStatusTrackingBooking(listDeliveries[i]?.booking_id);
      const dataMapping = await this.mappingDataOpExport(connectBill, listDeliveries[i], connectService, service)
      data.push([i + 1, ...dataMapping]);
      bookingIdsHandle.push(listDeliveries[i].booking_id);
    }
    await this.bookingService.linkBookingsDataToAftership(bookingIdsHandle);

    for (let i = 0; i < listDeliveriesPickUP.length; i++) {
      const mappingData = await this.mappingDataExport(connectBill, listDeliveries[i], connectService, service);
      dataPickUP.push([i + 1, ...mappingData]);
    }

    const buffer = xlsx.build([{ name: 'Booking', data: data, options: null }]);
    const bufferPickUp = xlsx.build([{ name: 'Booking', data: dataPickUP, options: null }]);

    const filename = `MANIFEST - ${service.name || ''} - ${partner.name} - ${
      connectService.find((item) => item.id === connectBill.connectionPartnerId)?.name || ''
    } - ${dayjs().tz('asia/ho_chi_minh').format('YYYY/MM/DD HH:mm')}.xlsx`;
    const filenamePU = `MANIFEST - PICKUP - ${service.name || ''} - ${partner.name} - ${
      connectService.find((item) => item.id === connectBill.connectionPartnerId)?.name || ''
    } - ${dayjs().tz('asia/ho_chi_minh').format('YYYY/MM/DD HH:mm')}.xlsx`;

    await this.sendConnectBillFileToEmail(buffer, filename, bufferPickUp, filenamePU);

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Operate,
      action: HistoryAction.Create,
      newItem: connectBill,
      recordId: null,
      targetTable: TargetTable.Customers,
    });

    return {
      buffer,
      filename,
    };
  }

  async exportConnectBillPickup(getConnectBilLDto: GetConnectBillDto) {
    const { from, to } = getConnectBilLDto;
    const { startDate, endDate } = getStartDateAndEndDate(from, to);

    const query = this.connectBillRepository.createQueryBuilder();
    query.where('DATE(created_at) BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
    const connectBills = await query.getMany();

    let row = 1;
    let data = [[...connectBillColumnName]];

    const connectService = await this.serviceBookingService.findConnectServicePartner();
    for (let i = 0; i < connectBills.length; i++) {
      const [service, listDeliveries] = await Promise.all([
        this.serviceBookingService.findOne({
          where: {
            id: connectBills[i].serviceId,
          },
        }),
        this.puDeliveryService.getListDeliveriesConnectBill(connectBills[i].id),
      ]);

      for (let j = 0; j < listDeliveries.length; j++) {
        const mappingData = await this.mappingDataExport(connectBills[i], listDeliveries[j], connectService, service);
        data.push([row, ...mappingData]);
        row++;
      }
    }

    const buffer = xlsx.build([{ name: 'MANIFEST', data: data, options: null }]);
    const filename = `MANIFEST - DỊCH VỤ KẾT NỐI - ĐỐI TÁC KẾT NỐI.xlsx`;

    return {
      buffer,
      filename,
    };
  }

  async exportAllWithOp(getConnectBilLDto: GetConnectBillDto) {
    const { from, to } = getConnectBilLDto;
    const { startDate, endDate } = getStartDateAndEndDate(from, to);

    const query = this.connectBillRepository.createQueryBuilder();
    query.where('DATE(created_at) BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
    const connectBills = await query.getMany();

    let row = 1;
    let data = [[...connectBillOPColumnName]];

    const connectService = await this.serviceBookingService.findConnectServicePartner();
    for (let i = 0; i < connectBills.length; i++) {
      const [service, listDeliveries] = await Promise.all([
        this.serviceBookingService.findOne({
          where: {
            id: connectBills[i].serviceId,
          },
        }),
        this.puDeliveryService.getListDeliveriesConnectBill(connectBills[i].id, ETypePuDeliveryDetail.OP),
      ]);

      for (let j = 0; j < listDeliveries.length; j++) {
        const dataMapping = await this.mappingDataOpExport(connectBills[i], listDeliveries[j], connectService, service)
        data.push([row, ...dataMapping]);
        row++;
      }
    }

    const buffer = xlsx.build([{ name: 'MANIFEST', data: data, options: null }]);
    const filename = `MANIFEST - DỊCH VỤ KẾT NỐI - ĐỐI TÁC KẾT NỐI - OP.xlsx`;

    return {
      buffer,
      filename,
    };
  }

  async mappingDataMultiParcelOPExport(
    id: number,
    connectBill: IConnectBill,
    listDeliverie: any,
    connectService: IService[],
    service: IService,
  ) {
    const bulkyWeight = listDeliverie?.bulky_weight || 0;
    const weight = listDeliverie?.weight || 0;
    const valueAddedService = getValueAddedService(listDeliverie.dhl, listDeliverie.fedex, listDeliverie.ups);
    const specializedServices = [
      listDeliverie.value_added_service_1,
      listDeliverie.value_added_service_2,
      listDeliverie.value_added_service_3,
    ].filter(Boolean);

    const data = [];
    let emptyData;
    for (let i = 0; i < listDeliverie?.pud_detail_longs?.length; i++) {
      data.push([
        emptyData || id, // 'STT'
        emptyData || dayjs(connectBill.flightTime).tz('asia/ho_chi_minh').format('DD-MM-YYYY'), // DATE
        emptyData || connectBill.mawbCode, // 'MAWB',
        emptyData || connectBill.flightCode, // 'HAWB',
        emptyData || listDeliverie?.pud_type === BookingType.COMMODITY ? 'Hàng hóa' : 'Chứng từ', // Type
        emptyData || this.mappingClassify(listDeliverie?.pud_id, listDeliverie?.pud_parent_booking_manifest_id), // Classify
        emptyData || listDeliverie?.partner_bill_code || '', //'Tracking No'
        emptyData || listDeliverie?.parent_partner_bill_code, // Separate parcels
        emptyData || listDeliverie?.booking_code || '', //'Reference number',
        emptyData || listDeliverie?.customer_code || '', //'Account',
        emptyData || listDeliverie?.booking_sender_contact_person || '', //'Shipper',
        emptyData || listDeliverie?.booking_sender_name_en || '', // 'Shipper Company',
        emptyData || listDeliverie?.booking_sender_address_en || '', //'Shipper Add 1',
        '', // 'Shipper Add 2'
        '', // 'Shipper Add 3'
        emptyData || listDeliverie?.booking_sender_town || '', // 'Shipper district',
        emptyData || listDeliverie?.booking_sender_province || '', //'Shipper province',
        emptyData || listDeliverie?.booking_sender_postal_code || '', // 'Shipper Postal Code',
        emptyData || listDeliverie?.booking_sender_phone_number || '', // 'Shipper Tel',
        emptyData || listDeliverie?.booking_sender_country || '', // 'Shipper Country',
        '', //'Other Tracking',
        emptyData || listDeliverie?.booking_receiver_contact_person || '', //'Cnee',
        emptyData || listDeliverie?.booking_receiver_name, //'Cnee Company',
        emptyData || listDeliverie?.booking_receiver_address || '', // 'Cnee Add 1',
        '', // 'Cnee Add 2',
        '', //'Cnee Add 3',
        emptyData || listDeliverie?.booking_receiver_town || '', // 'Cnee district',
        emptyData || listDeliverie?.booking_receiver_province || '', // 'Cnee province',
        '', // 'Cnee Code',
        emptyData || listDeliverie?.booking_receiver_postal_code || '', //'Cnee Postal Code',
        emptyData || listDeliverie?.booking_receiver_phone_number || '', // 'Cnee Tel',
        emptyData || listDeliverie?.booking_receiver_country || '', // 'Cnee Country',
        emptyData || Math.max(weight, bulkyWeight).toFixed(2), //'CW',
        emptyData || weight.toFixed(2), // NW
        emptyData || bulkyWeight.toFixed(2), //'GW',
        emptyData || listDeliverie?.total_box || 0, // Box Number
        listDeliverie?.pud_detail_longs[i] || '', //'Length',
        listDeliverie.pud_detail_width[i] || '', // 'Width',
        listDeliverie.pud_detail_height[i] || '', //'Height',
        listDeliverie.pud_detail_quantity[i] || '', //'Box',
        Math.max(listDeliverie.pud_detail_weight[i], listDeliverie.pud_detail_bulky_weight[i]).toFixed(2), //'CW-Box',
        listDeliverie.pud_detail_weight[i]?.toFixed(2), // 'NW-Box',
        listDeliverie.pud_detail_bulky_weight[i]?.toFixed(2), //'GW-Box',
        emptyData || listDeliverie?.pud_content_detail_invoice || '', // 'Commodity',
        emptyData || connectBill.exportForm === EExportForm.DIRECT ? 'Trực tiếp' : 'Gián tiếp', // 'Export form',
        emptyData || ETransportationTypeVN[connectBill.transportationType] || '', // 'Transportation',
        emptyData || service?.name || '', // 'Service',
        emptyData || listDeliverie?.require_partner_service_name || '', //'Connection Service Request',
        emptyData || listDeliverie?.service_partner_name || '', // 'Connection service',
        emptyData || connectService.find((item) => item.id === connectBill.connectionPartnerId)?.name || '', // 'Connection partner',
        emptyData || listDeliverie?.partner_bill_code_domestic || '', //Postal code of domestic service connection partner in Vietnam
        emptyData || listDeliverie?.partner_service_domestic_name || '', //Domestic partner services
        emptyData || listDeliverie?.manufacture_domestic || '', // Domestic Supplier
        emptyData || listDeliverie?.partner_bill_code_foreign || '', // Overseas Partner Postal Code
        emptyData || listDeliverie?.overseas_partner_services || '', // Overseas partner services
        emptyData || listDeliverie?.manufacture_foreign || '', // Foreign Supplier
        emptyData || listDeliverie?.type_of_payment || '', // Type of payment
        emptyData || listDeliverie?.delivery_conditions || '', // Delivery conditions
        emptyData || listDeliverie?.pud_note, // Note
        emptyData || listDeliverie?.reference_code || '', // Mã bill đối tác tracking
        emptyData || specializedServices.join('\n'), // Dịch vụ chuyên tuyến/ Dịch vụ khác
        emptyData || valueAddedService.dhl, // Dịch vụ DHL
        emptyData || valueAddedService.fedex, // Dịch vụ Fedex
        emptyData || valueAddedService.ups, // Dịch vụ UPS
        emptyData || await this.getBookingManagementStaff(listDeliverie?.sales_staff),// Nhân viên kinh doanh
        emptyData || await this.getBookingManagementStaff(listDeliverie?.pu_staff ?? listDeliverie?.pickup_staff),// Nhân viên pick up (Nhận hàng)
        emptyData || await this.getBookingManagementStaff(listDeliverie?.checkin_staff),// Nhân viên pick up (Check in)
        emptyData || await this.getBookingManagementStaff(listDeliverie?.checkout_staff),// Nhân viên vận hành (Check out)
        emptyData || await this.getBookingManagementStaff(listDeliverie?.manifest_staff),// Nhân viên vận hành (Xuất Manifest)
      ]);
      emptyData = '';
    }

    return data;
  }

  async exportMultiParcelOP(getConnectBilLDto: GetConnectBillDto) {
    const { from, to } = getConnectBilLDto;
    const { startDate, endDate } = getStartDateAndEndDate(from, to);

    const query = this.connectBillRepository.createQueryBuilder();
    query.where('DATE(created_at) BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
    const connectBills = await query.getMany();

    let row = 1;
    let id = 1;
    let data = [[...connectBillMultiParcelOPColumnName]];
    const ranges = [];
    const listColumnExcludeMerge = [36, 37, 38, 39, 40, 41, 42];

    const connectService = await this.serviceBookingService.findConnectServicePartner();
    for (let i = 0; i < connectBills.length; i++) {
      const [service, listDeliveries] = await Promise.all([
        this.serviceBookingService.findOneById(connectBills[i].serviceId),
        this.puDeliveryService.getListDeliveriesConnectBill(connectBills[i].id, ETypePuDeliveryDetail.OP),
      ]);

      for (let j = 0; j < listDeliveries.length; j++) {
        const dataMapping = await this.mappingDataMultiParcelOPExport(id, connectBills[i], listDeliveries[j], connectService, service)
        data.push(
          ...dataMapping,
        );

        for (let k = 0; k < connectBillMultiParcelOPColumnName.length; k++) {
          if (!listColumnExcludeMerge.includes(k) && listDeliveries[j]?.pud_detail_height?.length > 1) {
            ranges.push({
              s: { c: k, r: row },
              e: { c: k, r: row + (listDeliveries[j]?.pud_detail_height?.length ?? 1) - 1 },
            });
          }
        }

        row += listDeliveries[j]?.pud_detail_height?.length ?? 1;
        id++;
      }
    }

    const sheetOptions = { '!merges': ranges };
    const buffer = xlsx.build([{ name: 'MANIFEST', data: data, options: sheetOptions }]);
    const filename = `MANIFEST - DỊCH VỤ KẾT NỐI - ĐỐI TÁC KẾT NỐI - ĐƠN NHIỀU KIỆN OP.xlsx`;

    return {
      buffer,
      filename,
    };
  }

  async mappingDataMultiParcelPickupExport(
    id: number,
    connectBill: IConnectBill,
    listDeliverie: any,
    connectService: IService[],
    service: IService,
  ): Promise<any[][]> {
    const bulkyWeight = listDeliverie?.bulky_weight || 0;
    const weight = listDeliverie?.weight || 0;
    const valueAddedService = getValueAddedService(listDeliverie.dhl, listDeliverie.fedex, listDeliverie.ups);
    const specializedServices = [
      listDeliverie.value_added_service_1,
      listDeliverie.value_added_service_2,
      listDeliverie.value_added_service_3,
    ].filter(Boolean);

    const data = [];
    let emptyData;
    for (let i = 0; i < listDeliverie?.pud_detail_longs?.length; i++) {
      data.push([
        emptyData || id, // STT
        emptyData || dayjs(connectBill.flightTime).tz('asia/ho_chi_minh').format('DD-MM-YYYY'), // DATE
        emptyData || connectBill.mawbCode, // 'MAWB',
        emptyData || connectBill.flightCode, // 'HAWB',
        emptyData || listDeliverie?.pud_type === BookingType.COMMODITY ? 'Hàng hóa' : 'Chứng từ', // Type
        emptyData || listDeliverie?.partner_bill_code || '', //'Tracking No'
        emptyData || listDeliverie?.booking_code || '', //'Reference number',
        emptyData || listDeliverie?.customer_code || '', //'Account',
        emptyData || listDeliverie?.booking_sender_contact_person || '', //'Shipper',
        emptyData || listDeliverie?.booking_sender_name_en || '', // 'Shipper Company',
        emptyData || listDeliverie?.booking_sender_address_en || '', //'Shipper Add 1',
        '', // 'Shipper Add 2'
        '', // 'Shipper Add 3'
        emptyData || listDeliverie?.booking_sender_town || '', // 'Shipper district',
        emptyData || listDeliverie?.booking_sender_province || '', //'Shipper province',
        emptyData || listDeliverie?.booking_sender_postal_code || '', // 'Shipper Postal Code',
        emptyData || listDeliverie?.booking_sender_phone_number || '', // 'Shipper Tel',
        emptyData || listDeliverie?.booking_sender_country || '', // 'Shipper Country',
        '', //'Other Tracking',
        emptyData || listDeliverie?.booking_receiver_contact_person || '', //'Cnee',
        emptyData || listDeliverie?.booking_receiver_name, //'Cnee Company',
        emptyData || listDeliverie?.booking_receiver_address || '', // 'Cnee Add 1',
        '', // 'Cnee Add 2',
        '', //'Cnee Add 3',
        emptyData || listDeliverie?.booking_receiver_town || '', // 'Cnee district',
        emptyData || listDeliverie?.booking_receiver_province || '', // 'Cnee province',
        '', // 'Cnee Code',
        emptyData || listDeliverie?.booking_receiver_postal_code || '', //'Cnee Postal Code',
        emptyData || listDeliverie?.booking_receiver_phone_number || '', // 'Cnee Tel',
        emptyData || listDeliverie?.booking_receiver_country || '', // 'Cnee Country',
        emptyData || Math.max(weight, bulkyWeight).toFixed(2), //'CW',
        emptyData || weight.toFixed(2), // NW
        emptyData || bulkyWeight.toFixed(2), //'GW',
        emptyData || listDeliverie?.total_box || 0, // Box Number
        listDeliverie?.pud_detail_longs[i] || '', //'Length',
        listDeliverie.pud_detail_width[i] || '', // 'Width',
        listDeliverie.pud_detail_height[i] || '', //'Height',
        listDeliverie.pud_detail_quantity[i] || '', //'Box',
        Math.max(listDeliverie.pud_detail_weight[i], listDeliverie.pud_detail_bulky_weight[i]).toFixed(2), //'CW-Box',
        listDeliverie.pud_detail_weight[i]?.toFixed(2), // 'NW-Box',
        listDeliverie.pud_detail_bulky_weight[i]?.toFixed(2), //'GW-Box',
        emptyData || listDeliverie?.pud_content_detail_invoice || '', // 'Commodity',
        emptyData || connectBill.exportForm === EExportForm.DIRECT ? 'Trực tiếp' : 'Gián tiếp', // 'Export form',
        emptyData || ETransportationTypeVN[connectBill.transportationType] || '', // 'Transportation',
        emptyData || service?.name || '', // 'Service',
        emptyData || listDeliverie?.require_partner_service_name || '', //'Connection Service Request',
        emptyData || listDeliverie?.service_partner_name || '', // 'Connection service',
        emptyData || connectService.find((item) => item.id === connectBill.connectionPartnerId)?.name || '', // 'Connection partner',
        emptyData || listDeliverie?.partner_bill_code_domestic || '', //Postal code of domestic service connection partner in Vietnam
        emptyData || listDeliverie?.partner_service_domestic_name || '', //Domestic partner services
        emptyData || listDeliverie?.manufacture_domestic || '', // Domestic Supplier
        emptyData || listDeliverie?.partner_bill_code_foreign || '', // Overseas Partner Postal Code
        emptyData || listDeliverie?.overseas_partner_services || '', // Overseas partner services
        emptyData || listDeliverie?.manufacture_foreign || '', // Foreign Supplier
        emptyData || listDeliverie?.type_of_payment || '', // Type of payment
        emptyData || listDeliverie?.delivery_conditions || '', // Delivery conditions
        emptyData || listDeliverie?.pud_note, // Note
        emptyData || listDeliverie?.reference_code || '', // Mã bill đối tác tracking
        emptyData || specializedServices.join('\n'), // Dịch vụ chuyên tuyến/ Dịch vụ khác
        emptyData || valueAddedService.dhl, // Dịch vụ DHL
        emptyData || valueAddedService.fedex, // Dịch vụ Fedex
        emptyData || valueAddedService.ups, // Dịch vụ UPS
        emptyData || await this.getBookingManagementStaff(listDeliverie?.sales_staff),// Nhân viên kinh doanh
        emptyData || await this.getBookingManagementStaff(listDeliverie?.pu_staff ?? listDeliverie?.pickup_staff),// Nhân viên pick up (Nhận hàng)
        emptyData || await this.getBookingManagementStaff(listDeliverie?.checkin_staff),// Nhân viên pick up (Check in)
        emptyData || await this.getBookingManagementStaff(listDeliverie?.checkout_staff),// Nhân viên vận hành (Check out)
        emptyData || await this.getBookingManagementStaff(listDeliverie?.manifest_staff),// Nhân viên vận hành (Xuất Manifest)
      ]);
      emptyData = '';
    }

    return data;
  }

  async exportMultiParcelPickup(getConnectBilLDto: GetConnectBillDto) {
    const { from, to } = getConnectBilLDto;
    const { startDate, endDate } = getStartDateAndEndDate(from, to);

    const query = this.connectBillRepository.createQueryBuilder();
    query.where('DATE(created_at) BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
    const connectBills = await query.getMany();

    let row = 1;
    let id = 1;
    let data = [[...connectBillMultiParcelColumnName]];
    const ranges = [];
    const listColumnExcludeMerge = [34, 35, 36, 37, 38, 39, 40];

    const connectService = await this.serviceBookingService.findConnectServicePartner();
    for (let i = 0; i < connectBills.length; i++) {
      const [service, listDeliveries] = await Promise.all([
        this.serviceBookingService.findOneById(connectBills[i].serviceId),
        this.puDeliveryService.getListDeliveriesConnectBill(connectBills[i].id),
      ]);

      for (let j = 0; j < listDeliveries.length; j++) {
        const dataMapping = await this.mappingDataMultiParcelPickupExport(id, connectBills[i], listDeliveries[j], connectService, service)
        data.push(
          ...dataMapping,
        );

        for (let k = 0; k < connectBillMultiParcelColumnName.length; k++) {
          if (!listColumnExcludeMerge.includes(k) && listDeliveries[j]?.pud_detail_height?.length > 1) {
            ranges.push({
              s: { c: k, r: row },
              e: { c: k, r: row + (listDeliveries[j]?.pud_detail_height?.length ?? 1) - 1 },
            });
          }
        }

        row += listDeliveries[j]?.pud_detail_height?.length ?? 1;
        id++;
      }
    }

    const sheetOptions = { '!merges': ranges };
    const buffer = xlsx.build([{ name: 'MANIFEST', data: data, options: sheetOptions }]);
    const filename = `MANIFEST - DỊCH VỤ KẾT NỐI - ĐỐI TÁC KẾT NỐI - ĐƠN NHIỀU KIỆN PICKUP.xlsx`;

    return {
      buffer,
      filename,
    };
  }

  mapAnalyticPOD(data: any[]): GetAnalyticsPODResponse[] {
    const result: GetAnalyticsPODResponse[] = [];

    for (let i = 0; i < data.length; i++) {
      let totalDeliveried = 0;
      const dayBuckets = new Array(12).fill(0); // [0-10 days, plus category]

      data[i].tags.forEach((tag, index) => {
        if (tag && tag.toLowerCase() === 'delivered') {
          totalDeliveried++;

          const deliveryDateStr = data[i].delivery_dates[index];
          if (deliveryDateStr) {
            const deliveryDate = new Date(deliveryDateStr);
            const pickupDateStr = data[i].pickup_dates[index];
            if (pickupDateStr) {
              const pickupDate = new Date(pickupDateStr);
              const diffDays = Math.ceil((deliveryDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));

              if (diffDays <= 10) {
                dayBuckets[diffDays]++;
                return;
              } else {
                dayBuckets[11]++; // Plus category (> 10 days)
              }
            }
          }
        }
      });

      result.push({
        dateOut: dayjs(data[i]?.created_date).tz('asia/ho_chi_minh').format('DD-MM-YYYY'),
        total: Number(data[i]?.total),
        totalDeliveried: totalDeliveried,
        percentDeliveried: mapToPercent(totalDeliveried, Number([data[i]?.total])),
        totalDeliveried1: dayBuckets[1],
        percentDeliveried1: mapToPercent(dayBuckets[1], Number([data[i]?.total])),
        totalDeliveried2: dayBuckets[2],
        percentDeliveried2: mapToPercent(dayBuckets[2], Number([data[i]?.total])),
        totalDeliveried3: dayBuckets[3],
        percentDeliveried3: mapToPercent(dayBuckets[3], Number([data[i]?.total])),
        totalDeliveried4: dayBuckets[4],
        percentDeliveried4: mapToPercent(dayBuckets[4], Number([data[i]?.total])),
        totalDeliveried5: dayBuckets[5],
        percentDeliveried5: mapToPercent(dayBuckets[5], Number([data[i]?.total])),
        totalDeliveried6: dayBuckets[6],
        percentDeliveried6: mapToPercent(dayBuckets[6], Number([data[i]?.total])),
        totalDeliveried7: dayBuckets[7],
        percentDeliveried7: mapToPercent(dayBuckets[7], Number([data[i]?.total])),
        totalDeliveried8: dayBuckets[8],
        percentDeliveried8: mapToPercent(dayBuckets[8], Number([data[i]?.total])),
        totalDeliveried9: dayBuckets[9],
        percentDeliveried9: mapToPercent(dayBuckets[9], Number([data[i]?.total])),
        totalDeliveried10: dayBuckets[10],
        percentDeliveried10: mapToPercent(dayBuckets[10], Number([data[i]?.total])),
        totalDeliveriedPlus: dayBuckets[11],
        percentDeliveriedPlus: mapToPercent(dayBuckets[11], Number([data[i]?.total])),
      });
    }

    return result;
  }

  getAnalyticsPODQuery(inputDTO: GetAnalyticsPOD): SelectQueryBuilder<ConnectBillEntity> {
    const { ServiceID, from, to } = inputDTO;
    const timeNow = dayjs().tz('Asia/Ho_Chi_Minh').format('DD-MM-YYYY');

    const adjustedFrom = from && dayjs(from).isAfter(timeNow) ? timeNow : from;
    const adjustedTo = to && dayjs(to).isAfter(timeNow) ? timeNow : to;

    const query = this.connectBillRepository
      .createQueryBuilder('cb')
      .innerJoin('pu_deliveries', 'pd', 'pd.connect_bill_id = cb.id')
      .innerJoin('trackings', 'trackings', 'trackings.booking_id = pd.booking_id')
      .andWhere('pd.booking_id IS NOT NULL')

    if (adjustedFrom) {
      query.andWhere('cb.created_at >= :from', {
        from: dayjs(adjustedFrom).tz('Asia/Ho_Chi_Minh'),
      });
    }

    if (adjustedTo) {
      query.andWhere('cb.created_at <= :to', {
        to: dayjs(adjustedTo).tz('Asia/Ho_Chi_Minh'),
      });
    }

    if (ServiceID) {
      query.andWhere('cb.partner_id = :serviceID', {
        serviceID: ServiceID,
      });
    }

    query
      .select([
        'CAST(cb.created_at AS DATE) AS created_date',
        'COUNT(*) as total',
        'array_agg(trackings.tag) as tags',
        'array_agg(trackings.shipment_delivery_date) as delivery_dates',
        'array_agg(trackings.shipment_pickup_date) as pickup_dates',
      ])
      .groupBy('CAST(cb.created_at AS DATE)')
      .orderBy('created_date', 'DESC');

    return query;
  }

  async exportAnalyticsPOD(inputDTO: GetAnalyticsPOD) {
    const result = await this.getAnalyticsPODQuery(inputDTO).getRawMany();
    const reportData = this.mapAnalyticPOD(result);
    let data = [[...PODReportColumnName]];
    for (let i = 0; i < reportData.length; i++) {
      data.push([
        String(i + 1),
        reportData[i].dateOut,
        String(reportData[i].total),
        String(reportData[i].totalDeliveried),
        reportData[i].percentDeliveried,
        String(reportData[i].totalDeliveried1),
        reportData[i].percentDeliveried1,
        String(reportData[i].totalDeliveried2),
        reportData[i].percentDeliveried2,
        String(reportData[i].totalDeliveried3),
        reportData[i].percentDeliveried3,
        String(reportData[i].totalDeliveried4),
        reportData[i].percentDeliveried4,
        String(reportData[i].totalDeliveried5),
        reportData[i].percentDeliveried5,
        String(reportData[i].totalDeliveried6),
        reportData[i].percentDeliveried6,
        String(reportData[i].totalDeliveried7),
        reportData[i].percentDeliveried7,
        String(reportData[i].totalDeliveried8),
        reportData[i].percentDeliveried8,
        String(reportData[i].totalDeliveried9),
        reportData[i].percentDeliveried9,
        String(reportData[i].totalDeliveried10),
        reportData[i].percentDeliveried10,
        String(reportData[i].totalDeliveriedPlus),
        reportData[i].percentDeliveriedPlus,
      ]);
    }

    const buffer = xlsx.build([{ name: 'Báo cáo', data: data, options: null }]);
    const filename = `Báo cáo POD.xlsx`;

    return {
      buffer,
      filename,
    };
  }

  async getAnalyticsPOD(inputDTO: GetAnalyticsPOD) {
    inputDTO.from = inputDTO.from ? dayjs(inputDTO.from).tz('Asia/Ho_Chi_Minh').startOf('day').format() : null;
    inputDTO.to = inputDTO.to ? dayjs(inputDTO.to).tz('Asia/Ho_Chi_Minh').endOf('day').format() : null;

    const query = this.getAnalyticsPODQuery(inputDTO);
    const result = await CommonPaginationRaw(inputDTO, query);

    return {
      ...result,
      data: this.mapAnalyticPOD(result.data),
    };
  }

  getOrderRemainingQuery(inputDTO: GetOrderRemaining): SelectQueryBuilder<ConnectBillEntity> {
    const { ServiceID } = inputDTO;
    const query = this.connectBillRepository
      .createQueryBuilder('cb')
      .innerJoin('pu_deliveries', 'pd', 'pd.connect_bill_id = cb.id')
      .innerJoin('trackings', 'trackings', 'trackings.booking_id = pd.booking_id')
      .leftJoin('booking', 'booking', 'booking.id = pd.booking_id')
      .leftJoin('customers', 'customers', 'customers.id = booking.customer_id')
      .leftJoin('services', 'service', 'cb.connection_partner_id = service.id')
      .where(`(NOW() >= cb.created_at + INTERVAL '4 days')`)
      .andWhere(`trackings.tag != 'Delivered'`)
      .andWhere('cb.created_at >= :fixedDate', {
        fixedDate: dayjs('2025-02-15').tz('Asia/Ho_Chi_Minh'),
      })

    if (ServiceID) {
      query.andWhere('cb.partner_id = :serviceID', {
        serviceID: ServiceID,
      });
    }

    query.select([
      'pd.id as id',
      'booking.booking_code as booking_code',
      'booking.partner_bill_code as partner_bill_code',
      'service.name as partner_connection',
      'customers.customer_code as customer_code',
      'customers.full_name as customer_name',
      'trackings.shipment_pickup_date as pickup_date',
      'cb.created_at as export_date',
      'pd.note_order_remaining as note',
    ]);

    query.orderBy('booking.booking_code', 'DESC');

    return query;
  }

  mapOrderRemainingData(data: any[]): GetOrderRemainingResponse[] {
    const timeNow = new Date();
    return data.map((v: any): GetOrderRemainingResponse => {
      const exportDate = new Date(v.export_date);
      let diffDays = Math.ceil((timeNow.getTime() - exportDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: v.id,
        booking_code: v.booking_code,
        partner_bill_code: v.partner_bill_code,
        partner_connection: v.partner_connection,
        customer_code: v.customer_code,
        customer_name: v.customer_name,
        pickup_date: v?.pickup_date ? dayjs(v?.pickup_date).tz('asia/ho_chi_minh').format('DD-MM-YYYY') : 'N/A',
        export_date: dayjs(v?.export_date).tz('asia/ho_chi_minh').format('DD-MM-YYYY'),
        remaining_days: String(diffDays),
        note: v.note,
      };
    });
  }

  async getOrderRemaining(inputDTO: GetOrderRemaining) {
    const query = this.getOrderRemainingQuery(inputDTO);
    const result = await CommonPaginationRaw(inputDTO, query);

    return {
      ...result,
      data: this.mapOrderRemainingData(result.data),
    };
  }

  async updateOrderRemaining(id: string, inputDTO: UpdateOrderRemaining) {
    return this.puDeliveriesRepository.update(id, {
      noteOrderRemaining: inputDTO.note,
    });
  }

  async exportOrderRemaining(inputDTO: GetOrderRemaining) {
    const result = await this.getOrderRemainingQuery(inputDTO).getRawMany();
    const reportData = this.mapOrderRemainingData(result);
    let data = [[...OrderRemainingReportColumnName]];

    for (let i = 0; i < reportData.length; i++) {
      data.push([
        String(i + 1),
        reportData[i].booking_code,
        reportData[i].partner_bill_code,
        reportData[i].partner_connection,
        reportData[i].customer_code,
        reportData[i].customer_name,
        reportData[i].pickup_date,
        reportData[i].export_date,
        reportData[i].remaining_days,
        reportData[i].note,
      ]);
    }

    const buffer = xlsx.build([{ name: 'Báo cáo', data: data, options: null }]);
    const filename = `Đơn hàng còn tồn trên 4 ngày.xlsx`;

    return {
      buffer,
      filename,
    };
  }
}
