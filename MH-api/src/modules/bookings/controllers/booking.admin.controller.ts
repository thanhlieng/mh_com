import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileToBodyInterceptor } from "src/common/decorators/api-file.decorator";
import { GetHistory } from "src/common/decorators/history-info.decorator";
import { Permission } from "src/common/decorators/permission.decorator";
import { GetUser } from "src/common/decorators/user.decorator";
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from "src/common/guards/permission";
import { RolesGuard } from "src/common/guards/roles.guard";
import IJwtPayload, {
  IHistoryInfo,
} from "src/modules/auth/payloads/jwt-payload";
import { AssigneeBookingForPickupDto } from "../dto/assignee-booking-for-pickup.dto";
import { CancelBookingDto } from "../dto/cancel-booking.dto";
import { ConfirmReceiptGoodsDto } from "../dto/confirm-receipt-goods.dto";
import { CreateBillDto } from "../dto/create-bill.dto";
import { GenerateExcelFileDto } from "../dto/generate-excel-file.dto";
import { GetAssigneeBookingPickUpDto } from "../dto/get-assignee-booking-pickup.dto";
import { GetBookingDeliveryDto } from "../dto/get-booking-delivery.dto";
import { GetBookingPickupDto } from "../dto/get-booking-pickup.dto";
import { GetBookingDto } from "../dto/get-booking.dto";
import { ImportBookingDto } from "../dto/import-booking.dto";
import { GetManifestDto } from "../dto/manifest.dto";
import { MyAssigneeBookingDto } from "../dto/my-assignee-booking.dto";
import { ResponseBookingDto } from "../dto/response-bookings.dto";
import { SearchBookingDto } from "../dto/search-booking.dto";
import { UpdateAllManifestYamatoDto } from "../dto/update-all-manifest-yamato.dto";
import { UpdateBookingInvoiceDto } from "../dto/update-bookings.dto";
import { UpdateManifestYamatoDto } from "../dto/update-manifest-yamato.dto";
import { UpdatePartnerBillCodeDto } from "../dto/update-partner-bill-code.dto";
import { BookingService } from "../services/bookings.service";
import { ManageManifestService } from "../services/manage-manifest.service";

