import { PartialType } from '@nestjs/mapped-types';
import { CreateCommoditiesTypeDto } from './create-commodities-types.dto';

export class UpdateCommoditiesTypeDto extends PartialType(
  CreateCommoditiesTypeDto,
) {}
