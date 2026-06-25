import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  EALinkType,
  EATarget,
  UserALinkEntity,
} from 'src/modules/users/entities/user-a-link.entity';
import { UserEntity } from 'src/modules/users/user.entity';

/**
 * Helper internal cho admin CRUD link `user_a_links` (multi-target).
 *
 * Sau khi chuyển sang `ActiveTargetGuard` cho mọi route proxy, service này
 * KHÔNG còn được dùng để resolve runtime — chỉ phục vụ:
 *   - Endpoint `GET /api/account/a-targets`: liệt kê toàn bộ link của user
 *     gộp theo target.
 *   - Admin endpoint `PUT /api/admin/account-links/:userId`: thay thế toàn bộ
 *     link kèm `a_target`.
 *
 * Một account chỉ thuộc đúng MỘT loại (supplier HOẶC customer) — cố định trong
 * `users.account_type`. Có thể có nhiều entity per target.
 */

interface LinkUserContext {
  id: string;
}

export interface TargetEntities {
  a_target: EATarget;
  entity_ids: string[];
}

export interface AccountTargetsResult {
  account_type: EALinkType | null;
  targets: TargetEntities[];
}

@Injectable()
export class ActiveLinkService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Tổng hợp link của user gộp theo `a_target` + lấy `account_type`.
   * Dùng cho `GET /api/account/a-targets` để FE render switcher target.
   */
  async listLinksByTarget(
    user: LinkUserContext,
  ): Promise<AccountTargetsResult> {
    const rows = await this.dataSource.getRepository(UserALinkEntity).find({
      where: { userId: user.id },
      select: ['aTarget', 'aEntityId', 'linkType'],
      order: { aTarget: 'ASC' },
    });

    const userRow = await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder('u')
      .select(['u.id', 'u.accountType'])
      .where('u.id = :id', { id: user.id })
      .getOne();

    // Account type lấy từ users.account_type; nếu chưa có (data cũ) suy ra từ
    // chính linkType của row đầu tiên.
    const accountType: EALinkType | null =
      (userRow?.accountType as EALinkType) ??
      (rows[0]?.linkType as EALinkType) ??
      null;

    const grouped = new Map<EATarget, string[]>();
    for (const row of rows) {
      // Bỏ qua row khác loại account (đề phòng data lệch).
      if (accountType && row.linkType !== accountType) continue;
      const list = grouped.get(row.aTarget as EATarget) ?? [];
      list.push(row.aEntityId);
      grouped.set(row.aTarget as EATarget, list);
    }

    const targets: TargetEntities[] = [];
    for (const [a_target, entity_ids] of grouped.entries()) {
      targets.push({ a_target, entity_ids });
    }

    return { account_type: accountType, targets };
  }

  /** (Admin) Đọc link của một account bất kỳ theo userId. */
  getLinksForUser(userId: string): Promise<AccountTargetsResult> {
    return this.listLinksByTarget({ id: userId });
  }

  /**
   * (Admin) Thay thế TOÀN BỘ liên kết của một account.
   *
   * Body chứa `linkType` (cố định loại account) + danh sách `targets`:
   *   targets: [{ a_target: 'mhvn', ids: ['12','18'] }, { a_target: 'gp', ids: ['7'] }]
   *
   * Cũng cập nhật `users.account_type` cho khớp `linkType` (hoặc set null khi
   * gỡ toàn bộ liên kết).
   */
  async setLinksForUser(
    userId: string,
    linkType: EALinkType | null,
    targets: Array<{ a_target: EATarget; ids: string[] }>,
  ): Promise<AccountTargetsResult> {
    if (linkType && !Object.values(EALinkType).includes(linkType)) {
      throw new BadRequestException('linkType không hợp lệ.');
    }
    const normalizedTargets: Array<{ a_target: EATarget; ids: string[] }> = (
      targets || []
    ).map((t) => {
      if (!Object.values(EATarget).includes(t.a_target)) {
        throw new BadRequestException(
          `a_target không hợp lệ: ${t.a_target}. Chỉ chấp nhận 'mhvn' | 'gp'.`,
        );
      }
      const ids = Array.from(
        new Set((t.ids || []).map((s) => String(s).trim()).filter(Boolean)),
      );
      return { a_target: t.a_target, ids };
    });

    await this.dataSource.transaction(async (manager) => {
      const linkRepo = manager.getRepository(UserALinkEntity);
      const userRepo = manager.getRepository(UserEntity);

      await linkRepo.delete({ userId });

      if (linkType) {
        const rows: UserALinkEntity[] = [];
        for (const t of normalizedTargets) {
          for (const id of t.ids) {
            rows.push(
              linkRepo.create({
                userId,
                aTarget: t.a_target,
                linkType,
                aEntityId: id,
              }),
            );
          }
        }
        if (rows.length > 0) await linkRepo.save(rows);
      }

      // Sync users.account_type — set null khi gỡ link hoàn toàn.
      await userRepo.update(
        { id: userId },
        { accountType: linkType ?? null },
      );
    });

    return this.getLinksForUser(userId);
  }
}
