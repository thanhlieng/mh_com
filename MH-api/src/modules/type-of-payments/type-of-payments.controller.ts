import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TypeOfPaymentService } from './type-of-payments.service';
import { CreateTypeOfPaymentDto } from './dto/create-type-of-payments.dto';
import { UpdateTypeOfPaymentDto } from './dto/update-type-of-payments.dto';
import { ResponseTypeOfPaymentDto } from './dto/response-type-of-payments.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('TypeOfPayment')
@Controller('type-of-payment')
export class TypeOfPaymentController {
  constructor(private readonly typeOfPaymentService: TypeOfPaymentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseTypeOfPaymentDto })
  @ApiBearerAuth()
  create(@Body() createTypeOfPaymentDto: CreateTypeOfPaymentDto) {
    return this.typeOfPaymentService.create(createTypeOfPaymentDto);
  }

  @Get()
  @ApiOkResponse({ type: [ResponseTypeOfPaymentDto] })
  findAll() {
    return this.typeOfPaymentService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseTypeOfPaymentDto })
  findOne(@Param('id') id: string) {
    return this.typeOfPaymentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseTypeOfPaymentDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateTypeOfPaymentDto: UpdateTypeOfPaymentDto,
  ) {
    return this.typeOfPaymentService.update(id, updateTypeOfPaymentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse()
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.typeOfPaymentService.remove(id);
  }
}
