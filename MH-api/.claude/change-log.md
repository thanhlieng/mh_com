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

