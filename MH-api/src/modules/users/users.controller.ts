import {
  Get,
  Body,
  Controller,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  Post,
  Patch,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';
import { ResponsePagination } from 'src/common/dto/response-pagination.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import IJwtPayload, { IHistoryInfo } from '../auth/payloads/jwt-payload';
import { ResponseCustomerDto } from '../customers/dto/response-customers.dto';
import { ResponseCreateStaffDto } from '../staffs/dto/response-create-staff.dto';
import { AdminResetPassDto, ChangePasswordDto } from './dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { ChangeStatusDto } from './dto/change-status-user.dto';
import { CreateAccountCustomerDto } from './dto/create-customer.dto';
import { CreateAccountStaffDto } from './dto/create-staff.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { ResponseUsersDto } from './dto/response-users.dto';
import { UserEntity } from './user.entity';
import { UsersSummary } from './users.constants';
import { UsersService } from './users.service';
import { Permission } from 'src/common/decorators/permission.decorator';
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from 'src/common/guards/permission';
import { GetHistory } from 'src/common/decorators/history-info.decorator';
import { CommonResponse } from '@constants/common.constants';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: ResponseUsersDto })
  createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.create(createUserDto);
  }

  @Post('/customer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: UsersSummary.CREAT_CUSTOMER })
  createCustomer(@Body() createAccountCustomerDto: CreateAccountCustomerDto) {
    return this.usersService.createCustomer(createAccountCustomerDto);
  }

  @Post('/create-account-customer')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: UsersSummary.CREAT_CUSTOMER })
  @ApiBearerAuth()
  @ApiResponse({ type: ResponseCustomerDto })
  createAccountCustomer(
    @Body() createAccountCustomerDto: CreateAccountCustomerDto,
  ) {
    return this.usersService.createAccountCustomer(createAccountCustomerDto);
  }

  @Post('/staff')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiResponse({
    type: ResponseCreateStaffDto,
  })
  @Permission({
    action: EPermissionActionKey.CREATE_STAFF,
    description: EPermissionDescription.CREATE_STAFF,
    moduleName: EModulePermissionName.STAFF,
  })
  @ApiOperation({ summary: UsersSummary.CREAT_STAFF })
  createStaff(
    @Body() createAccountStaffDto: CreateAccountStaffDto,
    @GetHistory() info: IHistoryInfo,
  ) {
    return this.usersService.createStaff(createAccountStaffDto, info);
  }

  @Post('/reset-password-staff')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.CREATE_STAFF,
    description: EPermissionDescription.CREATE_STAFF,
    moduleName: EModulePermissionName.STAFF,
  })
  @ApiOperation({ summary: UsersSummary.CREAT_STAFF })
  resetPasswordStaff() {
    return this.usersService.resetPasswordStaff();
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: UsersSummary.GET_ALL })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async get(
    @Query() getUsersDto: GetUsersDto,
  ): Promise<ResponsePagination<UserEntity>> {
    return this.usersService.getUsers(getUsersDto);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: UsersSummary.GET_BY_ID })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<UserEntity> {
    return this.usersService.findCustomerOrStaffById(id);
  }

  @Patch('/change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: UsersSummary.CHANGE_PASSWORD })
  changePassword(
    @GetUser() payload: IJwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(payload, changePasswordDto);
  }

  @Patch('/change-role')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  changeRole(@Body() changeRoleDto: ChangeRoleDto) {
    return this.usersService.changeRole(changeRoleDto);
  }

  @Patch('/change-status-user/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return this.usersService.changeStatus(id, changeStatusDto);
  }
}

@ApiTags('Admin / Users ')
@Controller('admin/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AdminUserController {
  constructor(private readonly usersService: UsersService) {}

  @Put('reset-password')
  @Permission({
    action: EPermissionActionKey.RESET_PASSWORD,
    description: EPermissionDescription.RESET_PASSWORD,
    moduleName: EModulePermissionName.ROLE,
  })
  adminResetPassword(@Body() payload: AdminResetPassDto) {
    return this.usersService.adminResetPassword(payload);
  }
}
