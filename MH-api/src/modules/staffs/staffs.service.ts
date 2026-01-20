import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import xlsx from 'node-xlsx';
import {
  CommonError,
  CommonResponse,
  EFormatDate,
  LevelStaffMessage,
  MaritalMessage,
  Status,
} from 'src/common/constants/common.constants';
import { CommonPagination } from 'src/common/helper/common-pagination';
import { commonResponse } from 'src/common/helper/common-response';
import { formatDate } from 'src/common/helper/helper';
import IJwtPayload, { IHistoryInfo } from '../auth/payloads/jwt-payload';
import { EVENT_CONST } from '../events/event.const';
import { HistoryAction, HistoryType } from '../history/history.const';
import { RolesService } from '../roles/roles.service';
import { CreateStaffsDto } from './dto/create-staffs.dto';
import { ColumnNameExportStaff } from './dto/export.dto';
import { ExportStaffDto, FilterStaffDto } from './dto/filter-staff.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateStaffsDto } from './dto/update-staffs.dto';
import { StaffsEntity } from './entities/staffs.entity';
import { StaffRepository } from './staffs.repository';

@Injectable()
export class StaffsService {
  constructor(
    private readonly staffsRepository: StaffRepository,

    private readonly roleService: RolesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getStaffByPayload(payload: IJwtPayload): Promise<StaffsEntity> {
    const staff: any = await this.staffsRepository
      .createQueryBuilder('staff')
      .innerJoinAndMapOne('staff.user', 'users', 'u', 'u.id = staff.user_id')
      .leftJoinAndMapOne('staff.unit', 'units', 'unit', 'staff.unit_id = unit.id')
      .where('u.id = :userId', {
        userId: payload.id,
      })
      .getOne();

    if (!staff) {
      throw new BadRequestException(CommonError.NOT_FOUND_STAFF);
    }

    return staff;
  }

  async getStaffByPayloadNotHandle(payload: IJwtPayload) {
    const staff: any = await this.staffsRepository
      .createQueryBuilder('staff')
      .innerJoinAndMapOne('staff.user', 'users', 'u', 'u.id = staff.user_id')
      .leftJoinAndMapOne('staff.unit', 'units', 'unit', 'staff.unit_id = unit.id')
      .leftJoinAndMapOne('staff.department', 'department', 'd', 'staff.department_id = d.id')
      .where('u.id = :userId', {
        userId: payload.id,
      })
      .getOne();

    return staff;
  }

  create(createStaffsDto: CreateStaffsDto) {
    return this.staffsRepository.save(createStaffsDto);
  }

  async findAll(filterStaffDto: FilterStaffDto) {
    const { search, departmentId, unitId, orderBy, status } = filterStaffDto;

    const getStaffQuery = this.staffsRepository
      .createQueryBuilder('staff')
      .leftJoinAndMapOne('staff.user', 'users', 'u', 'u.id = staff.user_id')
      .leftJoinAndMapOne('staff.unit', 'units', 'unit', 'staff.unit_id = unit.id');

    if (unitId) {
      getStaffQuery.where('staff.unit_id = :unitId', { unitId });
    }

    if (departmentId) {
      getStaffQuery.andWhere('staff.department_id = :departmentId', {
        departmentId,
      });
    }

    if (search) {
      getStaffQuery.andWhere(`UPPER(staff.full_name) LIKE N'%${search.toUpperCase()}%'`);
    }

    if (status) {
      getStaffQuery.where('staff.status = :status', { status });
    }

    if (orderBy) {
      const sort = orderBy.split('_');
      getStaffQuery.orderBy(`staff.${sort[0]}`, sort[1].toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    } else {
      getStaffQuery.orderBy('staff.createdAt', 'DESC');
    }

    return CommonPagination(filterStaffDto, getStaffQuery);
  }

  async findAllStaff() {
    return this.staffsRepository.find({
      where: {
        status: Status.ACTIVE,
      }
    });
  }

  async findOne(id: string) {
    const staff = await this.staffsRepository
      .createQueryBuilder('staff')
      .innerJoinAndMapOne('staff.user', 'users', 'u', 'u.id = staff.user_id')
      .leftJoinAndMapOne('staff.unit', 'units', 'unit', 'staff.unit_id = unit.id')
      // .leftJoinAndMapOne(
      //   'staff.department',
      //   'department',
      //   'd',
      //   'staff.department_id = d.id',
      // )
      .where('staff.id = :id', { id })
      .getOne();

    if (!staff) throw new NotFoundException(CommonError.NOT_FOUND_STAFF);

    return staff;
  }

  async update(id: string, updateCustomerDto: UpdateStaffsDto, info: IHistoryInfo) {
    const staff = await this.staffsRepository.findOne({ where: { id } });
    const oldItem = staff;
    Object.assign(staff, updateCustomerDto);

    const newItem = await staff.save();

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Staff,
      action: HistoryAction.Edit,
      newItem,
      oldItem,
    });

    return newItem;
  }

  async updateProfile(updateStaffsDto: UpdateStaffsDto, payload: IJwtPayload) {
    const staff = await this.getStaffByPayload(payload);

    Object.assign(staff, updateStaffsDto);

    return staff.save();
  }

  remove(id: string) {
    return this.staffsRepository.delete(id);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const { roleIds } = updateRoleDto;
    const staff = await this.findOne(id);
    await this.roleService.createRoleUser(roleIds, staff.userId);

    return commonResponse(CommonResponse.SUCCESS, {});
  }

  async getRolesStaff(id: string) {
    const staff = await this.findOne(id);
    return this.roleService.getRolesStaff(staff);
  }

  async exportStaffExcelFile(dto: ExportStaffDto) {
    const { status } = dto;
    const data = [ColumnNameExportStaff];

    const query = this.staffsRepository
      .createQueryBuilder('staff')
      .leftJoinAndMapOne('staff.unit', 'units', 'unit', 'unit.id = staff.region')
      .orderBy('staff.staff_code', 'ASC');

    if (status) {
      query.where('staff.status = :status', { status });
    }

    const staffs = await query.getMany();

    for (let i = 0; i < staffs.length; i++) {
      const staff = staffs[i];
      data.push([
        String(i + 1),
        staff.fullName,
        staff.staffCode,
        staff.position,
        staff.gender,
        formatDate(staff.dayOfBirth, EFormatDate.DD_MM_YYYY),
        staff.placeOfBirth,
        staff.temporaryAddress,
        staff.permanentAddress,
        staff.ethnic,
        staff.religion,
        staff.nationality,
        LevelStaffMessage[staff.level],
        MaritalMessage[staff.marital],
        staff.element,
        staff.email,
        staff.emailCompany,
        staff.phoneNumber,
        staff.phoneCode,
        staff.peopleId,
        formatDate(staff.issueDate, EFormatDate.DD_MM_YYYY),
        staff.issuePlace,
        staff.unit?.name,
        staff.taxCode,
        staff.bankAccountNumber,
        staff.bankCode,
        staff.socialInsuranceId,
        staff.healthInsuranceId,
        formatDate(staff.issueInsuranceDate, EFormatDate.DD_MM_YYYY),
        formatDate(staff.insuranceParticipationDate, EFormatDate.DD_MM_YYYY),
        formatDate(staff.latestPromotionDate, EFormatDate.DD_MM_YYYY),
        staff.unionBookNumber,
      ]);
    }

    const buffer = xlsx.build([{ name: 'Nhân viên', data: data, options: {} }]);
    return {
      buffer,
      filename: `employee.xlsx`,
    };
  }
}
