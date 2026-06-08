# CLAUDE.md — Backend MH-api

## Tổng quan dự án

**Stack:** NestJS · TypeORM · PostgreSQL · JWT · Swagger  
**Vai trò:** REST API backend cho hệ thống quản lý vận chuyển MH  
**Frontend tương ứng:** `../MH` (Next.js) — xem `../MH/CLAUDE.md`  
**Port mặc định:** cấu hình qua `APP_PORT` trong `.env`

---

## Kiến trúc

```
src/
├── modules/          # Toàn bộ business logic, mỗi module gồm:
│   ├── *.controller  # Định nghĩa route + Swagger docs
│   ├── *.service     # Business logic
│   ├── *.module      # Dependency injection
│   ├── entities/     # TypeORM entity (ánh xạ bảng DB)
│   ├── dto/          # Data Transfer Object (validate input/output)
│   └── repositories/ # Custom query nếu cần
├── common/           # Dùng chung toàn dự án
│   ├── guards/       # JWT guard, Permission guard, Role guard
│   ├── decorators/   # @CurrentUser, @Permission, @UserRoles...
│   ├── interceptor/  # Transform response, Newrelic
│   ├── filter/       # HTTP exception filter
│   ├── logger/       # Winston logger
│   └── constants/    # Enum, message, email template
├── configs/          # Config database, JWT, AWS S3, v.v.
└── datasource/       # TypeORM module setup
```

---

## Các module chính

| Module | Mô tả |
|---|---|
| `auth` | Đăng nhập, refresh token, reset password |
| `users` | Tài khoản người dùng (admin / staff / CLIENT) |
| `customers` | Khách hàng doanh nghiệp |
| `staffs` | Nhân viên nội bộ |
| `bookings` | Đơn hàng vận chuyển (core) |
| `trackings` | Tracking / checkpoint hành trình đơn hàng |
| `checkpoints` | Quản lý điểm kiểm tra vận hành |
| `pu-deliveries` | Pickup & Delivery |
| `invoices` | Hóa đơn |
| `bangke` | Bảng kê (cargo list) |
| `system-a-integration` | Proxy gọi API hệ thống A (gắn token RS256 supplier/customer/service) |
| `supplier-transactions` | `GET /api/supplier/transactions` — proxy danh sách giao dịch (PNL + Chi hộ) của supplier từ A (màn Bảng kê chi phí) |
| `supplier-chiho-files` | `GET/POST /api/supplier/chiho-files` — liệt kê & upload file Chi hộ theo order, proxy sang A (màn Quản lý chi hộ) |
| `supplier-change-requests` | `GET /api/supplier/change-requests`, `GET /api/supplier/change-requests/:id`, `POST /api/supplier/change-requests` — proxy yêu cầu thay đổi cost PNL từ NCC sang A (màn Đề nghị thay đổi) |
| `roles` | Phân quyền động (RBAC) |
| `finance-statistical` | Báo cáo tài chính & thống kê |
| `homepage` | Nội dung trang chủ website |
| `posts` | Tin tức / bài viết |
| `cron-job` | Tác vụ chạy định kỳ (scheduler) |
| `connect-bill` | Kết nối bill với đối tác |

---

## Phân quyền (Role & Permission)

```
UsersRole (user-role.constants.ts):
  - ADMIN  → toàn quyền quản trị
  - STAFF  → nhân viên nội bộ, quyền theo role được gán
  - user   → khách hàng (CLIENT ở frontend gọi là UsersRole.CLIENT)

Cơ chế:
  - JWT Guard → xác thực token
  - Permission Guard → kiểm tra action trên từng endpoint (@Permission decorator)
  - Roles Guard → kiểm tra typeUser
```

> **Lưu ý fullstack:** Frontend (`MH`) dùng enum `UsersRole.CLIENT` để kiểm tra khách hàng, tương ứng với giá trị `'user'` ở backend.

---

## Quy ước code

- Mỗi module tuân theo pattern: `controller → service → repository → entity`
- Response chuẩn hóa qua `TransformInterceptor`
- Validate input qua `ValidationPipe` + class-validator DTO
- Log lỗi qua `CommonLogger` (Winston, lưu tại `logs/`)
- Migration DB: `yarn db:gen -- --name=TenMigration` rồi `yarn db:run`

---

## Lệnh thường dùng

```bash
yarn start:dev          # Chạy dev mode (watch)
yarn start:prod         # Chạy production
yarn db:run             # Chạy migration
yarn db:rollback        # Rollback migration mới nhất
yarn db:gen             # Tạo file migration mới
yarn seed:user          # Seed user mặc định
```

---

## Quy tắc bắt buộc: Ghi log mọi thay đổi code

Bất kỳ khi nào thực hiện chỉnh sửa code theo yêu cầu, **bắt buộc phải ghi log** vào file `.claude/change-log.md` trong thư mục gốc dự án này.

### Định dạng log

```
## [YYYY-MM-DD HH:MM] — <tiêu đề ngắn mô tả thay đổi>

**Yêu cầu:** <mô tả yêu cầu của người dùng>

**Các file đã thay đổi:**
- `src/modules/xxx/xxx.service.ts` (dòng X–Y): <mô tả thay đổi cụ thể>
- `src/modules/xxx/dto/xxx.dto.ts` (dòng X–Y): <mô tả thay đổi cụ thể>

**Lý do / bối cảnh:** <tại sao thay đổi này được thực hiện>

**Ảnh hưởng fullstack:** <nếu thay đổi API contract, liệt kê file frontend bị ảnh hưởng>
```

### Quy tắc bổ sung

- Log phải được viết **bằng tiếng Việt**.
- Nếu thay đổi ảnh hưởng đến API contract (endpoint, request/response schema), **bắt buộc ghi thêm mục "Ảnh hưởng fullstack"** để team frontend biết cần cập nhật gì.
- Ghi log **trước khi kết thúc phiên làm việc**.
- Nếu file `.claude/change-log.md` chưa tồn tại, tạo mới nó.
- Không xóa hay sửa các entry cũ trong log.
- Nếu một yêu cầu dẫn đến nhiều lần chỉnh sửa, gộp tất cả vào **một entry duy nhất**.
- Các thay đổi chỉ liên quan đến đọc/tìm kiếm code (không sửa file) thì **không cần log**.
