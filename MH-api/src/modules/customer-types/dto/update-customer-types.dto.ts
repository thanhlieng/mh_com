import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerTypeDto } from './create-customer-types.dto';

export class UpdateCustomerTypeDto extends PartialType(CreateCustomerTypeDto) {}
