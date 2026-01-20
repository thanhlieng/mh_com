import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import IJwtPayload from '../../auth/payloads/jwt-payload';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { CreateBillDto } from '../dto/create-bill.dto';
import { CreateBookingDetailDto } from '../dto/create-booking-detail.dto';
import { CreateBookingInvoiceDto } from '../dto/create-bookings.dto';
import { GetBookingDto } from '../dto/get-booking.dto';
import { ResponseBookingDto } from '../dto/response-bookings.dto';
import { UpdateBookingInvoiceDto } from '../dto/update-bookings.dto';
import { BookingService } from '../services/bookings.service';

const moduleName = 'booking';
@ApiTags('API Booking for user')
@Controller(moduleName)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseBookingDto })
  create(@Body() createBookingInvoiceDto: CreateBookingInvoiceDto, @GetUser() payload: IJwtPayload) {
    return this.bookingService.create(createBookingInvoiceDto, payload);
  }

  @Patch('confirm-booking/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  confirmBooking(@GetUser() payload: IJwtPayload, @Param('id') id: string) {
    return this.bookingService.confirmBooking(payload, id);
  }

  @Patch('confirm-booking-v2/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  confirmBookingV2(@GetUser() payload: IJwtPayload, @Param('id') id: string) {
    return this.bookingService.confirmBookingV2(payload, id);
  }

  @Get('check-bill-can-be-cancel/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  checkBillCanBeCancel(@GetUser() payload: IJwtPayload, @Param('id') id: string) {
    return this.bookingService.checkBookingCancel(id, payload);
  }

  @Patch('cancel-booking/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  cancelBooking(@GetUser() payload: IJwtPayload, @Param('id') id: string, @Body() cancelBookingDto: CancelBookingDto) {
    return this.bookingService.cancelBooking(id, cancelBookingDto, payload);
  }

  @Get('generate-excel-my-booking')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  generateExcelMyBooking(@Query() getBookingDto: GetBookingDto, @GetUser() payload: IJwtPayload) {
    return this.bookingService.generateExcelMyBooking(getBookingDto, payload);
  }

  @Get('generate-small-bill')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  generateSmallBill(@Query() createBillDto: CreateBillDto, @GetUser() payload: IJwtPayload) {
    return this.bookingService.generateSmallBill(createBillDto, payload);
  }

  @Get('generate-bill')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  generateBill(@Query() createBillDto: CreateBillDto, @GetUser() payload: IJwtPayload) {
    return this.bookingService.generateBill(createBillDto, payload);
  }

  @Get('generate-partner-bill')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  generatePartnerBill(@Query() createBillDto: CreateBillDto, @GetUser() payload: IJwtPayload) {
    return this.bookingService.generatePartnerBill(createBillDto, {}, payload);
  }

  @Get('generate-reference-bill')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  generateReferenceBill(@Query() createBillDto: CreateBillDto, @GetUser() payload: IJwtPayload) {
    return this.bookingService.generateReferenceBill(createBillDto, payload);
  }

  @Get('generate-bill-invoice')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  generateBillInvoice(@Query() createBillDto: CreateBillDto, @GetUser() payload: IJwtPayload) {
    return this.bookingService.generateBillInvoice(createBillDto, payload);
  }

  @Get('generate-partner-bill-invoice')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  generatePartnerBillInvoice(@Query() createBillDto: CreateBillDto, @GetUser() payload: IJwtPayload) {
    return this.bookingService.generatePartnerBillInvoice(createBillDto, {}, payload);
  }

  @Get('my-booking-home')
  @ApiOkResponse({ type: [ResponseBookingDto] })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  myBookingHome(@GetUser() payload: IJwtPayload) {
    return this.bookingService.myBookingHome(payload);
  }

  @Get('my-booking')
  @ApiOkResponse({ type: [ResponseBookingDto] })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  myBooking(@GetUser() payload: IJwtPayload, @Query() getBookingDto: GetBookingDto) {
    return this.bookingService.myBooking(payload, getBookingDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseBookingDto })
  findOne(@Param('id') id: string, @GetUser() payload: IJwtPayload) {
    return this.bookingService.findOne(id, payload);
  }

  @Post('add-booking-detail/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  addBookingDetail(
    @Param('id') id: string,
    @Body() createBookingDetailDto: CreateBookingDetailDto,
    @GetUser() payload: IJwtPayload,
  ) {
    return this.bookingService.addBookingDetail(id, createBookingDetailDto, payload);
  }

  @Put('update-booking/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: ResponseBookingDto })
  updateBooking(
    @Param('id') id: string,
    @Body() updateBookingInvoiceDto: UpdateBookingInvoiceDto,
    @GetUser() payload: IJwtPayload,
  ) {
    return this.bookingService.updateMyBooking(id, updateBookingInvoiceDto, payload);
  }
}
