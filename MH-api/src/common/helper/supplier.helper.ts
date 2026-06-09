import { ConflictException } from "@nestjs/common";

/**
 * Kiểm tra và trả về a_supplier_id từ JWT payload.
 * Dùng trong các controller supplier để đảm bảo user đã liên kết.
 *
 * @example
 * const a_supplier_id = assertSupplierLinked(user);
 */
export function assertSupplierLinked(
  user: { a_supplier_id?: string | null },
): string {
  if (!user.a_supplier_id) {
    throw new ConflictException(
      "Tài khoản chưa được liên kết với nhà cung cấp. Vui lòng liên hệ quản trị viên.",
    );
  }
  return user.a_supplier_id;
}
