import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  EALinkType,
  UserALinkEntity,
} from 'src/modules/users/entities/user-a-link.entity';

/**
 * Thông tin user tối thiểu lấy từ JWT payload (req.user).
 * Liên kết được lưu hoàn toàn ở bảng `user_a_links` (cột scalar
 * a_supplier_id / a_customer_id ở bảng users đã bị xoá).
 */
interface LinkUserContext {
  id: string;
}

/**
 * Resolver xác định "thực thể A đang active" cho mỗi request proxy.
 *
 * Một account B có thể liên kết với NHIỀU supplier (hoặc NHIỀU customer).
 * Vì token gửi sang A chỉ mang đúng MỘT `sub`, mỗi request phải chỉ rõ
 * đang thao tác trên thực thể nào — qua header:
 *   - `X-Active-Supplier-Id` cho route supplier
 *   - `X-Active-Customer-Id` cho route customer
 *
 * Resolver luôn kiểm tra DB (tươi mới) để chống leo thang quyền:
 * id được yêu cầu BẮT BUỘC nằm trong tập liên kết của account.
 */
@Injectable()
export class ActiveLinkService {
  constructor(private readonly dataSource: DataSource) {}

  /** Lấy tập id thực thể A mà account được phép dùng theo loại. */
  private async getLinkedIds(
    userId: string,
    linkType: EALinkType,
  ): Promise<string[]> {
    const rows = await this.dataSource
      .getRepository(UserALinkEntity)
      .find({ where: { userId, linkType }, select: ['aEntityId'] });

    return rows.map((r) => r.aEntityId);
  }

  /**
   * Trả về id thực thể A đã được xác thực để mint token gửi sang A.
   * @throws ConflictException khi account chưa liên kết với thực thể nào.
   * @throws ForbiddenException khi requestedId không thuộc account.
   * @throws BadRequestException khi account có nhiều liên kết mà không chỉ rõ id.
   */
  private async resolve(
    linkType: EALinkType,
    userId: string,
    requestedId: string | undefined,
    label: string,
  ): Promise<string> {
    const ids = await this.getLinkedIds(userId, linkType);

    if (ids.length === 0) {
      throw new ConflictException(
        `Tài khoản chưa được liên kết với ${label}. Vui lòng liên hệ quản trị viên.`,
      );
    }

    const requested = requestedId?.trim();
    if (requested) {
      if (!ids.includes(requested)) {
        throw new ForbiddenException(
          `Tài khoản không có quyền truy cập ${label} đã chọn.`,
        );
      }
      return requested;
    }

    // Không chỉ rõ: chỉ chấp nhận khi đúng 1 liên kết (giữ tương thích UI cũ).
    if (ids.length === 1) {
      return ids[0];
    }

    throw new BadRequestException(
      `Tài khoản liên kết với nhiều ${label}. Vui lòng chọn ${label} ở header.`,
    );
  }

  /** Resolver cho route supplier — đọc header X-Active-Supplier-Id. */
  resolveSupplier(
    user: LinkUserContext,
    requestedSupplierId?: string,
  ): Promise<string> {
    return this.resolve(
      EALinkType.SUPPLIER,
      user.id,
      requestedSupplierId,
      'nhà cung cấp',
    );
  }

  /** Resolver cho route customer — đọc header X-Active-Customer-Id. */
  resolveCustomer(
    user: LinkUserContext,
    requestedCustomerId?: string,
  ): Promise<string> {
    return this.resolve(
      EALinkType.CUSTOMER,
      user.id,
      requestedCustomerId,
      'khách hàng',
    );
  }

  /**
   * Resolver dùng cho route chấp nhận CẢ supplier lẫn customer (vd Bảng kê).
   * Tự xác định loại liên kết của account rồi xác thực id active tương ứng.
   * Trả về đúng một trong hai field để truyền vào proxy gọi A.
   */
  async resolveActiveIdentity(
    user: LinkUserContext,
    requestedSupplierId?: string,
    requestedCustomerId?: string,
  ): Promise<{ a_supplier_id?: string; a_customer_id?: string }> {
    const { linkType } = await this.listLinks(user);
    if (linkType === EALinkType.SUPPLIER) {
      return { a_supplier_id: await this.resolveSupplier(user, requestedSupplierId) };
    }
    if (linkType === EALinkType.CUSTOMER) {
      return { a_customer_id: await this.resolveCustomer(user, requestedCustomerId) };
    }
    throw new ConflictException(
      'Tài khoản chưa được liên kết với nhà cung cấp hoặc khách hàng. Vui lòng liên hệ quản trị viên.',
    );
  }

  /** Danh sách liên kết để FE render bộ chọn (switcher). */
  async listLinks(
    user: LinkUserContext,
  ): Promise<{ linkType: EALinkType | null; ids: string[] }> {
    const supplierIds = await this.getLinkedIds(user.id, EALinkType.SUPPLIER);
    if (supplierIds.length > 0) {
      return { linkType: EALinkType.SUPPLIER, ids: supplierIds };
    }
    const customerIds = await this.getLinkedIds(user.id, EALinkType.CUSTOMER);
    if (customerIds.length > 0) {
      return { linkType: EALinkType.CUSTOMER, ids: customerIds };
    }
    return { linkType: null, ids: [] };
  }

  /**
   * (Admin) Lấy liên kết hiện tại của một account bất kỳ theo userId.
   * Dùng cho màn admin chỉnh liên kết tài khoản ↔ mhvn.
   */
  getLinksForUser(
    userId: string,
  ): Promise<{ linkType: EALinkType | null; ids: string[] }> {
    return this.listLinks({ id: userId });
  }

  /**
   * (Admin) Thay thế TOÀN BỘ liên kết của một account.
   *
   * Một account chỉ thuộc đúng MỘT loại (supplier HOẶC customer). Hàm xoá
   * sạch liên kết cũ rồi ghi lại theo `linkType` mới → không thể tồn tại cả
   * hai loại cùng lúc. Truyền `linkType=null` hoặc `ids` rỗng để gỡ liên kết.
   */
  async setLinksForUser(
    userId: string,
    linkType: EALinkType | null,
    ids: string[],
  ): Promise<{ linkType: EALinkType | null; ids: string[] }> {
    if (linkType && !Object.values(EALinkType).includes(linkType)) {
      throw new BadRequestException('linkType không hợp lệ.');
    }

    // Chuẩn hoá: bỏ trùng, bỏ rỗng.
    const cleanIds = Array.from(
      new Set((ids || []).map((s) => String(s).trim()).filter(Boolean)),
    );

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(UserALinkEntity);
      await repo.delete({ userId });
      if (linkType && cleanIds.length > 0) {
        await repo.save(
          cleanIds.map((aEntityId) =>
            repo.create({ userId, linkType, aEntityId }),
          ),
        );
      }
    });

    return this.getLinksForUser(userId);
  }
}
