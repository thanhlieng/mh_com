import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryConditionsDto } from './create-delivery-conditions.dto';

export class UpdateDeliveryConditionsDto extends PartialType(
  CreateDeliveryConditionsDto,
) {}
