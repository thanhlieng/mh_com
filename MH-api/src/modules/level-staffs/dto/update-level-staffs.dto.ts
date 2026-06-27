import { PartialType } from '@nestjs/mapped-types';
import { CreateLevelStaffsDto } from './create-level-staffs.dto';

export class UpdateLevelStaffsDto extends PartialType(CreateLevelStaffsDto) {}
