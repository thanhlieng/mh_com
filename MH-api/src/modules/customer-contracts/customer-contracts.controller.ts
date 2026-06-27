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
import { CustomerContractService } from './customer-contracts.service';
import { CreateCustomerContractDto } from './dto/create-customer-contracts.dto';
import { UpdateCustomerContractDto } from './dto/update-customer-contracts.dto';
import {
  ResponseCustomerContractDto,
  ResponseListContractDto,
} from './dto/response-customer-contracts.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { GetContractDto } from './dto/search-contract.dto';
import { GetMyContractDto } from './dto/get-my-contract.dto';

@ApiTags('CustomerContract')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('customer-contract')
export class CustomerContractController {
  constructor(
    private readonly customerContractService: CustomerContractService,
  ) {}

  @Post()
  @ApiOkResponse({ type: ResponseCustomerContractDto })
  create(@Body() createCustomerContractDto: CreateCustomerContractDto) {
    return this.customerContractService.create(createCustomerContractDto);
  }

  @Get()
  @ApiOkResponse({ type: ResponseListContractDto })
  findAll(@Query() getContractDto: GetContractDto) {
    return this.customerContractService.findAll(getContractDto);
  }

  @Get('/my-contract')
  @ApiOkResponse({ type: ResponseListContractDto })
  myContract(
    @GetUser() payload: IJwtPayload,
    @Query() getMyContractDto: GetMyContractDto,
  ) {
    return this.customerContractService.myContract(payload, getMyContractDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: ResponseCustomerContractDto })
  findOne(@Param('id') id: string) {
    return this.customerContractService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ResponseCustomerContractDto })
  update(
    @Param('id') id: string,
    @Body() updateCustomerContractDto: UpdateCustomerContractDto,
  ) {
    return this.customerContractService.update(id, updateCustomerContractDto);
  }

  @Delete(':id')
  @ApiOkResponse()
  remove(@Param('id') id: string) {
    return this.customerContractService.remove(id);
  }
}
