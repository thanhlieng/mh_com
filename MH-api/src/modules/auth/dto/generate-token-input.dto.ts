import { ETypeUser } from 'src/common/constants/common.constants';

export class GenerateTokenInputDto {
  id: string;
  username: string;
  typeUser: string;
  permissions: string[];
  a_supplier_id?: string;
  a_customer_id?: string;
}
