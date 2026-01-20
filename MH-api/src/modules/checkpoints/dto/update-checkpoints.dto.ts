import { PartialType } from '@nestjs/mapped-types';
import { CreateCheckpointsDto } from './create-checkpoints.dto';

export class UpdateCheckpointsDto extends PartialType(CreateCheckpointsDto) {}
