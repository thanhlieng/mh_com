import { PartialType } from '@nestjs/swagger';
import { CreateReceiverAddressDto } from './create-receiver-address.dto';

export class UpdateReceiverAddressDto extends PartialType(
  CreateReceiverAddressDto,
) {}
