# Change Log — Backend MH-api

File này ghi lại toàn bộ các thay đổi code do Claude thực hiện theo yêu cầu.
Mục đích: giúp team hiểu được những gì đang được làm mà không cần đọc từng diff.

Nếu thay đổi ảnh hưởng đến API contract, mục "Ảnh hưởng fullstack" sẽ liệt kê
các file frontend (../MH) cần được cập nhật tương ứng.

---

## [2026-06-11 00:00] — Thêm module supplier-prices (proxy giá supplier sang hệ thống A)

**Yêu cầu:** Bổ sung module `supplier-prices` ở System B proxy các thao tác giá (ServiceSupplierPrice) của supplier sang hệ thống A, mirror đúng cấu trúc/convention của module `supplier-transactions` và `supplier-chiho-files`.

**Các file đã thay đổi:**
- `src/modules/supplier-prices/supplier-prices.service.ts` (mới): `SupplierPricesService` inject `SystemAIntegrationService`. `getPrices` → `GET /api/system-b/supplier/prices/`; `updatePrices` → `PATCH /api/system-b/supplier/prices/` với body `{ items }`; `importPrices` → multipart `POST /api/system-b/supplier/prices/import/` (`file`, `currency_id`, `route_type`) qua `callSystemAMultipart`.
- `src/modules/supplier-prices/supplier-prices.controller.ts` (mới): `@Controller('api/supplier/prices')`, `@UseGuards(JwtAuthGuard)`. `@Get()`, `@Patch()`, `@Post('import')` (`AnyFilesInterceptor`). Mỗi route đọc header `X-Active-Supplier-Id`, dùng `ActiveLinkService.resolveSupplier(user, activeSupplierId)` để lấy `a_supplier_id`. Validate `items` rỗng và `file` thiếu bằng `BadRequestException`.
- `src/modules/supplier-prices/supplier-prices.module.ts` (mới): `imports: [SystemAIntegrationModule, ActiveLinkModule]`, providers/controllers/exports cho `SupplierPricesService`/`SupplierPricesController`.
- `src/app.module.ts` (dòng ~52, ~106): import và đăng ký `SupplierPricesModule` cạnh `SupplierTransactionsModule`.
- `CLAUDE.md`: thêm dòng mô tả module `supplier-prices` vào bảng các module.

**Lý do / bối cảnh:** Cung cấp endpoint System B cho màn quản lý giá của supplier, ủy quyền (proxy) sang các endpoint A-side `/api/system-b/supplier/prices/...` đang được xây song song.

**Ảnh hưởng fullstack:** Endpoint mới cho frontend (`../MH`): `GET /api/supplier/prices`, `PATCH /api/supplier/prices` (body `{ items: [{id, amount, amount_next_cont?, vat?}] }`), `POST /api/supplier/prices/import` (multipart: `file`, `currency_id`, `route_type`). Tất cả yêu cầu token supplier và header `X-Active-Supplier-Id` để xác định supplier active.

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

---

## [2026-06-08 22:00] — Thêm a_supplier_id vào JWT payload + helper assertSupplierLinked

**Yêu cầu:** `@GetUser() user: UserEntity` không có `a_supplier_id` vì JWT payload không chứa trường này, dẫn đến lỗi "Tài khoản chưa được liên kết với nhà cung cấp" ở tất cả supplier API. Tạo hàm helper để các API get đúng `a_supplier_id`.

**Agent thực hiện:** backend

**Các file đã thay đổi:**
- `src/modules/auth/payloads/jwt-payload.ts` (dòng 7–8): thêm `a_supplier_id?: string` và `a_customer_id?: string` vào `IJwtPayload`
- `src/modules/auth/dto/generate-token-input.dto.ts` (dòng 6–7): thêm `a_supplier_id?: string` và `a_customer_id?: string`
- `src/modules/auth/dto/create-token.dto.ts` (dòng 27–32): thêm `a_supplier_id?: string` và `a_customer_id?: string`
- `src/modules/auth/token.service.ts` (dòng 18, 37–38): destructure `a_supplier_id`, `a_customer_id` từ DTO và đưa vào JWT payload
- `src/modules/auth/token.service.ts` (dòng 60–61, 70): destructure và pass qua `generateAuthTokens`
- `src/modules/auth/auth.service.ts` (dòng 65–66): truyền `a_supplier_id` và `a_customer_id` từ user entity vào `generateAuthTokens`
- `src/common/helper/supplier.helper.ts` (mới): hàm `assertSupplierLinked(user)` — kiểm tra và trả về `a_supplier_id`, throw `ConflictException` nếu thiếu
- `src/modules/supplier-transactions/supplier-transactions.controller.ts` (dòng 6, 10, 33, 35–38): thay inline check bằng `assertSupplierLinked(user)`, xoá import `ConflictException`
- `src/modules/supplier-chiho-files/supplier-chiho-files.controller.ts` (dòng 10, 16, 37, 63): thay 2 inline check bằng `assertSupplierLinked(user)`, xoá import `ConflictException`

