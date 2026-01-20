import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { FileToBodyInterceptor } from "src/common/decorators/api-file.decorator";
import { Permission } from "src/common/decorators/permission.decorator";
import { GetUser } from "src/common/decorators/user.decorator";
import {
  EModulePermissionName,
  EPermissionActionKey,
  EPermissionDescription,
} from "src/common/guards/permission";
import { RolesGuard } from "src/common/guards/roles.guard";
import IJwtPayload from "../auth/payloads/jwt-payload";
import { ImportStatisticalFileDto } from "./dto/import-statistical-file.dto";
import {
  StatisticalByCustomerDto,
  StatisticalByServiceDto,
  StatisticalByStaffDto,
  StatisticalRevenueByCustomerDto,
} from "./dto/statistical.dto";
import { FinanceAndStatisticalService } from "./finance-statistical.service";

@Controller("finance-statistical")
@ApiTags("Finance And Statistical")
export class FinanceAndStatisticalController {
  constructor(
    private readonly financeAndStatisticalService: FinanceAndStatisticalService
  ) {}

  @Post("cpn")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.IMPORT_STATISTICAL_FILE,
    description: EPermissionDescription.IMPORT_STATISTICAL_FILE,
    moduleName: EModulePermissionName.FINANCE_STATISTICAL,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"), FileToBodyInterceptor)
  importStatisticalCPNFile(
    @Body() importStatisticalFileDto: ImportStatisticalFileDto
  ) {
    return this.financeAndStatisticalService.importStatisticalCPNFile(
      importStatisticalFileDto
    );
  }

  @Post("fwd")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.IMPORT_STATISTICAL_FILE,
    description: EPermissionDescription.IMPORT_STATISTICAL_FILE,
    moduleName: EModulePermissionName.FINANCE_STATISTICAL,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"), FileToBodyInterceptor)
  importStatisticalFWDFile(
    @Body() importStatisticalFileDto: ImportStatisticalFileDto
  ) {
    return this.financeAndStatisticalService.importStatisticalFWDFile(
      importStatisticalFileDto
    );
  }

  @Get("export-statistical-staff-file")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.STATISTICAL_BY_STAFF,
      description: EPermissionDescription.STATISTICAL_BY_STAFF,
      moduleName: EModulePermissionName.FINANCE_STATISTICAL,
    },
    {
      action: EPermissionActionKey.REPORT_FOR_ACCOUNTING,
      description: EPermissionDescription.REPORT_FOR_ACCOUNTING,
      moduleName: EModulePermissionName.FINANCE_STATISTICAL,
    }
  )
  exportStatisticalStaffFile(
    @Query() statisticalByStaffDto: StatisticalByStaffDto,
    @GetUser() userInfo: IJwtPayload
  ) {
    return this.financeAndStatisticalService.exportStatisticalByStaffFile(
      statisticalByStaffDto,
      userInfo
    );
  }

  @Get("statistical-staff")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission(
    {
      action: EPermissionActionKey.STATISTICAL_BY_STAFF,
      description: EPermissionDescription.STATISTICAL_BY_STAFF,
      moduleName: EModulePermissionName.FINANCE_STATISTICAL,
    },
    {
      action: EPermissionActionKey.REPORT_FOR_ACCOUNTING,
      description: EPermissionDescription.REPORT_FOR_ACCOUNTING,
      moduleName: EModulePermissionName.FINANCE_STATISTICAL,
    }
  )
  statisticalStaff(
    @Query() statisticalByStaffDto: StatisticalByStaffDto,
    @GetUser() userInfo: IJwtPayload
  ) {
    return this.financeAndStatisticalService.statisticalByStaff(
      statisticalByStaffDto,
      userInfo
    );
  }

  @Get("statistical-customer")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.STATISTICAL_BY_CUSTOMER,
    description: EPermissionDescription.STATISTICAL_BY_CUSTOMER,
    moduleName: EModulePermissionName.FINANCE_STATISTICAL,
  })
  statisticalCustomer(
    @Query() inputDto: StatisticalByCustomerDto,
    @GetUser() userInfo: IJwtPayload
  ) {
    return this.financeAndStatisticalService.statisticalByCustomer(
      inputDto,
      userInfo
    );
  }

  @Get("export-statistical-customer")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.STATISTICAL_BY_CUSTOMER,
    description: EPermissionDescription.STATISTICAL_BY_CUSTOMER,
    moduleName: EModulePermissionName.FINANCE_STATISTICAL,
  })
  exportStatisticalCustomer(
    @Query() inputDto: StatisticalByCustomerDto,
    @GetUser() userInfo: IJwtPayload
  ) {
    return this.financeAndStatisticalService.exportStatisticalByCustomer(
      inputDto,
      userInfo
    );
  }

  @Get("statistical-service")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.STATISTICAL_BY_SERVICE,
    description: EPermissionDescription.STATISTICAL_BY_SERVICE,
    moduleName: EModulePermissionName.FINANCE_STATISTICAL,
  })
  statisticalService(@Query() inputDto: StatisticalByServiceDto, @GetUser() payload: IJwtPayload) {
    return this.financeAndStatisticalService.statisticalByService(inputDto, payload);
  }

  @Get("export-statistical-service")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.STATISTICAL_BY_SERVICE,
    description: EPermissionDescription.STATISTICAL_BY_SERVICE,
    moduleName: EModulePermissionName.FINANCE_STATISTICAL,
  })
  exportStatisticalService(@Query() inputDto: StatisticalByServiceDto, @GetUser() payload: IJwtPayload) {
    return this.financeAndStatisticalService.exportStatisticalByService(
      inputDto,
      payload
    );
  }

  @Get("statistical-revenue-customer")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.STATISTICAL_REVENUE_BY_CUSTOMER,
    description: EPermissionDescription.STATISTICAL_REVENUE_BY_CUSTOMER,
    moduleName: EModulePermissionName.FINANCE_STATISTICAL,
  })
  statisticalRevenueCustomer(
    @Query() inputDto: StatisticalRevenueByCustomerDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.financeAndStatisticalService.statisticalRevenueByCustomer(
      inputDto,
      payload
    );
  }

  @Get("export-statistical-revenue-customer")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Permission({
    action: EPermissionActionKey.STATISTICAL_REVENUE_BY_CUSTOMER,
    description: EPermissionDescription.STATISTICAL_REVENUE_BY_CUSTOMER,
    moduleName: EModulePermissionName.FINANCE_STATISTICAL,
  })
  exportStatisticalRevenueCustomer(
    @Query() inputDto: StatisticalRevenueByCustomerDto,
    @GetUser() payload: IJwtPayload
  ) {
    return this.financeAndStatisticalService.exportStatisticalRevenueByCustomer(
      inputDto,
      payload
    );
  }
}
