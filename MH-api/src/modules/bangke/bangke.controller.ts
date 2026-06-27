import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { GetUser } from "src/common/decorators/user.decorator";
import { ActiveLinkService } from "src/common/services/active-link.service";
import { BangKeService } from "./bangke.service";
import { UserEntity } from "../users/user.entity";

@Controller("api/bangke")
@UseGuards(JwtAuthGuard)
export class BangKeController {
  constructor(
    private bangKeService: BangKeService,
    private readonly activeLinkService: ActiveLinkService,
  ) {}

  @Get()
  async getBangKeList(
    @GetUser() user: UserEntity,
    @Headers("x-active-supplier-id") activeSupplierId: string,
    @Headers("x-active-customer-id") activeCustomerId: string,
    @Query() query: any,
  ) {
    const identity = await this.activeLinkService.resolveActiveIdentity(
      user,
      activeSupplierId,
      activeCustomerId,
    );
    return this.bangKeService.getBangKe(identity, query);
  }

  @Get(":id")
  async getBangKeById(
    @GetUser() user: UserEntity,
    @Headers("x-active-supplier-id") activeSupplierId: string,
    @Headers("x-active-customer-id") activeCustomerId: string,
    @Param("id") id: string,
  ) {
    const identity = await this.activeLinkService.resolveActiveIdentity(
      user,
      activeSupplierId,
      activeCustomerId,
    );
    if (!id) {
      throw new BadRequestException("Bangke ID is required");
    }
    return this.bangKeService.getBangKeById(identity, id);
  }
}