**Lý do / bối cảnh:** JWT payload (HS256) chỉ chứa `{ id, username, type, typeUser, permissions }` — thiếu `a_supplier_id`. Khi controller gọi `@GetUser() user: UserEntity` rồi destructure `a_supplier_id`, kết quả là `undefined`. Fix bằng cách thêm trường vào payload trong toàn bộ chain token generation, tạo helper `assertSupplierLinked` để dùng thống nhất ở các controller supplier.

**Ảnh hưởng fullstack:** Token cũ (phát hành trước fix) sẽ không có `a_supplier_id` trong payload. User cần đăng nhập lại để lấy token mới chứa đủ thông tin. Frontend không bị ảnh hưởng.

---

## [2026-06-10 00:00] — Một account liên kết nhiều supplier/customer (multi-link)

**Yêu cầu:** Logic thay đổi: một account B trước đây chỉ liên kết 1 supplier hoặc 1 customer (cột scalar `a_supplier_id`/`a_customer_id`). Giờ một account có thể liên kết với NHIỀU supplier HOẶC NHIỀU customer (mỗi account đúng một loại). Cần thiết kế lại logic.

**Agent thực hiện:** backend

**Quyết định thiết kế:**
- Token gửi sang A KHÔNG đổi: vẫn mang đúng một `sub`. Multi-link chỉ là việc của B.
- Mỗi request proxy phải chỉ rõ thực thể A đang thao tác qua header `X-Active-Supplier-Id` (hoặc `X-Active-Customer-Id`). B kiểm tra id đó nằm trong tập liên kết của account (chống leo thang quyền). Nếu account chỉ có 1 liên kết và thiếu header → dùng liên kết duy nhất (tương thích UI cũ); nếu có nhiều mà thiếu header → `400`; nếu id không thuộc account → `403`.
- Resolver luôn truy vấn DB (tươi mới) thay vì tin id nhúng trong JWT.

**Các file đã thay đổi:**
- `src/modules/users/entities/user-a-link.entity.ts` (mới): entity `UserALinkEntity` + enum `EALinkType` — bảng `user_a_links(user_id, link_type, a_entity_id)`.
- `src/common/services/active-link.service.ts` (mới): `ActiveLinkService` — `resolveSupplier`/`resolveCustomer`/`listLinks`, kiểm tra membership + chọn active theo header, fallback cột scalar cũ.
- `src/common/services/active-link.module.ts` (mới): module export `ActiveLinkService`.
- `src/configs/database/migrations/1769300000000-CreateUserALinks.ts` (mới): tạo bảng `user_a_links` + index + FK; backfill từ `users.a_supplier_id`/`a_customer_id`. Giữ cột scalar cũ (drop ở migration sau).
- `src/modules/supplier-transactions/supplier-transactions.controller.ts` + `.module.ts`: dùng `ActiveLinkService.resolveSupplier(user, header)` thay `assertSupplierLinked`.
- `src/modules/supplier-chiho-files/supplier-chiho-files.controller.ts` + `.module.ts`: tương tự cho 2 endpoint (GET/POST).
- `src/modules/supplier-change-requests/supplier-change-requests.controller.ts` + `.module.ts`: tương tự cho 3 endpoint; bỏ inline check `ConflictException`, thêm `@ApiHeader`.
- `src/modules/account-links/account-links.controller.ts` + `.module.ts` (mới): `GET /api/account/a-links` trả `{ linkType, ids }` cho FE render switcher.
- `src/app.module.ts`: đăng ký `AccountLinksModule`.
- `src/common/helper/supplier.helper.ts`: đánh dấu `assertSupplierLinked` là `@deprecated`.

**Ảnh hưởng fullstack:**
- API contract đổi: mọi call `/api/supplier/*` giờ nên gửi header `X-Active-Supplier-Id` khi account có nhiều liên kết. FE (`MH/`) cần:
  - Gọi `GET /api/account/a-links` để lấy danh sách và render bộ chọn supplier/customer.
  - Đính header `X-Active-Supplier-Id` (hoặc `X-Active-Customer-Id`) vào các service call proxy trong `MH/src/services/supplier.services.ts`.
  - Xử lý lỗi mới: `400` (chưa chọn thực thể khi có nhiều), `403` (chọn thực thể không thuộc account), `409` (chưa liên kết).
- DB: cần chạy `yarn db:run` để tạo bảng `user_a_links` và backfill.
- Admin/tooling cần ghi nhiều liên kết vào `user_a_links` (cột scalar cũ vẫn dùng làm fallback cho 1 liên kết).

---

## [2026-06-10 00:30] — Gỡ cột scalar a_supplier_id/a_customer_id khỏi code (sau khi drop DB)

**Yêu cầu:** Người dùng đã chạy migration xoá 2 cột `a_supplier_id`, `a_customer_id` khỏi bảng `users` và tạo bảng liên kết `user_a_links`. Cần migrate code BE (MH-api) để không còn tham chiếu 2 cột đã xoá, dùng hoàn toàn `user_a_links`.

