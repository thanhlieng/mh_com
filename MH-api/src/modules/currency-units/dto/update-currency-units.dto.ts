import { PartialType } from '@nestjs/mapped-types';
import { CreateCurrencyUnitDto } from './create-currency-units.dto';

export class UpdateCurrencyUnitDto extends PartialType(CreateCurrencyUnitDto) {}
