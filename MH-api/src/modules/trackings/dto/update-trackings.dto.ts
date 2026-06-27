import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackingsDto } from './create-trackings.dto';

export class UpdateTrackingsDto extends PartialType(CreateTrackingsDto) {}
