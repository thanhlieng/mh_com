import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingItemDto } from './create-shipping-items.dto';

export class UpdateShippingItemDto extends PartialType(CreateShippingItemDto) {}
