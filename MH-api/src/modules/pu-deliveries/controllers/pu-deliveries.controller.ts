import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from "@nestjs/common";
import { PuDeliveriesService } from "../services/pu-deliveries.service";
import { CreatePuDeliveriesDto } from "../dto/create-pu-deliveries.dto";
import { GetUser } from "src/common/decorators/user.decorator";
import IJwtPayload, { IHistoryInfo } from "../../auth/payloads/jwt-payload";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/common/guards/roles.guard";
import { PUDeliveryDto } from "../dto/find-all.dto";
import { UpdatePuDeliveriesDto } from "../dto/update-pu-deliveries.dto";
import { GetBookingOpDto } from "../dto/get-booking-op.dto";
import { UpdateDeliveryOPDto } from "../dto/update-delivery-op.dto";
import { Permission } from "src/common/decorators/permission.decorator";
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from "src/common/guards/permission";
import { SplitBookingDto } from "../dto/split-booking.dto";
import { GetHistory } from "src/common/decorators/history-info.decorator";

const moduleName = EModulePermissionName.OPERATE;

@ApiTags("PuDeliveries")
@ApiBearerAuth()
@Controller("pu-deliveries")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class PuDeliveriesController {
  constructor(private readonly puDeliveriesService: PuDeliveriesService) {}

  @Get("booking-connect-partner/:id")
  getBookingConnectPartner(@Param("id") id: string) {
    return this.puDeliveriesService.getBookingConnectPartner(id);
  }

  @Get("booking-pickup")
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_PICK_UP,
      description: EPermissionDescription.MANAGE_PICK_UP,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_MY_ASSIGNEE_BOOKING,
      description: EPermissionDescription.GET_ALL_LIST_MY_ASSIGNEE_BOOKING,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action: EPermissionActionKey.MANAGE_PICK_UP_ALL,
      description: EPermissionDescription.MANAGE_PICK_UP_ALL,
      moduleName: moduleName,
    }
  )
  findAll(
    @Query() puDeliveryDto: PUDeliveryDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.puDeliveriesService.findAllPickUp(puDeliveryDto, payload);
  }

  @Get("statistical-delivery")
  statisticalDeliveryPartnerService() {
    return this.puDeliveriesService.statisticalDeliveryPartnerService();
  }

  @Get("delivery")
  @Permission({
    action: EPermissionActionKey.MANAGE_OPERATE,
    description: EPermissionDescription.MANAGE_OPERATE,
    moduleName: moduleName,
  })
  findBillDelivery(@Query() puDeliveryDto: PUDeliveryDto) {
    return this.puDeliveriesService.findAllDelivery(puDeliveryDto);
  }

  @Get("delivery-op")
  findBookingOP(@Query() getBookingOpDto: GetBookingOpDto) {
    return this.puDeliveriesService.findBookingOP(getBookingOpDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.puDeliveriesService.findOne(id);
  }

  @Post()
  @Permission({
    action: EPermissionActionKey.MANAGE_PICK_UP,
    description: EPermissionDescription.MANAGE_PICK_UP,
    moduleName: moduleName,
  })
  create(
    @Body() createPuDeliveriesDto: CreatePuDeliveriesDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.puDeliveriesService.pickUpParcel(
      createPuDeliveriesDto,
      payload
    );
  }

  @Post("split-booking/:id")
  @Permission({
    action: EPermissionActionKey.MANAGE_OPERATE,
    description: EPermissionDescription.MANAGE_OPERATE,
    moduleName: moduleName,
  })
  splitBooking(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() splitBookingsDto: SplitBookingDto
  ) {
    return this.puDeliveriesService.splitBookingManifest(id, splitBookingsDto);
  }

  @Patch("pickup-confirm-booking/:id")
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_PICK_UP,
      description: EPermissionDescription.MANAGE_PICK_UP,
      moduleName: moduleName,
    },
    {
      action: EPermissionActionKey.MANAGE_PICK_UP_ALL,
      description: EPermissionDescription.MANAGE_PICK_UP_ALL,
      moduleName: moduleName,
    }
  )
  pickUpConfirmBooking(
    @Param("id") id: string,
    @GetUser() payload: IJwtPayload,
    @Body() updatePuDeliveriesDto: UpdatePuDeliveriesDto,
    @GetHistory() info: IHistoryInfo
  ) {
    return this.puDeliveriesService.pickupConfirmBooking(
      id,
      payload,
      updatePuDeliveriesDto,
      info
    );
  }

  @Patch("op-confirm-booking/:id")
  @Permission({
    action: EPermissionActionKey.MANAGE_OPERATE,
    description: EPermissionDescription.MANAGE_OPERATE,
    moduleName: moduleName,
  })
  opConfirmBooking(
    @Param("id") id: string,
    @Body() updateDeliveryOPDto: UpdateDeliveryOPDto,
    @GetHistory() info: IHistoryInfo,
    @GetUser() payload: IJwtPayload
  ) {
    return this.puDeliveriesService.opConfirmBooking(
      id,
      updateDeliveryOPDto,
      info,
      payload
    );
  }

  @Patch("forward-op")
  @Permission({
    action: EPermissionActionKey.MANAGE_PICK_UP,
    description: EPermissionDescription.MANAGE_PICK_UP,
    moduleName: moduleName,
  })
  forwardOP(@GetUser() payload: IJwtPayload) {
    return this.puDeliveriesService.forwardOP(payload);
  }

  @Patch("forward-op/:id")
  @Permission({
    action: EPermissionActionKey.MANAGE_PICK_UP,
    description: EPermissionDescription.MANAGE_PICK_UP,
    moduleName: moduleName,
  })
  forwardOPById(@Param("id") id: string, @GetUser() payload: IJwtPayload) {
    return this.puDeliveriesService.forwardOPById(id, payload);
  }
}
