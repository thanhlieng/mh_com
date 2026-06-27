import { PartialType } from '@nestjs/swagger';
import { CreateCheckPointAdminDto } from './create-checkpoint-admin.dto';

export class UpdateCheckpointAdminDto extends PartialType(
  CreateCheckPointAdminDto,
) {}
