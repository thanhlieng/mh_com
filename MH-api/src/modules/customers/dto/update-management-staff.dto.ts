import { PartialType } from '@nestjs/swagger';
import { CreateManagementStaffDto } from './create-management-staff.dto';

export class UpdateManagementStaffDto extends PartialType(
  CreateManagementStaffDto,
) {}
