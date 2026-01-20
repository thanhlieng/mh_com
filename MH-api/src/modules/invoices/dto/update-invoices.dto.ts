import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTemplateInvoiceDto } from './create-invoices.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateInvoiceDto extends PartialType(CreateTemplateInvoiceDto) {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  id: string;
}
