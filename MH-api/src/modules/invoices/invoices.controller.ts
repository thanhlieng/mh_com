import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoices.service';
import {
  CreateInvoiceDto,
  CreateTemplateInvoiceDto,
} from './dto/create-invoices.dto';
import { UpdateInvoiceDto } from './dto/update-invoices.dto';
import { ResponseInvoiceDto } from './dto/response-invoices.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/user.decorator';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { GetInvoiceDto } from './dto/get-invoice.dto';

@ApiTags('Invoice')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('/admin')
  @ApiResponse({ type: ResponseInvoiceDto })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @GetUser() payload: IJwtPayload,
  ) {
    return this.invoiceService.create(createInvoiceDto, payload);
  }

  @Post('/admin/template')
  createTemplateInvoice(
    @Body() createTemplateInvoiceDto: CreateTemplateInvoiceDto,
  ) {
    return this.invoiceService.createInvoiceTemplate(createTemplateInvoiceDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseInvoiceDto] })
  findAll(@Query() getInvoiceDto: GetInvoiceDto) {
    return this.invoiceService.findAll(getInvoiceDto);
  }

  @Get('/admin/template')
  getInvoiceTemplates() {
    return this.invoiceService.getInvoiceTemplates();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseInvoiceDto })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ResponseInvoiceDto })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  deleteInvoiceTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoiceService.removeInvoiceTemplate(id);
  }
}
