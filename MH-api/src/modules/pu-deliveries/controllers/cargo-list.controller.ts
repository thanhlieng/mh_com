import { Controller, Get, Post, Body, UseGuards, UseInterceptors, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permission.decorator';
import { EModulePermissionName, EPermissionActionKey, EPermissionDescription } from 'src/common/guards/permission';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CargoListService } from '../services/cargo-list.service';
import { GetBookingPaidDto, GetCargoListDto } from '../dto/get-cargo-list.dto';
import { SendCargoListViaEmailDto } from '../dto/send-cargo-list-via-email.dto';
import { GetUser } from 'src/common/decorators/user.decorator';
import IJwtPayload from 'src/modules/auth/payloads/jwt-payload';

@ApiTags('Cargo list')
@ApiBearerAuth()
@Controller('cargo-list')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CargoListController {
  constructor(private readonly cargoListService: CargoListService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permission({
    action: EPermissionActionKey.GET_CARGO_LIST,
    description: EPermissionDescription.GET_CARGO_LIST,
    moduleName: EModulePermissionName.CARGO_LIST,
  })
  getCargoList(@Query() getCargoListDto: GetCargoListDto) {
    return this.cargoListService.getCargoList(getCargoListDto);
  }

  @Get('/booking-paid')
  getListBookingPaid(@Query() getBookingPaidDto: GetBookingPaidDto) {
    return this.cargoListService.getListBookingPaid(getBookingPaidDto);
  }

  @Post('send-cargo-list-via-email')
  sendCargoListViaEmail(@Body() sendCargoListViaEmailDto: SendCargoListViaEmailDto, @GetUser() payload: IJwtPayload) {
    return this.cargoListService.sendCargoListViaEmail(sendCargoListViaEmailDto, payload);
  }
}
