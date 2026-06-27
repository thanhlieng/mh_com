import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreateInvoiceDetailDto } from './create-invoice-detail.dto';

export class UpdateInvoiceDetailDto extends CreateInvoiceDetailDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
