import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { GetUser } from "src/common/decorators/user.decorator";
import { BangKeService } from "./bangke.service";
import { UserEntity } from "../users/user.entity";

@Controller("api/bangke")
@UseGuards(JwtAuthGuard)
export class BangKeController {
  constructor(private bangKeService: BangKeService) {}

  @Get()
  async getBangKeList(@GetUser() user: UserEntity, @Query() query: any) {
    const { a_supplier_id, a_customer_id } = user;
    if (!a_supplier_id && !a_customer_id) {
      throw new ConflictException(
        "Tài khoản chưa được liên kết với nhà cung cấp hoặc khách hàng. Vui lòng liên hệ quản trị viên.",
      );
    }
    return this.bangKeService.getBangKe({ a_supplier_id, a_customer_id }, query);
  }

  @Get(":id")
  async getBangKeById(@GetUser() user: UserEntity, @Param("id") id: string) {
    const { a_supplier_id, a_customer_id } = user;
    if (!a_supplier_id && !a_customer_id) {
      throw new ConflictException(
        "Tài khoản chưa được liên kết với nhà cung cấp hoặc khách hàng. Vui lòng liên hệ quản trị viên.",
      );
    }
    if (!id) {
      throw new BadRequestException("Bangke ID is required");
    }
    return this.bangKeService.getBangKeById({ a_supplier_id, a_customer_id }, id);
  }
}
