import { PartialType } from '@nestjs/swagger';
import { CreateOtherPriceDto } from './create-other-price.dto';

export class UpdateOtherPriceDto extends PartialType(CreateOtherPriceDto) {}
