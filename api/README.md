# Tài liệu API tích hợp

Mỗi khi **thêm API mới** hoặc **thay đổi API** dùng cho tích hợp với hệ thống
khác (đặc biệt là hệ thống B), tạo/cập nhật một file `.md` trong thư mục này mô
tả đầy đủ: method, path, xác thực, query/body params, response schema (kèm kiểu
dữ liệu), mã lỗi và ví dụ gọi.

## Danh sách API

| API | Method & Path | Mô tả |
|---|---|---|
| [Supplier transactions](system-b-supplier-transactions.md) | `GET /api/system-b/supplier/transactions/` | Danh sách hợp nhất PNL + Chi hộ theo supplier (token hệ thống B) |
| [Supplier Chi hộ files](system-b-supplier-chiho-files.md) | `POST` / `GET /api/system-b/supplier/chiho-files/` | Hệ thống B upload & liệt kê file `order_chiho_files`, lưu vết nguồn (`source_system`/`source_id`) |

## Liên quan

- [SPEC-ket-noi-A-B.md](../../SPEC-ket-noi-A-B.md) — kiến trúc xác thực A ↔ B.
- [RSA_KEY_SETUP.md](../../RSA_KEY_SETUP.md) — sinh khóa & phát token phía B.
- [JWT_SECURITY.md](../../JWT_SECURITY.md) — các loại token và bảo mật.
