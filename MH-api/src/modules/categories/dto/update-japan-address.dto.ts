import { PartialType } from '@nestjs/swagger';
import { CreateJapanAddressDto } from './create-japan-address.dto';

export class UpdateJapanAddressDto extends PartialType(CreateJapanAddressDto) {}
