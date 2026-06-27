import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { CustomerService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customers.dto';
import { UpdateCustomerDto } from './dto/update-customers.dto';
import { ResponseCustomerDto, ResponseListCustomerDto } from './dto/response-customers.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetUser } from 'src/common/decorators/user.decorator';
import IJwtPayload, { IHistoryInfo } from '../auth/payloads/jwt-payload';
import { FilterCustomerDto } from './dto/filter-customer.dto';
import { IndividualCustomerDto } from './dto/create-individual-customer.dto';
import { BusinessCustomerDto } from './dto/create-business-customer.dto';
import { FindCustomerDto } from './dto/find-customer.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import { EModulePermissionName, EPermissionActionKey, EPermissionDescription } from 'src/common/guards/permission';
import { GetHistory } from 'src/common/decorators/history-info.decorator';

const moduleName = EModulePermissionName.CUSTOMER;
@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('individual-customers')
  @HttpCode(HttpStatus.OK)
  sendRequestCreateIndividualCustomer(@Body() individualCustomerDto: IndividualCustomerDto) {
    return this.customerService.sendRequestCreateIndividualCustomer(individualCustomerDto);
  }

  @Post('business-customers')
  @HttpCode(HttpStatus.OK)
  sendRequestCreateBusinessCustomer(@Body() businessCustomerDto: BusinessCustomerDto) {
    return this.customerService.sendRequestCreateBusinessCustomer(businessCustomerDto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.CREATE_CUSTOMER,
      description: EPermissionDescription.CREATE_CUSTOMER,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_CUSTOMER,
      description: EPermissionDescription.GET_ALL_LIST_CUSTOMER,
      moduleName: moduleName,
    },
  )
  @ApiCreatedResponse({
    type: ResponseCustomerDto,
  })
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @GetUser() payload: IJwtPayload,
    @GetHistory() info: IHistoryInfo,
  ) {
    return this.customerService.createCustomer(createCustomerDto, payload, info);
  }

  @Get('register-permisson-private')
  @Permission(
    {
      action: EPermissionActionKey.GET_PRIVATE_INFORMATION_CUSTOMER,
      description: EPermissionDescription.GET_PRIVATE_INFORMATION_CUSTOMER,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_CUSTOMER,
      description: EPermissionDescription.GET_ALL_LIST_CUSTOMER,
      moduleName: moduleName,
    },
  )
  registerPermissionPrivate() {
    return 'SOHAN';
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_LIST_CUSTOMER,
      description: EPermissionDescription.GET_LIST_CUSTOMER,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_CUSTOMER,
      description: EPermissionDescription.GET_ALL_LIST_CUSTOMER,
      moduleName: moduleName,
    },
  )
  @ApiOkResponse({ type: ResponseListCustomerDto })
  findAll(@Query() filterCustomerDto: FilterCustomerDto, @GetUser() payload: IJwtPayload) {
    return this.customerService.findAll(filterCustomerDto, payload);
  }

  @Get('generate-excel-price-list/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_CUSTOMER_DETAIL,
      description: EPermissionDescription.GET_CUSTOMER_DETAIL,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_CUSTOMER,
      description: EPermissionDescription.GET_ALL_LIST_CUSTOMER,
      moduleName: moduleName,
    },
  )
  generateExcelPriceList(@Param('id') id: string) {
    return this.customerService.generateExcelFilePriceList(id);
  }


  @Get('generate-excel-price-list')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  generateAllPriceList(@GetUser() payload: IJwtPayload) {
    return this.customerService.generateExcelExportAllPriceList(payload);
  }

  @Get('generate-excel-contract')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  generateExcelContract(@GetUser() payload: IJwtPayload) {
    return this.customerService.generateExcelContract(payload);
  }

  @Get('generate-excel-customer')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  generateExcelCustomer(@GetUser() payload: IJwtPayload) {
    return this.customerService.generateExcelCustomer(payload);
  }

  @Get('generate-excel-customer-detail')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  generateExcelCustomerDetail(@GetUser() payload: IJwtPayload) {
    return this.customerService.generateExcelCustomerDetail(payload);
  }

  @Get('search-customer-by-code')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_LIST_CUSTOMER,
      description: EPermissionDescription.GET_LIST_CUSTOMER,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_CUSTOMER,
      description: EPermissionDescription.GET_ALL_LIST_CUSTOMER,
      moduleName: moduleName,
    },
  )
  findCustomerByCode(@Query() findCustomerDto: FindCustomerDto) {
    return this.customerService.findCustomerByCustomerCode(findCustomerDto);
  }

  @Get('/my-profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseCustomerDto })
  myProfile(@GetUser() payload: IJwtPayload) {
    return this.customerService.getCustomerByPayload(payload);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_CUSTOMER_DETAIL,
      description: EPermissionDescription.GET_CUSTOMER_DETAIL,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_CUSTOMER,
      description: EPermissionDescription.GET_ALL_LIST_CUSTOMER,
      moduleName: moduleName,
    },
  )
  @ApiOkResponse({ type: ResponseCustomerDto })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.UPDATE_CUSTOMER,
      description: EPermissionDescription.UPDATE_CUSTOMER,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_CUSTOMER,
      description: EPermissionDescription.GET_ALL_LIST_CUSTOMER,
      moduleName: moduleName,
    },
  )
  @ApiOkResponse({ type: ResponseCustomerDto })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @GetHistory() info: IHistoryInfo) {
    return this.customerService.update(id, updateCustomerDto, info);
  }
}
