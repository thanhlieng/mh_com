# Change Log — Backend MH-api

File này ghi lại toàn bộ các thay đổi code do Claude thực hiện theo yêu cầu.
Mục đích: giúp team hiểu được những gì đang được làm mà không cần đọc từng diff.

Nếu thay đổi ảnh hưởng đến API contract, mục "Ảnh hưởng fullstack" sẽ liệt kê
các file frontend (../MH) cần được cập nhật tương ứng.

---

## [2026-06-07 00:00] — Thêm a_supplier_id và a_customer_id vào response login

**Yêu cầu:** Frontend cần phân biệt user là supplier hay customer ngay sau khi login để redirect đúng view. Backend cần trả thêm 2 trường này trong `POST /auth/login`.

**Agent thực hiện:** backend

**Các file đã thay đổi:**
- `src/modules/users/user.interface.ts` (dòng 10–11): thêm `a_supplier_id?: string | null` và `a_customer_id?: string | null` vào `IUser`
- `src/modules/users/dto/response-users.dto.ts` (dòng 22–27): thêm 2 field với `@ApiProperty({ nullable: true })` vào `ResponseUsersDto`
- `src/modules/auth/auth.service.ts` (dòng 27–28): cập nhật `mappingDataUserReponse` để map `user.a_supplier_id` và `user.a_customer_id` vào response

**Lý do / bối cảnh:** Cột `a_supplier_id` và `a_customer_id` đã tồn tại trong `UserEntity` và DB — không cần migration. Chỉ cần expose ra response.

**Ảnh hưởng fullstack:** Frontend (`MH/src/services/Authen.type.ts`) đã được cập nhật sẵn để nhận 2 trường này. Không có breaking change với code frontend cũ.


## [2026-06-08 13:45] — System B: API transactions + chi hộ files (proxy sang A)

**Yêu cầu:** Dựa vào docs API mới từ hệ thống A, tạo request trên hệ thống B cho API transactions (màn Bảng kê chi phí) và API chi hộ (màn Quản lý chi hộ).

**Các file đã thay đổi:**
- `src/modules/system-a-integration/system-a-integration.service.ts`: thêm `callSystemAMultipart()` để forward multipart/form-data (upload file) kèm token; import `form-data`.
- `src/modules/supplier-transactions/*` (mới): controller `GET /api/supplier/transactions` + service proxy tới A `GET /api/system-b/supplier/transactions/` (token supplier), pass-through params start_date/end_date/q/page/page_size.
- `src/modules/supplier-chiho-files/*` (mới): controller `GET /api/supplier/chiho-files` (liệt kê theo order_id, include_inactive) và `POST /api/supplier/chiho-files` (AnyFilesInterceptor, multipart) + service proxy tới A `GET/POST /api/system-b/supplier/chiho-files/`.
- `src/app.module.ts`: đăng ký `SupplierTransactionsModule`, `SupplierChiHoFilesModule`.
- `package.json`: khai báo dependency `form-data` (đã có sẵn transitively).
- `CLAUDE.md`: bổ sung 3 module vào bảng module chính.

**Lý do / bối cảnh:** Theo SPEC A↔B, FE B không gọi thẳng A; B (NestJS) phát token RS256 supplier rồi proxy. Lấy `a_supplier_id` từ `@GetUser()`, chặn 409 nếu tài khoản chưa liên kết supplier. Các endpoint A chỉ chấp nhận token supplier.

**Ảnh hưởng fullstack:** Thêm 3 endpoint hệ thống B:
- `GET /api/supplier/transactions` (params: start_date, end_date, q, page, page_size) → trả `{ total, results[] }` với mỗi item `type: 'pnl' | 'chi_ho'`, cột tiền chuẩn hoá `amount_after_vat`.
- `GET /api/supplier/chiho-files?order_id=&include_inactive=`
- `POST /api/supplier/chiho-files` (multipart: order_id + file0, file1...)
Frontend đã thêm service tương ứng trong `MH/src/services/supplier.services.ts`.
