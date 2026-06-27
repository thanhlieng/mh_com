import { PartialType } from '@nestjs/swagger';
import { CreateHomePageDto } from './create.dto';

export class UpdateHomePageDto extends PartialType(CreateHomePageDto) {}
