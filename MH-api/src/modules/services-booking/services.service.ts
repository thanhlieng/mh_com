import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CommonResponse, ETypeService, ETypeUser, EZoneService } from 'src/common/constants/common.constants';
import { commonResponse } from 'src/common/helper/common-response';
import { aftershipConfig } from 'src/configs/configs.constants';
import { FindOneOptions, In, IsNull, Repository } from 'typeorm';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { CustomerService } from '../customers/customers.service';
import { RolesService } from '../roles/roles.service';
import { EAftershipStatusCode } from '../trackings/constants/status_code';
import { ICreateTrackingAftership } from '../trackings/interface/create-tracking-aftership.interface';
import { CalculateBulkyWeightDto } from './dto/calculate-bulky-weight.dto';
import { CreatePartnerServiceDto } from './dto/create-partner-service.dto';
import { CreateServiceDto } from './dto/create-services.dto';
import { CreateZoneSmallServiceDto } from './dto/create-zone-small-service.dto';
import { GetPartnerServiceDto } from './dto/get-partner-service.dto';
import { UpdateServiceDto } from './dto/update-services.dto';
import { ServiceEntity } from './entities/services.entity';
import { ZoneServiceEntity } from './entities/zone-services.entity';

@Injectable()
export class ServiceService {
  mapServices: { [key: string]: ServiceEntity } = {};

  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,

    @InjectRepository(ZoneServiceEntity)
    private readonly zoneServiceRepository: Repository<ZoneServiceEntity>,

    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,

    private readonly roleService: RolesService,
  ) {}

  async checkCodeAftershipExists(code: string) {
    const endpoint = `${aftershipConfig.url}/v4/trackings`;
    const createTrackingAftership: ICreateTrackingAftership = {
      slug: code,
      tracking_number: 'test',
      title: 'test',
      order_id: 'test',
      order_number: 'test',
    };

    try {
      await axios.post(
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

      return commonResponse(CommonResponse.SUCCESS, null);
    } catch (error) {
      if (error?.response?.data?.meta?.code === EAftershipStatusCode.TRACKING_EXISTS) {
        return commonResponse(CommonResponse.SUCCESS, null);
      }
      if (error?.response?.data?.meta?.code === EAftershipStatusCode.PARTNER_NOT_EXISTS) {
        throw new NotFoundException('Code aftership not exists !');
      }

      throw new InternalServerErrorException(error);
    }
  }

  async create(createServiceDto: CreateServiceDto) {
    switch (createServiceDto.typeService) {
      case ETypeService.SERVICE_PARTNER:
        createServiceDto.codeAftership = createServiceDto.codeAftership?.trim();
        createServiceDto.codeAftership &&
          createServiceDto.codeAftership != '' &&
          (await this.checkCodeAftershipExists(createServiceDto.codeAftership));
        return this.serviceRepository.save(createServiceDto);

      default:
        return this.serviceRepository.save(createServiceDto);
    }
  }

  async createPartnerService(createPartnerServiceDto: CreatePartnerServiceDto) {
    return this.serviceRepository.save({
      ...createPartnerServiceDto,
      typeService: ETypeService.SERVICE_PARTNER,
      zone: createPartnerServiceDto.zone ? createPartnerServiceDto.zone : EZoneService.DOMESTIC,
    });
  }

  async createZoneSmallService(createZoneSmallServiceDto: CreateZoneSmallServiceDto, id: string) {
    return this.zoneServiceRepository.save({
      serviceId: id,
      name: createZoneSmallServiceDto.name,
    });
  }

  async findAll(payload?: IJwtPayload) {
    let conditions = {
      typeService: ETypeService.SERVICE_BOOKING,
    };
    if (payload?.typeUser === ETypeUser.CLIENT) {
      const customer = await this.customerService.getCustomerByPayload(payload);

      if (customer?.service?.length) conditions['id'] = In(customer.service);
      else conditions['name'] = '';
    }

    return this.serviceRepository.find({
      where: conditions,
    });
  }

  findPartnerService(getPartnerServiceDto?: GetPartnerServiceDto) {
    const { zone } = getPartnerServiceDto;

    return this.serviceRepository.find({
      where: {
        typeService: ETypeService.SERVICE_PARTNER,
        zone: zone ? zone : IsNull(),
      },
    });
  }

  findConnectServicePartner() {
    return this.serviceRepository.find({
      where: {
        typeService: ETypeService.CONNECTION_PARTNER,
      },
    });
  }

  findSmallService() {
    return this.serviceRepository.find({
      where: {
        typeService: ETypeService.SMALL_SERVICE,
      },
    });
  }

  findZoneSmallService(smallServiceId: string) {
    return this.zoneServiceRepository.find({
      where: {
        serviceId: smallServiceId,
      },
    });
  }

  async findOne(options: FindOneOptions<ServiceEntity>) {
    const checkService = await this.serviceRepository.findOne(options);
    if (!checkService) {
      throw new NotFoundException();
    } else {
      return checkService;
    }
  }

  async findOneById(id: string) {
    let service = this.mapServices[id];
    if (!service) {
      service = await this.serviceRepository.findOne({
        where: {
          id: id,
        },
      });
    }
    if (!service) {
      throw new NotFoundException();
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const checkService = await this.serviceRepository.findOneBy({ id });
    if (!checkService) {
      throw new NotFoundException();
    } else {
      if (updateServiceDto.codeAftership && updateServiceDto.codeAftership != '') {
        await this.checkCodeAftershipExists(updateServiceDto.codeAftership);
      }

      delete this.mapServices[id];

      return this.serviceRepository.update(id, updateServiceDto);
    }
  }

  async remove(id: string) {
    const checkService = await this.serviceRepository.findOneBy({ id });
    if (!checkService) {
      throw new NotFoundException();
    } else {
      if (checkService.key) {
        throw new BadRequestException('Đây là lựa chọn mặc định. Không thể xóa!');
      }

      try {
        await this.serviceRepository.delete(id);
        delete this.mapServices[id];
      } catch (error) {
        throw new BadRequestException('Lựa chọn này đã được sử dụng trong hệ thống! Không thể xóa !');
      }
    }
  }

  async calculateBulkyWeight(calculateBulkyWeightDto: CalculateBulkyWeightDto) {
    const { serviceId, height, longs, width } = calculateBulkyWeightDto;

    let service = this.mapServices[serviceId];
    if (!service) {
      service = await this.serviceRepository.findOne({
        where: {
          id: serviceId,
          typeService: ETypeService.SERVICE_BOOKING,
        },
      });
    }

    if (!service) {
      throw new BadRequestException('Dịch vụ đơn hàng không tồn tại! vui lòng kiểm tra lại');
    }
    if (!service.coefficient) {
      return 0;
    }

    return (height * longs * width) / service.coefficient;
  }
}
