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
  Query,
} from '@nestjs/common';
import { ReceiverCustomerService } from './receiver-customers.service';
import { CreateReceiverCustomerDto } from './dto/create-receiver-customers.dto';
import { UpdateReceiverCustomerDto } from './dto/update-receiver-customers.dto';
import {
  ResponseListReceiverCustomerDto,
  ResponseReceiverCustomerDto,
} from './dto/response-receiver-customers.dto';
import { GetUser } from 'src/common/decorators/user.decorator';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetReceiverCustomerDto } from './dto/get-receiver-customer.dto';

@ApiTags('ReceiverCustomer')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('receiver-customer')
export class ReceiverCustomerController {
  constructor(
    private readonly receiverCustomerService: ReceiverCustomerService,
  ) {}

  @Post()
  @ApiOkResponse({ type: ResponseReceiverCustomerDto })
  create(
    @Body() createReceiverCustomerDto: CreateReceiverCustomerDto,
    @GetUser() payload: IJwtPayload,
  ) {
    return this.receiverCustomerService.create(
      createReceiverCustomerDto,
      payload,
    );
  }

  @Get()
  @ApiOkResponse({ type: ResponseListReceiverCustomerDto })
  findAll() {
    return this.receiverCustomerService.findAll();
  }

  @Get('/search')
  @ApiOkResponse({ type: ResponseListReceiverCustomerDto })
  searchReceiverCustomer(
    @GetUser() payload: IJwtPayload,
    @Query() getReceiverCustomerDto: GetReceiverCustomerDto,
  ) {
    return this.receiverCustomerService.searchReceiverCustomer(
      payload,
      getReceiverCustomerDto,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseReceiverCustomerDto })
  findOne(@Param('id') id: string) {
    return this.receiverCustomerService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ResponseReceiverCustomerDto })
  update(
    @Param('id') id: string,
    @Body() updateReceiverCustomerDto: UpdateReceiverCustomerDto,
  ) {
    return this.receiverCustomerService.update(id, updateReceiverCustomerDto);
  }

  @Delete(':id')
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.receiverCustomerService.remove(id);
  }
}
