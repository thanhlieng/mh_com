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
import { AddressBookService } from './address-books.service';
import { ResponseAddressBookDto } from './dto/response-address-books.dto';
import { GetUser } from 'src/common/decorators/user.decorator';
import IJwtPayload from '../auth/payloads/jwt-payload';
import { AuthGuard } from '@nestjs/passport';
import { GetAddressBookDto } from './dto/get-address-books.dto';
import { CreateSenderAddressDto } from './dto/create-sender-address.dto';
import { CreateReceiverAddressDto } from './dto/create-receiver-address.dto';
import { UpdateSenderAddressDto } from './dto/update-sender-address.dto';
import { UpdateReceiverAddressDto } from './dto/update-receiver-address.dto';

@ApiTags('AddressBook')
@Controller('address-book')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class AddressBookController {
  constructor(private readonly addressBookService: AddressBookService) {}

  @Get()
  @ApiOkResponse({ type: [ResponseAddressBookDto] })
  getAllAddress(
    @GetUser() payload: IJwtPayload,
    @Query() getAddressBookDto: GetAddressBookDto,
  ) {
    return this.addressBookService.getAllAddress(payload, getAddressBookDto);
  }

  @Post('create-sender-address')
  @ApiOkResponse({ type: ResponseAddressBookDto })
  createSenderAddress(
    @Body() createSenderAddressDto: CreateSenderAddressDto,
    @GetUser() payload: IJwtPayload,
  ) {
    return this.addressBookService.createSenderAddress(
      createSenderAddressDto,
      payload,
    );
  }

  @Post('create-receiver-address')
  @ApiOkResponse({ type: ResponseAddressBookDto })
  createReceiverAddress(
    @Body() createReceiverAddressDto: CreateReceiverAddressDto,
    @GetUser() payload: IJwtPayload,
  ) {
    return this.addressBookService.createReceiverAddress(
      createReceiverAddressDto,
      payload,
    );
  }

  @Patch('set-default-address/:id')
  setDefaultAddress(@GetUser() payload: IJwtPayload, @Param('id') id: string) {
    return this.addressBookService.setAddressIsDefault(id, payload);
  }

  @Patch('update-sender-address/:id')
  updateSenderAddress(
    @GetUser() payload: IJwtPayload,
    @Param('id') id: string,
    @Body() updateSenderAddressDto: UpdateSenderAddressDto,
  ) {
    return this.addressBookService.updateSenderAddress(
      id,
      payload,
      updateSenderAddressDto,
    );
  }

  @Patch('update-receiver-address/:id')
  updateReceiverAddress(
    @GetUser() payload: IJwtPayload,
    @Param('id') id: string,
    @Body() updateReceiverAddressDto: UpdateReceiverAddressDto,
  ) {
    return this.addressBookService.updateReceiverAddress(
      id,
      payload,
      updateReceiverAddressDto,
    );
  }

  @Delete(':id')
  @ApiOkResponse()
  remove(@Param('id') id: string, @GetUser() payload: IJwtPayload) {
    return this.addressBookService.remove(id, payload);
  }
}
