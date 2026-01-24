import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import dayjs from "dayjs";
import xlsx from "node-xlsx";
import {
  CommonError,
  CommonResponse,
  ECustomerGroupMessage,
  ECustomerStatusMessage,
  EFixedPriceCode,
  EFormatDate,
  ETypeStaff,
  ETypeStaffMessage,
  ETypeUser,
} from "src/common/constants/common.constants";
import {
  GetMessageCustomerType,
  GetMessageDirectBeneficiary,
  GetMessageExpertise,
  GetMessageNetWorkCustomerType,
  GetMessageTypeContract,
} from "src/common/constants/message.constants";
import {
  CommonPagination,
  CommonPaginationRaw,
} from "src/common/helper/common-pagination";
import { commonResponse } from "src/common/helper/common-response";
import {
  formatDate,
  randomString,
  // sendRawMessageToEmail, // Commented out - AWS SES removed
} from "src/common/helper/helper";
import {
  acfConfig,
  // awsConfig, // Commented out - AWS config removed
  nodeEnvConfig,
} from "src/configs/configs.constants";
import { In, IsNull, Not, Repository, SelectQueryBuilder } from "typeorm";
import IJwtPayload, { IHistoryInfo } from "../auth/payloads/jwt-payload";
import { EVENT_CONST } from "../events/event.const";
import {
  HistoryAction,
  HistoryType,
  TargetTable,
} from "../history/history.const";
import { GetCargoListDto } from "../pu-deliveries/dto/get-cargo-list.dto";
import { IService } from "../services-booking/interface/services.interface";
import { ServiceService } from "../services-booking/services.service";
import { StaffsService } from "../staffs/staffs.service";
import { UsersService } from "../users/users.service";
import {
  ExportContractColumnName,
  ExportCustomerColumnName,
  ExportCustomerDetailColumnName,
  ExportPriceListColumnName,
} from "./dto/column-name-export-excel.dto";
import { BusinessCustomerDto } from "./dto/create-business-customer.dto";
import { CreateContractDto } from "./dto/create-contract.dto";
import { CreateCustomerDto } from "./dto/create-customers.dto";
import { IndividualCustomerDto } from "./dto/create-individual-customer.dto";
import { CreateManagementStaffDto } from "./dto/create-management-staff.dto";
import { CreatePriceListDto } from "./dto/create-price-list.dto";
import { FilterCustomerDto } from "./dto/filter-customer.dto";
import { FindCustomerDto } from "./dto/find-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customers.dto";
import { ContractEntity } from "./entities/contract.entity";
import { CustomersEntity } from "./entities/customers.entity";
import { OtherPriceEntity } from "./entities/other-price.entity";
import { PriceListEntity } from "./entities/price-list.entity";
import { ICustomer } from "./interface/customers.interface";
import { IManagementStaff } from "./interface/management-staff.interface";
import { IPriceList } from "./interface/price-list.interface";
import { CustomerRepository } from "./repositories/customer.repository";
import { ManagementStaffRepository } from "./repositories/management-staff.repository";
import { EPermissionActionKey } from "src/common/guards/permission";
import {
  ETemplateEmail,
  GetTemplateEmail,
} from "@constants/templates/get_template_email";

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly managementStaffRepository: ManagementStaffRepository,

    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,

    @InjectRepository(PriceListEntity)
    private readonly priceListRepository: Repository<PriceListEntity>,

    @InjectRepository(OtherPriceEntity)
    private readonly otherPriceRepository: Repository<OtherPriceEntity>,

    private readonly usersSerivce: UsersService,
    private readonly staffsService: StaffsService,

    @Inject(forwardRef(() => ServiceService))
    private readonly serviceService: ServiceService,

    private readonly eventEmitter: EventEmitter2
  ) {}

  async getNewCustomerCode() {
    const lastCustomer = await this.customerRepository.findOne({
      where: {
        customerCode: Not(IsNull()),
      },
      order: {
        customerCode: "DESC",
      },
    });
    if (lastCustomer) {
      let newCustomerCode: any = Number(lastCustomer.customerCode) + 1;
      // if (String(newCustomerCode).length < acfConfig.customerAccountCodeStart.length) {
      //   newCustomerCode = ('00000' + newCustomerCode).slice(-acfConfig.customerAccountCodeStart.length);
      // }

      return newCustomerCode;
    }

    return acfConfig.customerAccountCodeStart;
  }

  async getCustomerByPayload(payload: IJwtPayload) {
    const customer: any = await this.customerRepository
      .createQueryBuilder("customer")
      .leftJoinAndMapOne(
        "customer.user",
        "users",
        "user",
        "customer.user_id = user.id"
      )
      .leftJoinAndMapOne(
        "customer.unit",
        "units",
        "unit",
        "customer.unit_id = unit.id"
      )
      .where("user.id = :userId", {
        userId: payload.id,
      })
      .getOne();

    if (!customer) {
      throw new NotFoundException(CommonError.NOT_FOUND_CUSTOMER);
    }

    return customer;
  }

  async sendMailAccountToCustomer(
    customer: ICustomer,
    password: string,
    managementStaffDto: CreateManagementStaffDto[]
  ) {
    const html = GetTemplateEmail(ETemplateEmail.MAIL_SEND_CREATE_CUSTOMER, {
      customerCode: customer.customerCode,
      password,
    });

    // Email sending commented out - AWS SES removed
    // const params = {
    //   from: awsConfig.emailSend,
    //   to: customer.email,
    //   cc: awsConfig.emailReceiveCustomerService,
    //   subject: `${
    //     nodeEnvConfig === "develop"
    //       ? "[MH GREAT SUN-DEVELOP]"
    //       : "[MH GREAT SUN]"
    //   } THÔNG TIN TÀI KHOẢN/ACCOUNT INFORMATION - ${customer.customerCode} - ${
    //     customer.fullName
    //   }`,
    //   html: html,
    // };

    // await sendRawMessageToEmail(params);
  }

  async checkCustomerExists(
    identifier: string,
    identifierType: string,
    customerId?: string
  ) {
    const customer = await this.customerRepository.findOne({
      where: {
        identifier,
        identifierType,
      },
    });
    if (customer && customer.id !== customerId) {
      throw new ConflictException("Customer Already exists");
    }

    return customer;
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
    payload: IJwtPayload,
    info: IHistoryInfo
  ) {
    let { priceList, managementStaff, contract, openDate } = createCustomerDto;
    this.validateUniqueTypeStaff(managementStaff);

    await this.checkCustomerExists(
      createCustomerDto.identifier,
      createCustomerDto.identifierType
    );
    const [staff, newCustomerCode, password] = await Promise.all([
      this.staffsService.getStaffByPayloadNotHandle(payload),
      this.getNewCustomerCode(),
      randomString(10),
    ]);
    const customer = new CustomersEntity();
    const user = await this.usersSerivce.create({
      username: newCustomerCode,
      password,
    });
    Object.assign(customer, {
      ...createCustomerDto,
      userId: user.id,
      customerCode: newCustomerCode,
      staffId: staff?.id,
      openDate: openDate ?? new Date(),
    });

    const result = await this.customerRepository.save(customer);

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Customer,
      action: HistoryAction.Create,
      newItem: result,
      recordId: result.id,
      targetTable: TargetTable.Customers,
    });

    if (
      payload.typeUser === ETypeUser.STAFF &&
      !managementStaff.findIndex(
        (v) => v.typeStaff === ETypeStaff.BUSINESS_STAFF
      )
    ) {
      managementStaff = [
        ...managementStaff,
        {
          staffId: staff.id,
          typeStaff: ETypeStaff.BUSINESS_STAFF,
          customerId: result.id,
        },
      ];
    }
    await Promise.all([
      this.createContract(contract, result.id, HistoryAction.Create, info),
      this.createPriceList(priceList, result.id, HistoryAction.Create, info),
      this.createManagementStaff(
        managementStaff,
        result.id,
        HistoryAction.Create,
        info
      ),
    ]);

    await this.sendMailAccountToCustomer(result, password, managementStaff);

    return result;
  }

  async findAll(filterCustomerDto: FilterCustomerDto, payload: IJwtPayload) {
    const {
      customerType,
      networkCustomerType,
      service,
      unitId,
      search,
      orderBy,
      status,
    } = filterCustomerDto;
    const customersQuery = this.customerRepository
      .createQueryBuilder("customer")
      .leftJoinAndMapOne(
        "customer.unit",
        "units",
        "unit",
        "customer.unit_id = unit.id"
      )
      .leftJoinAndMapOne(
        "customer.company",
        "companies",
        "company",
        "company.id = customer.company_id"
      )
      .leftJoinAndMapMany(
        "customer.contract",
        "contract",
        "contract",
        "customer.id = contract.customer_id"
      )
      .leftJoinAndMapMany(
        "customer.priceList",
        "price_list",
        "price_list",
        "customer.id = price_list.customer_id"
      )
      .leftJoinAndMapMany(
        "customer.managementStaff",
        "management_staff",
        "management_staff",
        "customer.id = management_staff.customer_id"
      )
      .leftJoinAndMapMany(
        "price_list.otherPrices",
        "other_price",
        "other_price",
        "other_price.price_list_id = price_list.id"
      )
      .leftJoinAndMapOne(
        "other_price.country_contract",
        "zone_services",
        "zone_services",
        "zone_services.id = other_price.country_contract_id"
      );

    if (customerType) {
      customersQuery.where("customer.type_customer = :typeCustomer", {
        typeCustomer: customerType,
      });
    }

    if (networkCustomerType) {
      customersQuery.andWhere("customer.type = :type", {
        type: networkCustomerType,
      });
    }

    if (service) {
      customersQuery.andWhere("customer.service = :service", { service });
    }

    if (unitId) {
      customersQuery.andWhere("unit_id = :unitId", { unitId });
    }

    if (search) {
      customersQuery.andWhere(
        "(upper(customer.full_name) LIKE :search OR customer_code LIKE :search)",
        {
          search: `%${search.toUpperCase()}%`,
        }
      );
    }

    if (status) {
      customersQuery.andWhere("status = :status", { status });
    }

    if (
      payload.typeUser === ETypeUser.STAFF &&
      !payload.permissions.includes(EPermissionActionKey.GET_ALL_LIST_CUSTOMER)
    ) {
      const staff = await this.staffsService.getStaffByPayloadNotHandle(
        payload
      );
      customersQuery.andWhere(
        "EXISTS(SELECT 1 FROM management_staff WHERE customer.id = management_staff.customer_id AND management_staff.staff_id = :staffId)",
        {
          staffId: staff.id,
        }
      );
    }

    if (orderBy) {
      const sort = orderBy.split("_");
      customersQuery.orderBy(
        `customer.${sort[0]}`,
        sort[1].toUpperCase() === "ASC" ? "ASC" : "DESC"
      );
    } else {
      customersQuery
        .orderBy("customer.createdAt", "DESC")
        .addOrderBy("price_list.updatedAt", "DESC");
    }

    return CommonPagination(filterCustomerDto, customersQuery);
  }

  async findOne(id: string) {
    const customer = await this.customerRepository
      .createQueryBuilder("customer")
      .leftJoinAndMapOne(
        "customer.user",
        "users",
        "user",
        "customer.user_id = user.id"
      )
      .leftJoinAndMapOne(
        "customer.unit",
        "units",
        "unit",
        "customer.unit_id = unit.id"
      )
      .where("customer.id = :id", { id })
      .getOne();

    if (!customer) {
      throw new NotFoundException(CommonError.NOT_FOUND_CUSTOMER);
    }

    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    info: IHistoryInfo
  ) {
    const { contract, managementStaff, priceList } = updateCustomerDto;
    this.validateUniqueTypeStaff(managementStaff);

    await this.checkCustomerExists(
      updateCustomerDto.identifier,
      updateCustomerDto.identifierType,
      id
    );
    const customer = await this.findOne(id);
    const oldItem = await this.customerRepository.findOne({ where: { id } });

    Object.assign(customer, updateCustomerDto);

    await Promise.all([
      this.createContract(contract, customer.id, HistoryAction.Edit, info),
      this.createPriceList(priceList, customer.id, HistoryAction.Edit, info),
      this.createManagementStaff(
        managementStaff,
        customer.id,
        HistoryAction.Edit,
        info
      ),
      customer.save(),
    ]);

    const newItem = await this.customerRepository.findOne({ where: { id } });

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Customer,
      action: HistoryAction.Edit,
      newItem,
      oldItem,
      recordId: id,
      targetTable: TargetTable.Customers,
    });
    return customer;
  }

  async updateProfile(
    updateCustomerDto: UpdateCustomerDto,
    payload: IJwtPayload
  ) {
    const customer = await this.getCustomerByPayload(payload);

    Object.assign(customer, updateCustomerDto);

    return await customer.save();
  }

  async sendRequestCreateIndividualCustomer(
    individualCustomerDto: IndividualCustomerDto
  ) {
    const { fullName, gender, dob, phoneNumber, email, detailAddress } =
      individualCustomerDto;
    const data = [
      ["Họ và tên", "Giới tính", "Ngày sinh", "SDT", "Email", "Địa chỉ"],
      [fullName, gender, dob, phoneNumber, email, detailAddress],
    ];

    const buffer = xlsx.build([
      {
        name: "Yêu cầu tạo tài khoản",
        data: data,
        options: null,
      },
    ]);

    // Email sending commented out - AWS SES removed
    // const params = {
    //   from: awsConfig.emailSend,
    //   to: awsConfig.emailReceiveCreateCustomer,
    //   subject: "[Tạo mã] Yêu cầu mở tài khoản Individual",
    //   text: "Thông tin khách hàng yêu cầu mở tài khoản Individual",
    //   attachments: [
    //     {
    //       filename: `Individual-${new Date().getTime()}.xlsx`,
    //       content: buffer,
    //     },
    //   ],
    // };

    // const result = await sendRawMessageToEmail(params);

    // return commonResponse(CommonResponse.SUCCESS, result);
  }

  async sendRequestCreateBusinessCustomer(
    businessCustomerDto: BusinessCustomerDto
  ) {
    const {
      fullName,
      detailAddress,
      tel,
      taxCode,
      contactPerson,
      phoneNumber,
      position,
      email,
    } = businessCustomerDto;
    const data = [
      [
        "Company Name",
        "Address",
        "Tel",
        "Tax code",
        "Contact Name",
        "Phone number",
        "Position",
        "Email",
      ],
      [
        fullName,
        detailAddress,
        tel,
        taxCode,
        contactPerson,
        phoneNumber,
        position,
        email,
      ],
    ];

    const buffer = xlsx.build([
      {
        name: "Yêu cầu tạo tài khoản",
        data: data,
        options: null,
      },
    ]);

    // Email sending commented out - AWS SES removed
    // const params = {
    //   from: awsConfig.emailSend,
    //   to: awsConfig.emailReceiveCreateCustomer,
    //   subject: "[Tạo mã] Yêu cầu mở tài khoản Business",
    //   text: "Thông tin khách hàng yêu cầu mở tài khoản Business",
    //   attachments: [
    //     {
    //       filename: `Business-${new Date().getTime()}.xlsx`,
    //       content: buffer,
    //     },
    //   ],
    // };

    // await sendRawMessageToEmail(params);

    // return commonResponse(CommonResponse.SUCCESS, null);
  }

  async findCustomerByCustomerCode(findCustomerDto: FindCustomerDto) {
    const { customerCode } = findCustomerDto;

    const query = this.customerRepository
      .createQueryBuilder("customer")
      .where("customer.customer_code = :customerCode", { customerCode });

    return query.getOne();
  }

  async createContract(
    createContractDtos: CreateContractDto[],
    customerId: string,
    action?: string,
    info?: IHistoryInfo
  ) {
    const oldItems = await this.contractRepository.find({
      where: { customerId },
    });

    await this.contractRepository.delete({ customerId });

    let mappingData = [];
    if (createContractDtos && createContractDtos?.length) {
      mappingData = createContractDtos.map((contract) => {
        return {
          service: contract.service,
          contractCode: contract.contractCode,
          contractName: contract.contractName,
          typeContract: contract.typeContract,
          contractTermFrom: contract.contractTermFrom,
          contractTermTo: contract.contractTermTo,
          paymentSchedule: contract.paymentSchedule,
          expertise: contract.appraisalStaff ? true : false,
          appraisalStaff: contract.appraisalStaff,
          files: contract.files,
          noteContract: contract.noteContract,
          customerId,
        };
      });
    }
    const newItems = await this.contractRepository.save(mappingData);

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Customer,
      action,
      newItem: newItems,
      oldItem: oldItems,
      recordId: customerId,
      targetTable: TargetTable.Contract,
    });

    return newItems;
  }

  async createPriceList(
    createPriceListDtos: CreatePriceListDto[],
    customerId: string,
    action?: string,
    info?: IHistoryInfo
  ) {
    const priceListRemove = await this.priceListRepository.find({
      where: { customerId },
      relations: { otherPrices: true },
    });
    let mapPriceList = {};
    const mappingPriceListIds = priceListRemove.map((priceList) => {
      mapPriceList[priceList.id] = priceList;

      return priceList.id;
    });
    await this.otherPriceRepository.delete({
      priceListId: In(mappingPriceListIds),
    });
    await this.priceListRepository.delete({ customerId });
    const newItems = [];

    for (let i = 0; i < createPriceListDtos?.length; i++) {
      let isUpdated = true;
      if (createPriceListDtos[i].id) {
        const oldPriceList = mapPriceList[createPriceListDtos[i].id];
        if (
          oldPriceList.serviceRequestId ===
            createPriceListDtos[i].serviceRequestId ||
          oldPriceList.potentialRevenueFrom ===
            createPriceListDtos[i].potentialRevenueFrom ||
          oldPriceList.potentialRevenueTo ===
            createPriceListDtos[i].potentialRevenueTo ||
          oldPriceList.fixedPriceCode ===
            createPriceListDtos[i].fixedPriceCode ||
          oldPriceList.lkdRate === createPriceListDtos[i].lkdRate ||
          oldPriceList.surcharge === createPriceListDtos[i].surcharge ||
          oldPriceList.exchangeRate === createPriceListDtos[i].exchangeRate ||
          oldPriceList.timeApplyFrom === createPriceListDtos[i].timeApplyFrom ||
          oldPriceList.timeApplyTo === createPriceListDtos[i].timeApplyTo ||
          oldPriceList.otherPrice === createPriceListDtos[i].otherPrice ||
          oldPriceList.discountRate === createPriceListDtos[i].discountRate ||
          oldPriceList.notePriceList === createPriceListDtos[i].notePriceList
        ) {
          isUpdated = false;
        }
      }

      const priceList = await this.priceListRepository.save({
        ...createPriceListDtos[i],
        customerId,
        id: undefined,
        createdAt: isUpdated
          ? new Date()
          : mapPriceList[createPriceListDtos[i].id].createdAt,
        updatedAt: isUpdated
          ? new Date()
          : mapPriceList[createPriceListDtos[i].id].updatedAt,
      });

      if (
        createPriceListDtos[i].fixedPriceCode === EFixedPriceCode.OTHER_PRICE &&
        createPriceListDtos[i]?.otherPrices?.length
      ) {
        const otherPrices = createPriceListDtos[i].otherPrices;
        let mappingData: any = [];
        mappingData = otherPrices.map((otherPrice) => {
          return {
            ...otherPrice,
            priceListId: priceList.id,
          };
        });
        const newOtherPrices = await this.otherPriceRepository.save(
          mappingData
        );
        priceList[`otherPrices`] = newOtherPrices;
      }

      newItems.push(priceList);
    }

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Customer,
      action,
      newItem: newItems,
      oldItem: priceListRemove,
      recordId: customerId,
      targetTable: TargetTable.PriceList,
    });

    return commonResponse(CommonResponse.SUCCESS, null);
  }

  validateUniqueTypeStaff(dtos: CreateManagementStaffDto[]): void {
    const typeStaffSet = new Set<ETypeStaff>();

    for (const dto of dtos) {
      if (typeStaffSet.has(dto.typeStaff as ETypeStaff)) {
        throw new BadRequestException(
          `Loại nhân viên ${
            ETypeStaffMessage[dto.typeStaff]
          } đã tồn tại vui lòng kiểm tra lại!`
        );
      }
      typeStaffSet.add(dto.typeStaff as ETypeStaff);
    }
  }

  async createManagementStaff(
    createManagementStaffDtos: CreateManagementStaffDto[],
    customerId: string,
    action?: string,
    info?: IHistoryInfo
  ) {
    const oldItem = await this.managementStaffRepository.find({
      where: { customerId },
    });
    await this.managementStaffRepository.delete({ customerId });
    let mapManagementStaff = {};
    for (let i = 0; i < oldItem.length; i++) {
      mapManagementStaff[oldItem[i].id] = oldItem[i];
    }

    let mappingData = [];
    if (createManagementStaffDtos && createManagementStaffDtos?.length) {
      mappingData = createManagementStaffDtos.map((managementStaff) => {
        if (managementStaff.id && mapManagementStaff[managementStaff.id]) {
          let isUpdated = false;
          const oldManagementStaff = mapManagementStaff[managementStaff.id];

          if (
            managementStaff.staffId !== oldManagementStaff.staffId ||
            managementStaff.typeStaff !== oldManagementStaff.typeStaff
          ) {
            isUpdated = true;
          }

          return {
            ...managementStaff,
            customerId,
            createdAt: oldManagementStaff.createdAt,
            updatedAt: isUpdated ? new Date() : oldManagementStaff.updatedAt,
          };
        }

        return {
          ...managementStaff,
          customerId,
        };
      });
    }

    const newItem = await this.managementStaffRepository.save(mappingData);
    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Customer,
      action,
      newItem,
      oldItem,
      recordId: customerId,
      targetTable: TargetTable.PriceList,
    });

    return newItem;
  }

  async generateExcelFilePriceList(customerId: string) {
    const data = [
      [
        "Thời gian tạo",
        "Dịch vụ",
        "DT tiềm năng từ",
        "DT tiềm năng đến",
        "Mã bảng giá",
        "Nước/Zone",
        "Tỷ lệ giảm giá",
        "Phụ phí xăng dầu",
        "Tỷ lệ LKD/Giá bán gốc chưa phụ phí ",
        "Tỷ giá",
        "Thời gian AD từ",
        "Thời gian AD đến",
      ],
    ];
    const customer = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });
    if (!customer) {
      throw new NotFoundException();
    }
    const priceList = (await this.priceListRepository
      .createQueryBuilder("priceList")
      .leftJoinAndMapMany(
        "priceList.otherPrices",
        "other_price",
        "other_price",
        "other_price.price_list_id = priceList.id"
      )
      .leftJoinAndMapOne(
        "priceList.serviceRequest",
        "services",
        "services",
        "services.id = priceList.service_request_id"
      )
      .leftJoinAndMapOne(
        "other_price.countryContract",
        "zone_services",
        "zone_services",
        "zone_services.id = other_price.country_contract_id"
      )
      .where("priceList.customer_id = :customerId", {
        customerId,
      })
      .getMany()) as IPriceList[];

    let r = 1;
    const ranges = [];

    for (let i = 0; i < priceList.length; i++) {
      if (priceList[i].fixedPriceCode === EFixedPriceCode.OTHER_PRICE) {
        if (priceList[i]?.otherPrices?.length) {
          data.push([
            formatDate(priceList[i].createdAt, EFormatDate.DD_MM_YYYY_HH_mm),
            priceList[i]?.serviceRequest?.name || "",
            priceList[i].potentialRevenueFrom?.toString() || "",
            priceList[i].potentialRevenueTo?.toString() || "",
            "Giá khác",
            priceList[i]?.otherPrices[0]?.countryContract?.name || "",
            priceList[i].otherPrices[0].discountRate || "",
            priceList[i].surcharge || "",
            priceList[i].lkdRate.toString() || "",
            priceList[i].exchangeRate || "",
            formatDate(priceList[i].timeApplyFrom, EFormatDate.DD_MM_YYYY) ||
              "",
            formatDate(priceList[i].timeApplyTo, EFormatDate.DD_MM_YYYY) || "",
          ]);

          priceList[i].otherPrices.forEach((otherPrice, index: number) => {
            if (index > 0)
              data.push([
                "",
                "",
                "",
                "",
                "Giá khác",
                otherPrice?.countryContract?.name || "",
                otherPrice.discountRate || "",
                "",
                "",
                "",
                "",
                "",
              ]);
          });

          const listColMerge = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11];
          listColMerge.forEach((column) => {
            const range = {
              s: { c: column, r: r },
              e: { c: column, r: r + priceList[i]?.otherPrices?.length - 1 },
            };
            ranges.push(range);
          });

          r += priceList[i]?.otherPrices?.length;
        } else {
          data.push([
            formatDate(priceList[i].createdAt, EFormatDate.DD_MM_YYYY_HH_mm),
            priceList[i]?.serviceRequest?.name || "",
            priceList[i].potentialRevenueFrom?.toString() || "",
            priceList[i].potentialRevenueTo?.toString() || "",
            "Giá khác",
            "",
            priceList[i].discountRate || "",
            priceList[i].surcharge || "",
            priceList[i].exchangeRate || "",
            formatDate(priceList[i].timeApplyFrom, EFormatDate.DD_MM_YYYY) ||
              "",
            formatDate(priceList[i].timeApplyTo, EFormatDate.DD_MM_YYYY) || "",
          ]);
          r++;
        }
      } else {
        data.push([
          formatDate(priceList[i].createdAt, EFormatDate.DD_MM_YYYY_HH_mm),
          priceList[i]?.serviceRequest?.name || "",
          priceList[i].potentialRevenueFrom?.toString() || "",
          priceList[i].potentialRevenueTo?.toString() || "",
          priceList[i].fixedPriceCode || "",
          "",
          priceList[i].discountRate || "",
          priceList[i].surcharge || "",
          priceList[i].exchangeRate || "",
          formatDate(priceList[i].timeApplyFrom, EFormatDate.DD_MM_YYYY) || "",
          formatDate(priceList[i].timeApplyTo, EFormatDate.DD_MM_YYYY) || "",
        ]);
        r++;
      }
    }

    const sheetOptions = { "!merges": ranges };

    const buffer = xlsx.build([
      { name: "Bảng giá", data: data, options: sheetOptions },
    ]);
    return {
      buffer,
      filename: `Bảng giá - ${customer.customerCode}.xlsx`,
    };
  }

  async getAllPriceList(payload: IJwtPayload) {
    const query = this.priceListRepository
      .createQueryBuilder("pl")
      .leftJoinAndMapOne(
        "pl.customer",
        "customers",
        "customer",
        "pl.customer_id = customer.id"
      )
      .leftJoinAndMapMany(
        "pl.other_price",
        "other_price",
        "other_price",
        "other_price.price_list_id = pl.id"
      )
      .leftJoinAndMapOne(
        "other_price.country_contract",
        "zone_services",
        "zone_services",
        "zone_services.id = other_price.country_contract_id"
      )
      .leftJoinAndMapOne(
        "pl.service_request",
        "services",
        "services",
        "services.id = pl.service_request_id"
      )
      .orderBy("customer.customer_code", "DESC");

    if (
      payload.typeUser === ETypeUser.STAFF &&
      !payload.permissions.includes(EPermissionActionKey.GET_ALL_LIST_CUSTOMER)
    ) {
      const staff = await this.staffsService.getStaffByPayloadNotHandle(
        payload
      );
      query.andWhere(
        "EXISTS(SELECT 1 FROM management_staff WHERE customer.id = management_staff.customer_id AND management_staff.staff_id = :staffId)",
        {
          staffId: staff.id,
        }
      );
    }

    return query.getMany() as any;
  }

  async generateExcelExportAllPriceList(payload: IJwtPayload) {
    const priceList = await this.getAllPriceList(payload);
    const data = [...ExportPriceListColumnName];
    for (let i = 0; i < priceList.length; i++) {
      data.push([
        ECustomerStatusMessage[priceList[i]?.customer?.status], // Tình trạng khách hàng
        priceList[i]?.customer?.customerCode, //Mã khách hàng
        priceList[i]?.customer?.fullName, //Tên khách hàng
        formatDate(priceList[i].createdAt, EFormatDate.DD_MM_YYYY_HH_mm), //Thời gian cập nhật
        priceList[i]?.service_request?.name || "", //Dịch vụ yêu cầu
        priceList[i].potentialRevenueFrom || "", //Doanh thu tiềm năng từ (triệu đồng)
        priceList[i].potentialRevenueTo || "", // Doanh thu tiềm năng đến (triệu đồng)
        priceList[i].priceListRequested, // Bảng giá yêu cầu
        priceList[i].fixedPriceCode || "", // Mã bảng giá cố định
        priceList[i].priceCodeDocument || "", // Mã bảng giá chứng từ
        priceList[i].lightPriceCode || "", // Mã bảng giá hàng nhẹ
        priceList[i].heavyPriceCode || "", // Mã bảng giá hàng nặng
        priceList[i].otherPrice
          ? priceList[i].otherPrice
          : priceList[i]?.other_price
              ?.map(
                (item) => `${item.country_contract.name} - ${item.discountRate}`
              )
              ?.join(`\n`), //Giá khác
        formatDate(priceList[i].timeApplyFrom, EFormatDate.DD_MM_YYYY), // Ngày bắt đầu
        formatDate(priceList[i].timeApplyTo, EFormatDate.DD_MM_YYYY), // Ngày kết thúc
        priceList[i].surcharge, //Phụ phí xăng dầu
        priceList[i].exchangeRate, //Tỷ giá (VNĐ)
        priceList[i].lkdRate || "", // Tỷ lệ LKD/Giá bán gốc chưa phụ phí
        priceList[i].notePriceList || "", // Ghi chú 1
        priceList[i].notePriceList2 || "", // Ghi chú 2
      ]);
    }

    const buffer = xlsx.build([{ name: "Bảng giá", data: data, options: {} }]);
    return {
      buffer,
      filename: `Price_list.xlsx`,
    };
  }

  async getAllContract(payload: IJwtPayload) {
    const query = this.contractRepository
      .createQueryBuilder("ct")
      .leftJoinAndMapOne(
        "ct.customer",
        "customers",
        "customer",
        "ct.customer_id = customer.id"
      )
      .leftJoinAndMapOne(
        "ct.service_request",
        "services",
        "services",
        "services.id = ct.service"
      )
      .leftJoinAndMapOne(
        "ct.staff",
        "staffs",
        "staff",
        "staff.id = ct.appraisal_staff"
      );

    if (
      payload.typeUser === ETypeUser.STAFF &&
      !payload.permissions.includes(EPermissionActionKey.GET_ALL_LIST_CUSTOMER)
    ) {
      const staff = await this.staffsService.getStaffByPayloadNotHandle(
        payload
      );
      query.andWhere(
        "EXISTS(SELECT 1 FROM management_staff WHERE customer.id = management_staff.customer_id AND management_staff.staff_id = :staffId)",
        {
          staffId: staff.id,
        }
      );
    }

    return query.getMany() as any;
  }

  async generateExcelContract(payload: IJwtPayload) {
    const contracts = await this.getAllContract(payload);
    const data = [...ExportContractColumnName];
    for (let i = 0; i < contracts.length; i++) {
      data.push([
        ECustomerStatusMessage[contracts[i]?.customer?.status], // Tình trạng khách hàng
        contracts[i]?.customer?.customerCode || "", //Mã khách hàng
        contracts[i]?.customer?.fullName || "", // Tên khách hàng
        contracts[i]?.createdAt || "", //Ngày tạo
        contracts[i].contractCode || "", // 'Mã phụ lục hợp đồng',
        contracts[i].contractName || "", // 'Tên phụ lục hợp đồng',
        contracts[i]?.service_request?.name || "", // 'Dịch vụ sử dụng',
        GetMessageTypeContract(contracts[i]?.typeContract), // 'Loại hợp đồng/ Loại phụ lục hợp đồng',
        contracts[i].paymentSchedule, // 'Lịch thanh toán công nợ kể từ ngày xuất hóa đơn',
        formatDate(contracts[i].contractTermFrom, EFormatDate.DD_MM_YYYY), // 'Ngày bắt đầu',
        formatDate(contracts[i].contractTermTo, EFormatDate.DD_MM_YYYY), // Ngày kết thúc
        GetMessageExpertise(contracts[i].staff ? true : false), // 'Thẩm định',
        contracts[i].staff
          ? `${contracts[i]?.staff?.staffCode} - ${contracts[i]?.staff?.fullName}`
          : "", // 'Nhân viên thẩm định',
        contracts[i].noteContract, // 'Ghi chú',
      ]);
    }

    const buffer = xlsx.build([{ name: "Contract", data: data, options: {} }]);
    return {
      buffer,
      filename: `contract.xlsx`,
    };
  }

  async getAllCustomer(payload: IJwtPayload): Promise<any[]> {
    const query = this.customerRepository
      .createQueryBuilder("customer")
      .leftJoinAndMapOne(
        "customer.company",
        "companies",
        "company",
        "customer.company_id = company.id"
      )
      .leftJoinAndMapMany(
        "customer.management_staff",
        "management_staff",
        "management_staff",
        "management_staff.customer_id = customer.id"
      )
      .leftJoinAndMapOne(
        "management_staff.staff",
        "staffs",
        "staff",
        "staff.id = management_staff.staff_id"
      )
      .leftJoinAndMapOne(
        "customer.unit",
        "units",
        "unit",
        "customer.unit_id = unit.id"
      )
      .orderBy("customer_code", "ASC");

    if (
      payload.typeUser === ETypeUser.STAFF &&
      !payload.permissions.includes(EPermissionActionKey.GET_ALL_LIST_CUSTOMER)
    ) {
      const staff = await this.staffsService.getStaffByPayloadNotHandle(
        payload
      );
      query.andWhere(
        "EXISTS(SELECT 1 FROM management_staff WHERE customer.id = management_staff.customer_id AND management_staff.staff_id = :staffId)",
        {
          staffId: staff.id,
        }
      );
    }

    return query.getMany();
  }

  mapServiceNameOfCustomer(customer: ICustomer, services: IService[]) {
    const serviceName = [];
    for (let i = 0; i < services.length; i++) {
      if (customer.service.includes(services[i].id))
        serviceName.push(services[i].name);
    }
    return serviceName.join(`\n`);
  }

  mapManagementStaff(managementstaffs: IManagementStaff[]) {
    const convertInfoStaff = (
      manageStaff?: IManagementStaff
    ): {
      staffInfo: string;
      updatedAt: string;
    } => {
      if (!manageStaff) {
        return {
          staffInfo: "",
          updatedAt: "",
        };
      }

      return {
        staffInfo: manageStaff?.staff
          ? `${manageStaff?.staff.staffCode} - ${manageStaff?.staff.fullName}`
          : "",
        updatedAt: formatDate(
          manageStaff.updatedAt,
          EFormatDate.DD_MM_YYYY_HH_mm
        ),
      };
    };

    return {
      [ETypeStaff.DEBT_COLLECTOR]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.DEBT_COLLECTOR
        )
      ),
      [ETypeStaff.CODE_OPENING_STAFF]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.CODE_OPENING_STAFF
        )
      ),
      [ETypeStaff.FORWARDING_STAFF]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.FORWARDING_STAFF
        )
      ),
      [ETypeStaff.BUSINESS_STAFF]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.BUSINESS_STAFF
        )
      ),
      [ETypeStaff.TELESALE_STAFF]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.TELESALE_STAFF
        )
      ),
      [ETypeStaff.INVOICING_STAFF]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.INVOICING_STAFF
        )
      ),
      [ETypeStaff.SALES_STAFF_ARE_HANDLE_OVER]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.SALES_STAFF_ARE_HANDLE_OVER
        )
      ),
      [ETypeStaff.GROUP_BUSINESS_MANAGEMENT]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.GROUP_BUSINESS_MANAGEMENT
        )
      ),
      [ETypeStaff.DEPARTMENT_BUSINESS_MANAGEMENT]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.DEPARTMENT_BUSINESS_MANAGEMENT
        )
      ),
      [ETypeStaff.DOMAIN_BUSINESS_MANAGEMENT]: convertInfoStaff(
        managementstaffs.find(
          (item) => item.typeStaff === ETypeStaff.DOMAIN_BUSINESS_MANAGEMENT
        )
      ),
    };
  }

  async generateExcelCustomer(payload: IJwtPayload) {
    const [customers, services] = await Promise.all([
      this.getAllCustomer(payload),
      this.serviceService.findAll(payload),
    ]);

    const data = [...ExportCustomerColumnName];
    for (let i = 0; i < customers.length; i++) {
      const managementInfo = this.mapManagementStaff(
        customers[i].management_staff
      );

      data.push([
        ECustomerStatusMessage[customers[i].status], // Tình trạng khách hàng
        customers[i]?.company?.name || "", // Công ty quản lý khách hàng
        customers[i]?.unit?.name || "", // Thông tin đơn vị
        ECustomerGroupMessage[customers[i].customerGroup] || "", // Nhóm khách hàng hoặc nhà cung cấp
        formatDate(customers[i].createdAt, EFormatDate.DD_MM_YYYY_HH_mm), // 'Thời gian tạo mã',
        customers[i].customerCode, // 'Mã khách hàng',
        customers[i].fullName, // Tên khách hàng
        customers[i].fullNameEn || "", // Tên khách hàng (Tiếng Anh)
        customers[i].detailAddress, // 'Địa chỉ chi tiết',
        customers[i].detailAddressEn, // 'Địa chỉ chi tiết (Tiếng Anh)',
        customers[i].commune, // 'Phường/Xã',
        customers[i].district, // 'Quận/Huyện',
        customers[i].province, // 'Thành phố',
        customers[i].country, // 'Quốc gia',
        customers[i].identifier, // 'Mã định danh',
        customers[i].contactPerson, // 'Người liên hệ',
        customers[i].mobile || "", // Số điện thoại di động
        customers[i].phoneNumber, // 'SĐT',
        customers[i].phoneCode, // 'Mã vùng',
        customers[i].email, // 'Email',
        GetMessageCustomerType(customers[i].typeCustomer), // 'Loại khách hàng'
        this.mapServiceNameOfCustomer(customers[i], services), // 'Dịch vụ',
        GetMessageNetWorkCustomerType(customers[i].type), // 'Loại khách hàng vào mạng',
        customers[i].postCode || "", // 'Mã bưu chính',
        formatDate(customers[i]?.openDate, EFormatDate.DD_MM_YYYY), // Ngày mở mã/ Active lại
        customers[i].note || "", // 'Ghi chú',
        managementInfo.BUSINESS_STAFF.staffInfo, // 'Nhân viên kinh doanh => Nhân viên mở mã khách hàng',
        managementInfo.BUSINESS_STAFF.updatedAt, // Ngày tháng cập nhật mới nhất
        managementInfo.FORWARDING_STAFF.staffInfo, // 'Nhân viên giao nhận',
        managementInfo.CODE_OPENING_STAFF.staffInfo, // 'Nhân viên quản lý khách hàng',
        managementInfo.CODE_OPENING_STAFF.updatedAt, // Ngày tháng cập nhật mới nhất
        managementInfo.SALES_STAFF_ARE_HANDLE_OVER.staffInfo, // Nhân viên kinh doanh được bàn giao
        managementInfo.SALES_STAFF_ARE_HANDLE_OVER.updatedAt, // Ngày tháng cập nhật mới nhất
        managementInfo.TELESALE_STAFF.staffInfo, // 'Nhân viên Dịch vụ khách hàng',
        managementInfo.INVOICING_STAFF.staffInfo, // 'Nhân viên xuất hóa đơn',
        managementInfo.DEBT_COLLECTOR.staffInfo, // 'Nhân viên thu nợ',
        managementInfo.GROUP_BUSINESS_MANAGEMENT.staffInfo, // Quản lý kinh doanh cấp Tổ
        managementInfo.DEPARTMENT_BUSINESS_MANAGEMENT.staffInfo, // Quản lý kinh doanh cấp Phòng
        managementInfo.DOMAIN_BUSINESS_MANAGEMENT.staffInfo, //Quản lý kinh doanh cấp Miền
      ]);
    }

    const buffer = xlsx.build([{ name: "Customer", data: data, options: {} }]);
    return {
      buffer,
      filename: `customer.xlsx`,
    };
  }

  async generateExcelCustomerDetail(payload: IJwtPayload) {
    const data = [...ExportCustomerDetailColumnName];
    const customers = await this.getAllCustomer(payload);

    const ranges = [
      { s: { c: 3, r: 0 }, e: { c: 11, r: 0 } },
      { s: { c: 12, r: 0 }, e: { c: 14, r: 0 } },
      { s: { c: 15, r: 0 }, e: { c: 18, r: 0 } },
      { s: { c: 19, r: 0 }, e: { c: 22, r: 0 } },
      { s: { c: 23, r: 0 }, e: { c: 28, r: 0 } },
    ];
    const sheetOptions = { "!merges": ranges };

    for (let i = 0; i < customers.length; i++) {
      data.push([
        ECustomerStatusMessage[customers[i]?.status], // Tình trạng khách hàng
        customers[i].customerCode, // 'Mã khách hàng',
        customers[i].fullName, // 'Tên khách hàng',
        formatDate(customers[i].createdAt, EFormatDate.DD_MM_YYYY_HH_mm), // 'Ngày Tháng nhập thông tin',
        customers[i].beneficiary || "", // 'Tên người thụ hưởng',
        customers[i].jobTitle || "", // 'Chức vụ',
        customers[i].beneficiaryPhone || "", // 'SĐT người thụ hưởng',
        GetMessageDirectBeneficiary(customers[i].isDirectBeneficiary), // 'Người trực tiếp hưởng hay người thân',
        customers[i].relationshipBeneficiaries || "", // 'Quan hệ với người thụ hưởng',
        customers[i].beneficiaryAccountNumber || "", // 'Số tài khoản thụ hưởng',
        customers[i].beneficiaryBank || "", // 'Ngân hàng thụ hưởng',
        customers[i].beneficiaryNote || "", // 'Ghi chú',
        customers[i].typeOfPayment || "", // 'Loại thanh toán //2',
        customers[i].previousCosing || "", // 'Kỳ chốt cước',
        customers[i].financeNote || "", // 'Ghi chú',
        customers[i].notifyContactPerson || "", // 'Người liên hệ //3',
        customers[i].bookingEmail || "", // 'Danh sách mail gửi bảng kê tự động',
        customers[i].bookingMobile || "", // 'Số di động',
        customers[i].notifyPriceListNote || "", // Ghi chú
        customers[i].orderContactPerson || "", // 'Người liên hệ //4',
        customers[i].orderEmail || "", // 'Danh sách mail gửi hóa đơn tự động',
        customers[i].orderPhone || "", // 'Số di động',
        customers[i].orderNote || "", // Ghi chú
        customers[i].debtContactPerson || "", // 'Người liên hệ //5',
        customers[i].debtEmail || "", // 'Email thu nợ',
        customers[i].debtPhone || "", // 'Số điện thoại',
        customers[i].debtMobile || "", // 'Số di động',
        customers[i].debtAddress || "", // 'Địa chỉ thu nợ',
        customers[i].debtNote || "", // Ghi chú
      ]);
    }

    const buffer = xlsx.build([
      { name: "Customer", data: data, options: sheetOptions },
    ]);
    return {
      buffer,
      filename: `customer_detail.xlsx`,
    };
  }

  async getCargoList(getCargoListDto: GetCargoListDto) {
    let { month, year, search, from, to } = getCargoListDto;
    if (!month) {
      month = dayjs().get("month");
    }
    if (!year) {
      year = dayjs().get("year");
    }
    if (!from) {
      from = dayjs().startOf("month").format();
    }
    if (!to) {
      to = dayjs().endOf("month").format();
    }

    const query = this.customerRepository
      .createQueryBuilder("customer")
      .leftJoin("booking", "booking", "booking.customer_id = customer.id")
      .innerJoin("finance_cpn", "fc", "fc.booking_id = booking.id")
      .innerJoin("pu_deliveries", "pd", "pd.booking_id = booking.id")
      .innerJoin("connect_bill", "cb", "pd.connect_bill_id = cb.id")
      .innerJoin("ml_exchange_rates", "mer", "mer.id = fc.exchange_rate_id")
      .leftJoin(
        (subQuery) => {
          return subQuery
            .from("customers", "c")
            .innerJoin("cargo_list_log", "cll", "cll.customer_id = c.id")
            .select(["c.id as customer_id", "MAX(cll.created_at) as last_sent"])
            .groupBy("c.id");
        },
        "ls",
        "ls.customer_id = customer.id"
      )
      .select([
        "customer.id as customer_id",
        "customer.full_name as customer_name",
        "customer.customer_code as customer_code",
        "customer.notify_contact_person as notify_contact_person",
        "customer.booking_mobile as customer_booking_mobile",
        "customer.booking_email as customer_booking_email",
        "customer.notify_price_list_note as price_list_note",
        "ls.last_sent as last_sent",
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.total_sales_vat * mer.rate 
            ELSE fc.total_sales_vat 
          END
        ) as total_sales_including_vat_vnd`,
        `SUM(
          CASE 
            WHEN fc.currency = 'USD' THEN fc.total_sales_vat 
            ELSE fc.total_sales_vat / mer.rate
          END
        ) as total_sales_including_vat_usd`,
      ]);

    query.where("DATE(cb.created_at) BETWEEN :from AND :to", {
      from,
      to,
    });

    if (search) {
      query.andWhere(
        "(customer.customer_code ILIKE :search OR customer.full_name ILIKE :search OR customer.full_name_en ILIKE :search)",
        {
          search: `%${search}%`,
        }
      );
    }

    query
      .orderBy("customer.customer_code", "ASC")
      .groupBy("customer.id")
      .addGroupBy("ls.last_sent");

    return CommonPaginationRaw(getCargoListDto, query);
  }
}
