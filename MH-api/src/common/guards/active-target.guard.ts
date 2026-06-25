import {
  BadRequestException,
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  EALinkType,
  EATarget,
  UserALinkEntity,
} from 'src/modules/users/entities/user-a-link.entity';
import { UserEntity } from 'src/modules/users/user.entity';

/**
 * Context A active của request: target + loại account + danh sách entity id
 * (supplier_ids hoặc customer_ids) account được phép thao tác trên target này.
 *
 * Backend đọc từ `request.activeContext` (do `ActiveTargetGuard` gắn vào)
 * thay cho header X-Active-Supplier-Id / X-Active-Customer-Id cũ.
 */
export interface ActiveAContext {
  target: EATarget;
  accountType: EALinkType;
  entityIds: string[];
}

/**
 * Guard runtime "chốt" hệ A cho request:
 *   - đọc header `X-A-Target` ('mhvn' | 'gp');
 *   - lấy danh sách entity (supplier_ids hoặc customer_ids) account đã liên kết
 *     với target đó từ bảng `user_a_links`;
 *   - kèm `accountType` từ `users.account_type` để controller / proxy biết
 *     mint supplier-token hay customer-token.
 *
 * Phải dùng SAU `JwtAuthGuard` (request.user đã có `id`).
 *
 * Token mhcom→A vẫn `aud='mhvn'` (A không phân biệt theo target),
 * nhưng `baseUrl` và (tuỳ chọn) private key được route theo `target`.
 */
@Injectable()
export class ActiveTargetGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id?: string } | undefined;

    if (!user?.id) {
      // JwtAuthGuard phải chạy trước. Không quẳng Unauthorized ở đây để
      // tránh che mất lỗi đúng của tầng auth.
      throw new BadRequestException(
        'Thiếu thông tin xác thực — ActiveTargetGuard phải đứng sau JwtAuthGuard.',
      );
    }

    const rawTarget = String(
      request.headers?.['x-a-target'] ?? '',
    ).toLowerCase();
    if (rawTarget !== EATarget.MHVN && rawTarget !== EATarget.GP) {
      throw new BadRequestException(
        "Header 'X-A-Target' bắt buộc và phải là 'mhvn' hoặc 'gp'.",
      );
    }
    const target = rawTarget as EATarget;

    // Lấy entity ids account được liên kết ở target này.
    const linkRows = await this.dataSource
      .getRepository(UserALinkEntity)
      .find({
        where: { userId: user.id, aTarget: target },
        select: ['aEntityId', 'linkType'],
      });

    if (linkRows.length === 0) {
      throw new ConflictException(
        `Tài khoản chưa liên kết với hệ ${target}. Vui lòng liên hệ quản trị viên.`,
      );
    }

    // Lấy account_type. Ưu tiên users.account_type; fallback bằng linkType từ
    // chính row đầu tiên (data cũ chưa backfill column).
    const userRow = await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder('u')
      .select(['u.id', 'u.accountType'])
      .where('u.id = :id', { id: user.id })
      .getOne();

    const accountType: EALinkType =
      (userRow?.accountType as EALinkType) ?? (linkRows[0].linkType as EALinkType);

    // Lọc chỉ giữ entity đúng accountType (account chỉ thuộc một loại — đề
    // phòng data lệch). Nếu khác → coi như chưa liên kết đúng loại.
    const entityIds = linkRows
      .filter((r) => r.linkType === accountType)
      .map((r) => r.aEntityId);

    if (entityIds.length === 0) {
      throw new ConflictException(
        `Tài khoản chưa liên kết với hệ ${target} đúng loại (${accountType}). Vui lòng liên hệ quản trị viên.`,
      );
    }

    const activeContext: ActiveAContext = {
      target,
      accountType,
      entityIds,
    };
    request.activeContext = activeContext;
    return true;
  }
}
