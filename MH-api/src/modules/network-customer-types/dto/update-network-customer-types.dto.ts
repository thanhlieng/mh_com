import { PartialType } from '@nestjs/mapped-types';
import { CreateNetworkCustomerTypeDto } from './create-network-customer-types.dto';

export class UpdateNetworkCustomerTypeDto extends PartialType(
  CreateNetworkCustomerTypeDto,
) {}
