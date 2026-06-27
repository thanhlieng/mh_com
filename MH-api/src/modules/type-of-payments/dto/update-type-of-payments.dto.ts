import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeOfPaymentDto } from './create-type-of-payments.dto';

export class UpdateTypeOfPaymentDto extends PartialType(
  CreateTypeOfPaymentDto,
) {}