**Agent thực hiện:** backend

**Các file đã thay đổi:**
- `src/common/services/active-link.service.ts`: bỏ tham số/logic fallback theo cột scalar (`getLinkedIds`, `resolve`, `resolveSupplier/Customer`, `listLinks`); `LinkUserContext` chỉ còn `id`. Thêm `resolveActiveIdentity(user, supplierHeader, customerHeader)` — tự xác định loại liên kết (supplier/customer) rồi xác thực id active, trả `{ a_supplier_id? | a_customer_id? }`.
- `src/modules/auth/payloads/jwt-payload.ts`: bỏ `a_supplier_id`, `a_customer_id` khỏi `IJwtPayload`.
- `src/modules/auth/dto/create-token.dto.ts`, `generate-token-input.dto.ts`: bỏ 2 field.
- `src/modules/auth/token.service.ts`: bỏ 2 field khỏi destructure + payload (3 chỗ).
- `src/modules/auth/auth.service.ts`: bỏ 2 field khỏi `mappingDataUserReponse` và `generateAuthTokens`.
- `src/modules/users/user.interface.ts`, `dto/response-users.dto.ts`: bỏ 2 field.
- `src/modules/bangke/bangke.controller.ts` + `bangke.module.ts`: thay đọc `user.a_supplier_id/a_customer_id` bằng `ActiveLinkService.resolveActiveIdentity` qua header `X-Active-Supplier-Id` / `X-Active-Customer-Id`; import `ActiveLinkModule`.
- `src/common/helper/supplier.helper.ts`: **xoá file** (deprecated, không còn dùng, tham chiếu cột đã xoá).

**Lý do / bối cảnh:** Sau khi DB drop 2 cột, mọi code đọc `user.a_supplier_id`/`a_customer_id` (đặc biệt JWT payload và module bangke) sẽ trả `undefined` → sai logic. Chuyển toàn bộ nguồn liên kết sang bảng `user_a_links` thông qua `ActiveLinkService`.

**Ảnh hưởng fullstack:**
- Login response (`ResponseUsersDto`) KHÔNG còn `a_supplier_id`/`a_customer_id`. FE lấy danh sách liên kết qua `GET /api/account/a-links`.
- Endpoint `/api/bangke` giờ cần header `X-Active-Supplier-Id` (hoặc `X-Active-Customer-Id`) khi account có nhiều liên kết; lỗi `400` nếu có nhiều mà thiếu header, `403` nếu id không thuộc account, `409` nếu chưa liên kết.
- Token đăng nhập cũ (còn chứa `a_supplier_id` trong payload) không còn được dùng — claim đó bị bỏ qua; không gây lỗi. Khuyến nghị đăng nhập lại.

## [2026-06-11 15:53] — Thêm proxy liệt kê & xóa yêu cầu thay đổi giá (supplier-prices B1+B2)

**Yêu cầu:** Mở rộng module `supplier-prices` với hai route proxy cho luồng duyệt thay đổi giá: liệt kê yêu cầu thay đổi giá của chính supplier (hỗ trợ lọc `?status=`) và xóa một yêu cầu đang PENDING.

**Các file đã thay đổi:**
- `src/modules/supplier-prices/supplier-prices.service.ts` (dòng 61–92): thêm `getPriceChanges(a_supplier_id, status?)` → proxy `GET /api/system-b/supplier/price-changes/` (gắn `?status=` đã encode nếu có); thêm `deletePriceChange(a_supplier_id, id)` → proxy `DELETE /api/system-b/supplier/price-changes/<id>/`.
- `src/modules/supplier-prices/supplier-prices.controller.ts` (dòng 1–14, 85–117): import thêm `Delete`, `Param`, `Query`; thêm route `@Get('price-changes')` và `@Delete('price-changes/:id')`, resolve supplier qua header `X-Active-Supplier-Id` rồi gọi service tương ứng. Các route cũ giữ nguyên.
- `CLAUDE.md`: cập nhật dòng `supplier-prices` mô tả hai endpoint mới.

**Lý do / bối cảnh:** System B đóng vai trò proxy sang System A cho luồng duyệt thay đổi giá NCC (tasks B1+B2). A đã có sẵn các endpoint tương ứng; B chỉ chuyển tiếp kèm token supplier active.

**Ảnh hưởng fullstack:**
- Endpoint mới `GET /api/supplier/price-changes` (hỗ trợ `?status=`) trả về danh sách yêu cầu thay đổi giá của supplier.
- Endpoint mới `DELETE /api/supplier/price-changes/:id` xóa yêu cầu PENDING; A trả `204` khi thành công, `400` nếu không PENDING, `404` nếu không thuộc supplier.
- Cả hai cần header `X-Active-Supplier-Id` khi account có nhiều liên kết. FE màn quản lý giá cần bổ sung gọi hai service mới này.
