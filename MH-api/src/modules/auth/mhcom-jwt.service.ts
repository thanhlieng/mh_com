import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sign } from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import { EATarget } from "src/modules/users/entities/user-a-link.entity";

interface MhcomTokenPayload {
  iss: string;
  aud: string;
  type: "supplier" | "customer" | "service";
  sub?: string; // First id (compat với A khi tách token)
  supplier_ids?: string[]; // claim mảng cho multi-entity
  customer_ids?: string[];
  exp?: number;
}

interface CachedToken {
  token: string;
  exp: number;
}

/**
 * Service mint JWT RS256 do mhcom phát hành cho A.
 *
 * Multi-target: 1 account mhcom có thể đồng thời thao tác với hệ mhvn và gp.
 *   - Private key có thể đặt riêng cho mỗi target qua
 *     `MHCOM_PRIVATE_KEY_PATH_MHVN` / `MHCOM_PRIVATE_KEY_PATH_GP`.
 *   - Nếu chỉ đặt key đơn lẻ `MHCOM_PRIVATE_KEY_PATH` (backward compat),
 *     key đó được dùng cho CẢ HAI target.
 *
 * Token spec:
 *   { iss: 'mhcom', aud: 'mhvn', type: 'supplier'|'customer'|'service',
 *     sub: '<first id>', supplier_ids|customer_ids: [...], exp: ... }
 *
 * `aud` luôn 'mhvn' theo spec — A không phân biệt theo target.
 */
@Injectable()
export class MhcomJwtService {
  private privateKeyByTarget: Record<EATarget, string>;
  private serviceTokenCache: Map<EATarget, CachedToken> = new Map();

  // Token lifetime: 200 ngày (giữ tương đương lifetime JWT cũ của mhcom).
  private static readonly TOKEN_TTL_SECONDS = 200 * 24 * 60 * 60;

  constructor(private configService: ConfigService) {
    const sharedPath = this.configService.get<string>("MHCOM_PRIVATE_KEY_PATH");
    const mhvnPath =
      this.configService.get<string>("MHCOM_PRIVATE_KEY_PATH_MHVN") ||
      sharedPath;
    const gpPath =
      this.configService.get<string>("MHCOM_PRIVATE_KEY_PATH_GP") ||
      sharedPath;

    if (!mhvnPath) {
      throw new Error(
        "Missing MHCOM_PRIVATE_KEY_PATH_MHVN (or fallback MHCOM_PRIVATE_KEY_PATH) — không thể mint token cho target 'mhvn'.",
      );
    }
    if (!gpPath) {
      throw new Error(
        "Missing MHCOM_PRIVATE_KEY_PATH_GP (or fallback MHCOM_PRIVATE_KEY_PATH) — không thể mint token cho target 'gp'.",
      );
    }

    this.privateKeyByTarget = {
      [EATarget.MHVN]: this.readKeyOrThrow(mhvnPath, EATarget.MHVN),
      [EATarget.GP]: this.readKeyOrThrow(gpPath, EATarget.GP),
    };
  }

  private readKeyOrThrow(keyPath: string, target: EATarget): string {
    try {
      const absolutePath = path.resolve(keyPath);
      return fs.readFileSync(absolutePath, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to read MHCOM private key for target '${target}' at "${keyPath}": ${error.message}`,
      );
    }
  }

  /**
   * Mint token supplier (multi-id). Claim `supplier_ids` chứa toàn bộ id; `sub`
   * = id đầu tiên để tương thích với code A đọc single `sub`.
   */
  issueSupplierToken(supplierIds: string[], target: EATarget): string {
    const ids = (supplierIds || []).map((s) => String(s).trim()).filter(Boolean);
    if (ids.length === 0) {
      throw new ConflictException(
        "Tài khoản chưa được liên kết với supplier nào. Vui lòng liên hệ quản trị viên.",
      );
    }
    const payload: MhcomTokenPayload = {
      iss: "mhcom",
      aud: "mhvn",
      type: "supplier",
      sub: ids[0],
      supplier_ids: ids,
      exp: Math.floor(Date.now() / 1000) + MhcomJwtService.TOKEN_TTL_SECONDS,
    };
    return this.signOrThrow(payload, target, "supplier");
  }

  /**
   * Mint token customer (multi-id). Tương tự supplier với claim `customer_ids`.
   */
  issueCustomerToken(customerIds: string[], target: EATarget): string {
    const ids = (customerIds || []).map((s) => String(s).trim()).filter(Boolean);
    if (ids.length === 0) {
      throw new ConflictException(
        "Tài khoản chưa được liên kết với khách hàng nào. Vui lòng liên hệ quản trị viên.",
      );
    }
    const payload: MhcomTokenPayload = {
      iss: "mhcom",
      aud: "mhvn",
      type: "customer",
      sub: ids[0],
      customer_ids: ids,
      exp: Math.floor(Date.now() / 1000) + MhcomJwtService.TOKEN_TTL_SECONDS,
    };
    return this.signOrThrow(payload, target, "customer");
  }

  /**
   * Mint service token cho từng target. Cache riêng cho mỗi target để tránh
   * tái sign mỗi request; refresh khi sắp hết hạn (< 60s remaining).
   */
  issueServiceToken(target: EATarget): string {
    const now = Math.floor(Date.now() / 1000);
    const cached = this.serviceTokenCache.get(target);
    if (cached && now < cached.exp - 60) {
      return cached.token;
    }
    const exp = now + MhcomJwtService.TOKEN_TTL_SECONDS;
    const payload: MhcomTokenPayload = {
      iss: "mhcom",
      aud: "mhvn",
      type: "service",
      exp,
    };
    const token = this.signOrThrow(payload, target, "service");
    this.serviceTokenCache.set(target, { token, exp });
    return token;
  }

  private signOrThrow(
    payload: MhcomTokenPayload,
    target: EATarget,
    kind: "supplier" | "customer" | "service",
  ): string {
    const key = this.privateKeyByTarget[target];
    if (!key) {
      throw new BadRequestException(
        `Không có private key cấu hình cho target '${target}'.`,
      );
    }
    try {
      return sign(payload, key, { algorithm: "RS256" });
    } catch (error) {
      throw new BadRequestException(
        `Failed to issue ${kind} token for target '${target}'`,
      );
    }
  }
}