@ApiTags("API Booking for Admin")
@Controller("booking/admin")
export class BookingAdminController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly manageManifestService: ManageManifestService
  ) {}

  @Post("import-booking")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.IMPORT_BOOKING,
    description: EPermissionDescription.IMPORT_BOOKING,
    moduleName: EModulePermissionName.BOOKING,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"), FileToBodyInterceptor)
  importBooking(@Body() importBookingDto: ImportBookingDto) {
    return this.bookingService.importBookingByExcelFile(importBookingDto);
  }

  @Post("assignee-booking-for-pickup")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.ASSIGNEE_BOOKING,
    description: EPermissionDescription.ASSIGNEE_BOOKING,
    moduleName: EModulePermissionName.BOOKING,
  })
  assigneeBookingForPickup(
    @Body() assigneeBookingForPickupDto: AssigneeBookingForPickupDto
  ) {
    return this.bookingService.assigneeBookingForPickup(
      assigneeBookingForPickupDto
    );
  }

  @Post("confirm-receipt-of-goods")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.GET_LIST_MY_ASSIGNEE_BOOKING,
    description: EPermissionDescription.GET_LIST_MY_ASSIGNEE_BOOKING,
    moduleName: EModulePermissionName.BOOKING,
  })
  confirmReceiptOfGoods(
    @Body() confirmReceiptGoodsDto: ConfirmReceiptGoodsDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.bookingService.pickupConfirmListBookingReceipt(
      confirmReceiptGoodsDto,
      payload
    );
  }

  @Post("upload-manifest-yamato")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      description:
        EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"), FileToBodyInterceptor)
  uploadManifestYamato(
    @Body() dto: ImportBookingDto,
    @GetHistory() info: IHistoryInfo
  ) {
    return this.manageManifestService.uploadManifestYamatoFile(dto, info);
  }

  @Post("upload-partner-invoice/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      description:
        EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"), FileToBodyInterceptor)
  uploadPartnerInvoice(
    @Body() dto: ImportBookingDto,
    @Param("id") id: string,
    @GetHistory() info: IHistoryInfo
  ) {
    return this.manageManifestService.uploadPartnerInvoice(id, dto, info);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_LIST_BOOKING,
      description: EPermissionDescription.GET_LIST_BOOKING,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action:
        EPermissionActionKey.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      description:
        EPermissionDescription.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      moduleName: EModulePermissionName.BOOKING,
    }
  )
  @ApiOkResponse({ type: [ResponseBookingDto] })
  findAll(
    @Query() getBookingDto: GetBookingDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.bookingService.findAll(getBookingDto, payload);
  }

  @Get("export-manifest")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      description:
        EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  exportManifest(
    @Query() getManifestDto: GetManifestDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.manageManifestService.exportManifest(getManifestDto, payload);
  }

  @Get("manifest-partner-services")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  getPartnerServices(@GetUser() payload: IJwtPayload) {
    return this.manageManifestService.getPartnerServiceViaPayload(payload);
  }

  @Get("manifest")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      description:
        EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  getManifest(
    @Query() getManifestDto: GetManifestDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.manageManifestService.getBookingsManifest(
      getManifestDto,
      payload
    );
  }

  @Get("generate-invoice-manifest-yamato")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      description:
        EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  generateAllInvoiceManifestYamato(
    @Query() getManifestDto: GetManifestDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.manageManifestService.generateAllInvoiceManifestYamato(
      getManifestDto,
      payload
    );
  }

  @Get("generate-booking-manifest-yamato")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      description:
        EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  generateAllBookingManifestYamato(
    @Query() getManifestDto: GetManifestDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.manageManifestService.generateAllBookingManifestYamato(
      getManifestDto,
      payload
    );
  }

  @Get("assignee-booking-pickup")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_LIST_BOOKING,
      description: EPermissionDescription.GET_LIST_BOOKING,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action:
        EPermissionActionKey.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      description:
        EPermissionDescription.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      moduleName: EModulePermissionName.BOOKING,
    }
  )
  assigneeBookingPickup(
    @Query() getAssigneeBookingPickUpDto: GetAssigneeBookingPickUpDto
  ) {
    return this.bookingService.getBookingAssigneePickUp(
      getAssigneeBookingPickUpDto
    );
  }

  @Get("my-assignee-booking")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_LIST_MY_ASSIGNEE_BOOKING,
      description: EPermissionDescription.GET_LIST_MY_ASSIGNEE_BOOKING,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action: EPermissionActionKey.GET_ALL_LIST_MY_ASSIGNEE_BOOKING,
      description: EPermissionDescription.GET_ALL_LIST_MY_ASSIGNEE_BOOKING,
      moduleName: EModulePermissionName.BOOKING,
    }
  )
  getMyAssigneeBooking(
    @Query() myAssigneeBookingDto: MyAssigneeBookingDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.bookingService.getMyAssigneeBooking(
      myAssigneeBookingDto,
      payload
    );
  }

  @Get("search-booking")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_LIST_BOOKING,
      description: EPermissionDescription.GET_LIST_BOOKING,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action:
        EPermissionActionKey.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      description:
        EPermissionDescription.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      moduleName: EModulePermissionName.BOOKING,
    }
  )
  searchBooking(@Query() searchBookingDto: SearchBookingDto) {
    return this.bookingService.getBookingByBookingCode(searchBookingDto);
  }

  @Get("check-bill-can-be-cancel/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Permission({
    action: EPermissionActionKey.GET_BOOKING_DETAIL,
    description: EPermissionDescription.GET_BOOKING_DETAIL,
    moduleName: EModulePermissionName.BOOKING,
  })
  checkBillCanBeCancel(@Param("id") id: string) {
    return this.bookingService.checkBookingCancel(id);
  }

  @Get("get-booking-delivery")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  getBookingDelivery(@Query() getBookingDeliveryDto: GetBookingDeliveryDto) {
    return this.bookingService.getBookingDelivery(getBookingDeliveryDto);
  }

  @Get("generate-excel-booking")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_LIST_BOOKING,
      description: EPermissionDescription.GET_LIST_BOOKING,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action:
        EPermissionActionKey.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      description:
        EPermissionDescription.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      moduleName: EModulePermissionName.BOOKING,
    }
  )
  generateExcelBooking(
    @Query() getBookingDto: GetBookingDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.bookingService.generateExcelBooking(getBookingDto, payload);
  }

  @Get("generate-small-bill")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @ApiBearerAuth()
  @Permission({
    action: EPermissionActionKey.GET_BOOKING_DETAIL,
    description: EPermissionDescription.GET_BOOKING_DETAIL,
    moduleName: EModulePermissionName.BOOKING,
  })
  generateSmallBill(@Query() createBillDto: CreateBillDto) {
    return this.bookingService.generateSmallBill(createBillDto);
  }

  @Get("generate-bill")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.GET_BOOKING_DETAIL,
    description: EPermissionDescription.GET_BOOKING_DETAIL,
    moduleName: EModulePermissionName.BOOKING,
  })
  generateBill(@Query() createBillDto: CreateBillDto) {
    return this.bookingService.generateBill(createBillDto);
  }

  @Get("generate-partner-bill")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_BOOKING_DETAIL,
      description: EPermissionDescription.GET_BOOKING_DETAIL,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      description:
        EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  generatePartnerBill(@Query() createBillDto: CreateBillDto) {
    return this.bookingService.generatePartnerBill(createBillDto, {});
  }

  @Get("generate-bill-invoice")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.GET_BOOKING_DETAIL,
    description: EPermissionDescription.GET_BOOKING_DETAIL,
    moduleName: EModulePermissionName.BOOKING,
  })
  generateBillInvoice(@Query() createBillDto: CreateBillDto) {
    return this.bookingService.generateBillInvoice(createBillDto);
  }

  @Get("generate-partner-bill-invoice")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_BOOKING_DETAIL,
      description: EPermissionDescription.GET_BOOKING_DETAIL,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      description:
        EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_K_CARGO_PARTNER,
      description: EPermissionDescription.MANAGE_MANIFEST_K_CARGO_PARTNER,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  generatePartnerBillInvoice(@Query() createBillDto: CreateBillDto) {
    return this.bookingService.generatePartnerBillInvoice(createBillDto, {
      isGenerateManifest: true,
    });
  }

  @Get("generate-split-booking-bill")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.GET_BOOKING_DETAIL,
    description: EPermissionDescription.GET_BOOKING_DETAIL,
    moduleName: EModulePermissionName.BOOKING,
  })
  generateSplitBill(@Query() createBillDto: CreateBillDto) {
    return this.bookingService.generateSplitBills(createBillDto);
  }

  @Get("get-booking-pickup")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.GET_LIST_BOOKING,
      description: EPermissionDescription.GET_LIST_BOOKING,
      moduleName: EModulePermissionName.BOOKING,
    },
    {
      action:
        EPermissionActionKey.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      description:
        EPermissionDescription.GET_LIST_BOOKING_FOR_CUSTOMER_MANAGEMENT_STAFF,
      moduleName: EModulePermissionName.BOOKING,
    }
  )
  getBookingPickup(@Query() getBookingPickupDto: GetBookingPickupDto) {
    return this.bookingService.getBookingPickUp(getBookingPickupDto);
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @ApiOkResponse({ type: ResponseBookingDto })
  @Permission({
    action: EPermissionActionKey.GET_BOOKING_DETAIL,
    description: EPermissionDescription.GET_BOOKING_DETAIL,
    moduleName: EModulePermissionName.BOOKING,
  })
  findOne(@Param("id") id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch("cancel-booking/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Permission({
    action: EPermissionActionKey.GET_BOOKING_DETAIL,
    description: EPermissionDescription.GET_BOOKING_DETAIL,
    moduleName: EModulePermissionName.BOOKING,
  })
  cancelBooking(
    @Param("id") id: string,
    @Body() cancelBookingDto: CancelBookingDto
  ) {
    return this.bookingService.cancelBooking(id, cancelBookingDto);
  }

  @Patch("is-handle-booking/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.CONFIRM_HANDLE_BOOKING,
    description: EPermissionDescription.CONFIRM_HANDLE_BOOKING,
    moduleName: EModulePermissionName.BOOKING,
  })
  isHandledBooking(@Param("id") id: string) {
    return this.bookingService.isHandledBooking(id);
  }

  @Patch("update-partner-bill-code/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.UPDATE_BOOKING,
    description: EPermissionDescription.UPDATE_BOOKING,
    moduleName: EModulePermissionName.BOOKING,
  })
  updatePartnerBillCode(
    @Param("id") id: string,
    @Body() updatePartnerBillCodeDto: UpdatePartnerBillCodeDto
  ) {
    return this.bookingService.updatePartnerBillCode(
      id,
      updatePartnerBillCodeDto
    );
  }

  @Patch("update-manifest-yamato/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  updateManifestYamato(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateManifestYamatoDto: UpdateManifestYamatoDto,
    @GetHistory() info: IHistoryInfo
  ) {
    return this.manageManifestService.updateManifestYamato(
      id,
      updateManifestYamatoDto,
      info
    );
  }

  @Patch("update-all-manifest-yamato")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  updateAllManifestYamato(
    @Body() updateDto: UpdateAllManifestYamatoDto,
    @GetHistory() info: IHistoryInfo,
    @GetUser() payload: IJwtPayload
  ) {
    return this.manageManifestService.updateAllManifestYamato(
      payload,
      updateDto,
      info
    );
  }

  @Put(":id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_SOUTHERN,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    },
    {
      action: EPermissionActionKey.MANAGE_MANIFEST_YAMATO_NORTH,
      description: EPermissionDescription.MANAGE_MANIFEST_YAMATO_NORTH,
      moduleName: EModulePermissionName.MANAGE_MANIFEST,
    }
  )
  @ApiOkResponse({ type: ResponseBookingDto })
  update(
    @Param("id") id: string,
    @Body() updateBookingInvoiceDto: UpdateBookingInvoiceDto,
    @GetHistory() info: IHistoryInfo
  ) {
    return this.bookingService.update(id, updateBookingInvoiceDto, info);
  }
}
