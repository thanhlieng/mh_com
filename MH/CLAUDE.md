# CLAUDE.md — Frontend MH

## Tổng quan dự án

**Stack:** Next.js · TypeScript · Tailwind CSS · Ant Design · React Query  
**Vai trò:** Frontend website + portal khách hàng + dashboard quản trị  
**Backend tương ứng:** `../MH-api` (NestJS) — xem `../MH-api/CLAUDE.md`

---

## Kiến trúc

```
src/
├── pages/                  # Next.js file-based routing
│   ├── index.tsx           # Trang chủ website
│   ├── login.tsx           # Login cho Admin/Staff  → /administrator
│   ├── login-home/         # Login cho khách hàng   → /manager/booking
│   ├── manager/            # Portal khách hàng (typeUser = CLIENT)
│   │   ├── index.tsx       # Dashboard khách hàng
│   │   └── booking.tsx     # Quản lý đơn hàng khách hàng  ← trang chính sau login
│   └── administrator/      # Dashboard nội bộ (Admin / Staff)
│       ├── order/          # Quản lý đơn hàng
│       ├── customer/       # Quản lý khách hàng
│       ├── employee/       # Quản lý nhân viên
│       ├── checkpoint/     # Checkpoint vận hành
│       ├── pickup/         # Pickup
│       ├── manifest/       # Manifest xuất hàng
│       ├── report/         # Báo cáo tài chính
│       └── role-permission # Phân quyền
├── container/              # Logic + UI theo tính năng (tương ứng với pages)
├── components/             # UI component tái sử dụng
├── layout/                 # Layout wrapper (HomeLayout, AdminLayout, BlankLayout...)
├── services/               # Gọi API (axios) → kết nối với MH-api
├── routes/                 # Route guard HOC
│   ├── withPrivateRoute.tsx      # Bảo vệ trang Admin/Staff
│   └── withPrivateRouteUser.tsx  # Bảo vệ trang khách hàng (CLIENT)
├── contants/               # Enum, endpoint, storage key, column config
├── hook/                   # Custom hooks
└── store/                  # State management
```

---

## Luồng đăng nhập

```
Khách hàng:  /login-home → LoginPage container → typeUser==='user' → /manager/booking
Admin/Staff: /login      → LoginContainer     → typeUser==='admin'|'staff' → /administrator
```

> **Lưu ý:** Frontend dùng `UsersRole.CLIENT` nhưng backend trả về giá trị `'user'` (xem `user-role.constants.ts` ở MH-api).

---

## Gọi API

- Axios client: `src/utils/axiosClient2.ts` và `src/utils/Http-request.ts`
- Service layer: `src/services/*.ts`
- Auth token lưu tại `localStorage` với key `ACCSESS_TOKEN` (xem `src/contants/Storage.ts`)
- Base URL cấu hình qua biến môi trường Next.js

---

## Quy tắc bắt buộc: Ghi log mọi thay đổi code

Bất kỳ khi nào thực hiện chỉnh sửa code theo yêu cầu, **bắt buộc phải ghi log** vào file `.claude/change-log.md` trong thư mục gốc dự án.

### Định dạng log

```
## [YYYY-MM-DD HH:MM] — <tiêu đề ngắn mô tả thay đổi>

**Yêu cầu:** <mô tả yêu cầu của người dùng>

**Các file đã thay đổi:**
- `path/to/file.tsx` (dòng X–Y): <mô tả thay đổi cụ thể>
- `path/to/other.ts` (dòng X–Y): <mô tả thay đổi cụ thể>

**Lý do / bối cảnh:** <tại sao thay đổi này được thực hiện>

**Ảnh hưởng fullstack:** <nếu thay đổi giao tiếp với API, ghi rõ endpoint/DTO bị ảnh hưởng>
```

### Quy tắc bổ sung

- Log phải được viết **bằng tiếng Việt** để toàn bộ team đọc được.
- Nếu thay đổi liên quan đến cách gọi API (endpoint, request body, response parsing), **bắt buộc ghi thêm mục "Ảnh hưởng fullstack"** để team backend biết.
- Ghi log **trước khi kết thúc phiên làm việc**, không ghi sau.
- Nếu file `.claude/change-log.md` chưa tồn tại, tạo mới nó.
- Không xóa hay sửa các entry cũ trong log.
- Nếu một yêu cầu dẫn đến nhiều lần chỉnh sửa, gộp tất cả vào **một entry duy nhất** cho yêu cầu đó.
- Các thay đổi chỉ liên quan đến đọc/tìm kiếm code (không sửa file) thì **không cần log**.
