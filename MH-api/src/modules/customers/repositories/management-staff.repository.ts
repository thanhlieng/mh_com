import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GetManagementStaffDTO } from '../dto/get-management-staff.dto';
import { ManagementStaffEntity } from '../entities/management-staff.entity';

@Injectable()
export class ManagementStaffRepository extends Repository<ManagementStaffEntity> {
  constructor(private dataSource: DataSource) {
    super(ManagementStaffEntity, dataSource.createEntityManager());
  }

  async getManagementStaffs(dto: GetManagementStaffDTO): Promise<ManagementStaffEntity[]> {
    const { customerID, typeStaff } = dto;

    const query = this.createQueryBuilder('management_staff').innerJoinAndMapOne(
      'management_staff.staff',
      'staffs',
      'staff',
      'staff.id = management_staff.staff_id',
    );

    if (customerID) {
      query.andWhere('management_staff.customer_id = :customerID', { customerID });
    }

    if (typeStaff) {
      query.andWhere('management_staff.type_staff = :typeStaff', { typeStaff });
    }

    return query.getMany();
  }
}
