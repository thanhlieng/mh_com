import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sign } from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";

interface SystemBTokenPayload {
  iss: string;
  aud: string;
  type: "supplier" | "customer" | "service";
  sub?: string; // For supplier token only
  exp?: number;
}

@Injectable()
export class SystemBJwtService {
  private privateKeyPem: string;
  private cachedServiceToken: string | null = null;
  private serviceTokenExpiry: number = 0;

  constructor(private configService: ConfigService) {
    const keyPath = this.configService.get<string>("SYSTEM_B_PRIVATE_KEY_PATH");
    if (!keyPath) {
      throw new Error(
        "SYSTEM_B_PRIVATE_KEY_PATH environment variable is not set",
      );
    }
    // Read private key from file
    try {
      const absolutePath = path.resolve(keyPath);
      this.privateKeyPem = fs.readFileSync(absolutePath, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to read SYSTEM_B_PRIVATE_KEY from file "${keyPath}": ${error.message}`,
      );
    }
  }

  /**
   * Issue a supplier token (RS256)
   * This token represents a specific supplier from System A
   * @param aSupplierIdId - The supplier ID from System A (maps to Supplier#id in A)
   * @returns JWT token string
   * @throws ConflictException if a_supplier_id is null/undefined
   */
  issueSupplierToken(a_supplier_id: string): string {
    if (!a_supplier_id) {
      throw new ConflictException(
        "Supplier chưa được liên kết. Vui lòng liên hệ quản trị viên.",
      );
    }

    const payload: SystemBTokenPayload = {
      iss: "system-b",
      aud: "system-a",
      type: "supplier",
      sub: a_supplier_id,
      // exp is set to 200 days (matching B's current JWT lifetime)
      exp: Math.floor(Date.now() / 1000) + 200 * 24 * 60 * 60,
    };

    try {
      return sign(payload, this.privateKeyPem, { algorithm: "RS256" });
    } catch (error) {
      throw new BadRequestException("Failed to issue supplier token");
    }
  }

  issueCustomerToken(a_customer_id: string): string {
    if (!a_customer_id) {
      throw new ConflictException(
        "Tài khoản chưa được liên kết với khách hàng. Vui lòng liên hệ quản trị viên.",
      );
    }

    const payload: SystemBTokenPayload = {
      iss: "system-b",
      aud: "system-a",
      type: "customer",
      sub: a_customer_id,
      exp: Math.floor(Date.now() / 1000) + 200 * 24 * 60 * 60,
    };

    try {
      return sign(payload, this.privateKeyPem, { algorithm: "RS256" });
    } catch (error) {
      throw new BadRequestException("Failed to issue customer token");
    }
  }

  /**
   * Issue a service token (RS256)
   * This token represents System B itself (not tied to a specific supplier)
   * Use for master data APIs or system-to-system calls
   * @returns JWT token string
   */
  issueServiceToken(): string {
    const now = Math.floor(Date.now() / 1000);
    // Return cached token if it still has more than 60s remaining
    if (this.cachedServiceToken && now < this.serviceTokenExpiry - 60) {
      return this.cachedServiceToken;
    }

    const expiry = now + 200 * 24 * 60 * 60;
    const payload: SystemBTokenPayload = {
      iss: "system-b",
      aud: "system-a",
      type: "service",
      exp: expiry,
    };

    try {
      const token = sign(payload, this.privateKeyPem, { algorithm: "RS256" });
      this.cachedServiceToken = token;
      this.serviceTokenExpiry = expiry;
      return token;
    } catch (error) {
      throw new BadRequestException("Failed to issue service token");
    }
  }
}
