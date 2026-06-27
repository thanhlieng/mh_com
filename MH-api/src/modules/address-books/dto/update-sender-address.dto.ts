import { PartialType } from '@nestjs/swagger';
import { CreateSenderAddressDto } from './create-sender-address.dto';

export class UpdateSenderAddressDto extends PartialType(
  CreateSenderAddressDto,
) {}
