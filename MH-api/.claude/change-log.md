# Change Log — Backend MH-api

File này ghi lại toàn bộ các thay đổi code do Claude thực hiện theo yêu cầu.
Mục đích: giúp team hiểu được những gì đang được làm mà không cần đọc từng diff.

Nếu thay đổi ảnh hưởng đến API contract, mục "Ảnh hưởng fullstack" sẽ liệt kê
các file frontend (../MH) cần được cập nhật tương ứng.

---

## [2026-06-12 00:00] — Đổi tên thuật ngữ system-a/system-b sang mhvn/mhcom (breaking change đồng bộ với repo Django)

**Yêu cầu:** Đổi toàn bộ thuật ngữ "System A" (hệ thống dữ liệu) → **mhvn** và "System B" (hệ thống ký token, repo này) → **mhcom** ở mọi nơi: giá trị wire của JWT (`iss`/`aud`), prefix endpoint gọi sang hệ thống dữ liệu, biến môi trường, tên class/file/thư mục, method, comment và tài liệu. Đây là breaking change phối hợp: phía Django thay đổi song song với CÙNG mapping wire.

**Mapping wire (phải khớp tuyệt đối với phía Django):**
- JWT `iss`: `system-b` → `mhcom`
- JWT `aud`: `system-a` → `mhvn`
- Prefix endpoint gọi sang hệ thống dữ liệu: `/api/system-b/...` → `/api/mhcom/...` (giữ nguyên phần còn lại của path)
- Env: `SYSTEM_A_API_BASE_URL` → `MHVN_API_BASE_URL`; `SYSTEM_B_PRIVATE_KEY_PATH` → `MHCOM_PRIVATE_KEY_PATH`; `SYSTEM_B_PUBLIC_KEY_PATH` → `MHCOM_PUBLIC_KEY_PATH`

**Các file đã đổi tên (git mv):**
- `src/modules/auth/system-b-jwt.service.ts` → `src/modules/auth/mhcom-jwt.service.ts`
- `src/modules/system-a-integration/` → `src/modules/mhvn-integration/` (kèm `system-a-integration.{service,module}.ts` → `mhvn-integration.{service,module}.ts`)

**Các file đã thay đổi nội dung:**
- `src/modules/auth/mhcom-jwt.service.ts`: class `SystemBJwtService` → `MhcomJwtService`, interface `SystemBTokenPayload` → `MhcomTokenPayload`, giá trị `iss`/`aud`, đọc env `MHCOM_PRIVATE_KEY_PATH`, JSDoc.
- `src/modules/mhvn-integration/mhvn-integration.service.ts`: class `SystemAIntegrationService` → `MhvnIntegrationService`, method `callSystemA`/`callSystemAMultipart` → `callMhvn`/`callMhvnMultipart`, env `MHVN_API_BASE_URL`, field lỗi `systemAError` → `mhvnError`, comment/log.
- `src/modules/mhvn-integration/mhvn-integration.module.ts`: module `SystemAIntegrationModule` → `MhvnIntegrationModule`.
- `src/modules/auth/auth.module.ts`: cập nhật import/provider/export `MhcomJwtService`.
- `src/app.module.ts`: cập nhật import + registration `MhvnIntegrationModule`.
- Các module/service/controller tiêu thụ cập nhật import path, tên class, biến `mhvnIntegrationService`, lời gọi `callMhvn*`, endpoint `/api/mhcom/...`, comment: `bangke`, `services-catalog`, `supplier-transactions`, `supplier-prices`, `supplier-chiho-files`, `supplier-change-requests`.
- `.env`, `sample.env`: đổi tên key env (giữ nguyên giá trị).
- `docs/key-generation.md`, `CLAUDE.md`: cập nhật mô tả, tên module, env.

**Lý do / bối cảnh:** Chuẩn hóa định danh hai hệ thống theo tên mới (mhvn = data system, mhcom = supplier-facing/token signer). Vì giá trị `iss`/`aud` và prefix path là wire-level, đây là breaking change phải deploy đồng bộ với phía Django dùng cùng mapping.

**Ảnh hưởng fullstack:** Không đổi endpoint mà frontend (`../MH`) gọi. Breaking-deploy chỉ ở wire giữa mhcom ↔ mhvn (JWT claims + prefix `/api/mhcom/`) — phải deploy đồng thời với repo Django (mhvn) để xác thực token không gãy.

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

---

## [2026-06-12 16:40] — Fix import file giá báo "No file provided" (thiếu Content-Length khi proxy multipart)

**Yêu cầu:** Upload file giá từ web hệ thống B luôn báo `No file provided`.

**Nguyên nhân (đã tái hiện & xác minh):** `callSystemAMultipart` gửi form-data qua `HttpService` (axios) **không kèm `Content-Length`** → request đi ở dạng `Transfer-Encoding: chunked`. Django/WSGI **không đọc được multipart body dạng chunked** → `request.FILES` rỗng → A trả `{"error":"No file provided"}`. (File vẫn tới B đầy đủ, `file.buffer` có dữ liệu — lỗi nằm ở khâu B→A.)

**Các file đã thay đổi:**
- `src/modules/system-a-integration/system-a-integration.service.ts` (`callSystemAMultipart`): thêm header `'Content-Length': form.getLengthSync()` khi POST multipart sang A.

**Xác minh:** Sau khi thêm Content-Length, A nhận được file (qua được bước kiểm tra file + supplier, đi vào xử lý). Trước fix: "No file provided".

**Ảnh hưởng:** Sửa cho **mọi** upload multipart proxy B→A — gồm import giá (`/api/supplier/prices/import`) và upload file Chi hộ (`/api/supplier/chiho-files`). Cần **build lại + restart** server B (`yarn build` đã chạy; restart `node dist/main`).

---

## [2026-06-12 17:30] — API danh mục supplier/customer (service token) cho web admin tạo tài khoản NCC

**Yêu cầu:** Hệ thống mhcom có web admin để tạo tài khoản cho NCC. Cần API lấy danh sách customer và supplier từ mhvn (mhgs_log_be) trả về cho mhcom backend để màn admin chọn liên kết.

**Bối cảnh token:** Đây là dữ liệu danh mục (master data) — KHÔNG gắn với một supplier/customer cụ thể. Vì vậy proxy dùng **service token** (không truyền `a_supplier_id`/`a_customer_id` → `MhvnIntegrationService` tự phát service token). Phía mhvn chốt bằng `ServiceTokenOnly` để token supplier/customer KHÔNG thể liệt kê toàn bộ danh mục.

**Các file đã thay đổi (mhcom / MH-api — hệ thống B):**
- `src/modules/mhvn-directory/mhvn-directory.service.ts` (mới): `getSuppliers()` / `getCustomers()` proxy sang `/api/mhcom/suppliers/` và `/api/mhcom/customers/` của mhvn bằng service token; truyền tiếp `?q=` và `?is_active=`.
- `src/modules/mhvn-directory/mhvn-directory.controller.ts` (mới): `GET /api/directory/suppliers`, `GET /api/directory/customers`. `JwtAuthGuard` + chốt `typeUser === ADMIN` (ném `403` nếu không phải admin).
- `src/modules/mhvn-directory/mhvn-directory.module.ts` (mới): khai báo module (import `MhvnIntegrationModule`, `AuthModule`).
- `src/app.module.ts`: đăng ký `MhvnDirectoryModule`.

**Các file đã thay đổi (mhvn / mhgs_log_be — hệ thống A):**
- `mhcom/directory_views.py` (mới): `MhcomSupplierDirectoryAPI`, `MhcomCustomerDirectoryAPI` — `permission_classes = [ServiceTokenOnly]`; lọc `q`, `is_active` (mặc định chỉ active), cap 1000 bản ghi; trả `id, company_name, tax_number, secondary_name, is_active, managed_company{id, company_name}`.
- `prj/urls.py`: route `api/mhcom/suppliers/`, `api/mhcom/customers/`.

**Ảnh hưởng fullstack:**
- Endpoint mới (chỉ ADMIN): `GET /api/directory/suppliers?q=&is_active=` → `{ message, suppliers: [...] }`.
- Endpoint mới (chỉ ADMIN): `GET /api/directory/customers?q=&is_active=` → `{ message, customers: [...] }`.
- FE web admin (màn tạo/liên kết tài khoản NCC) gọi hai endpoint này để render bộ chọn supplier/customer. Không cần header `X-Active-*` (không gắn đối tượng).

---

## [2026-06-12 18:30] — Admin API quản lý liên kết account ↔ mhvn (phục vụ tab "Kết nối mhvn")

**Yêu cầu:** Hỗ trợ tab "Kết nối mhvn" ở màn quản trị khách hàng (FE): admin gán một account liên kết với nhiều supplier HOẶC nhiều customer bên mhvn (chỉ một loại).

**Các file đã thay đổi:**
- `src/common/services/active-link.service.ts`: thêm `getLinksForUser(userId)` và `setLinksForUser(userId, linkType, ids)`. `setLinksForUser` chạy transaction xoá sạch liên kết cũ rồi ghi lại theo một `linkType` → KHÔNG thể tồn tại cả hai loại; chuẩn hoá id (bỏ trùng/rỗng); `linkType=null`/`ids=[]` để gỡ liên kết.
- `src/modules/account-links/admin-account-links.controller.ts` (mới): `GET /api/admin/account-links/:userId`, `PUT /api/admin/account-links/:userId`. `JwtAuthGuard` + chốt `typeUser === ADMIN` (403 nếu không phải admin).
- `src/modules/account-links/dto/set-account-links.dto.ts` (mới): validate body (`linkType` optional/nullable enum, `ids` mảng string).
- `src/modules/account-links/account-links.module.ts`: import `AuthModule`, đăng ký `AdminAccountLinksController`.

**Lý do / bối cảnh:** Trước đây chỉ có `GET /api/account/a-links` cho account hiện tại; chưa có cách để admin đọc/ghi liên kết của account khác. Liên kết lưu ở bảng `user_a_links` (`UserALinkEntity`).

**Ảnh hưởng fullstack:**
- Endpoint mới (chỉ ADMIN): `GET /api/admin/account-links/:userId` → `{ linkType, ids }`.
- Endpoint mới (chỉ ADMIN): `PUT /api/admin/account-links/:userId` body `{ linkType, ids }` → thay thế toàn bộ liên kết, trả `{ linkType, ids }`.
- FE: `MH/src/customer/components/MhvnConnect/MhvnConnect.tsx` (tab "Kết nối mhvn"). Kết hợp với `GET /api/directory/suppliers|customers`.

---

## [2026-06-14 10:30] — API tìm đơn theo booking/bill (màn Quản lý chi hộ)

**Yêu cầu:** Ở màn "Quản lý chi hộ" của mhcom có ô input search. Cần tạo API ở mhvn (mhgs_log_be) để mhcom tra cứu đơn hàng theo `booking_bill_number`, logic **match exact**.

**Các file đã thay đổi (mhcom / MH-api — hệ thống B):**
- `src/modules/supplier-order-search/supplier-order-search.service.ts` (mới): `findByBooking()` proxy `GET /api/mhcom/supplier/order-by-booking/?booking_bill_number=<value>` sang mhvn bằng token supplier (`a_supplier_id`).
- `src/modules/supplier-order-search/supplier-order-search.controller.ts` (mới): `GET /api/supplier/order-by-booking?q=` (alias `booking_bill_number`). `JwtAuthGuard` + resolve supplier active qua `ActiveLinkService` (header `X-Active-Supplier-Id`).
- `src/modules/supplier-order-search/supplier-order-search.module.ts` (mới): import `MhvnIntegrationModule`, `ActiveLinkModule`.
- `src/app.module.ts`: đăng ký `SupplierOrderSearchModule`.

**Các file đã thay đổi (mhvn / mhgs_log_be — hệ thống A):**
- `mhcom/supplier_order_search_views.py` (mới): `SupplierOrderByBookingAPI` — `permission_classes = [SupplierTokenOnly]`; tìm `Order` theo `booking_bill_number` **exact match**, chỉ trả nếu supplier (trong token) có OrderChiHo trên đơn (parity bảo mật với upload file Chi hộ); nhiều đơn cùng booking → lấy đơn mới nhất; trả đơn + các chihos thuộc supplier (id, amount, amount_after_vat, services[], contract_number, customer_name, invoice_exporter).
- `prj/urls.py`: route `api/mhcom/supplier/order-by-booking/`.

**Lý do / bối cảnh:** Trước đó FE dùng MOCK cho `getOrderByCode`. Nay nối chuỗi FE → MH-api → mhvn thật để tra cứu đơn theo số booking/bill.

**Ảnh hưởng fullstack:**
- Endpoint mới: `GET /api/supplier/order-by-booking?q=<booking>` → trả `OrderByCodeResponse` (`{ id, order_code, booking_bill_number, bl, status, order_type, customer_name, shipper, chihos[] }`); `404` nếu không khớp / supplier không tham gia. Cần header `X-Active-Supplier-Id` khi account liên kết nhiều supplier.
- FE: `MH/src/services/supplier.services.ts` `getOrderByCode` đã trỏ sang endpoint này (bỏ MOCK).

---

## [2026-06-14 14:00] — Thêm bước duyệt file Chi hộ (contract proxy thay đổi)

**Yêu cầu:** Màn Quản lý chi hộ đang upload file thẳng vào đơn của mhgs. Thêm bước duyệt file trước khi lưu vào đơn; user nội bộ mhgs (admin/kế toán/cus/GD) duyệt.

**Thay đổi ở MH-api:** Không sửa code (module `supplier-chiho-files` proxy JSON nguyên trạng sang mhvn). Ghi log vì **contract proxy thay đổi**:
- `GET /api/supplier/chiho-files` nay trả thêm mỗi file: `approval_status` (PENDING/APPROVED/REJECTED), `approved_by`, `approved_at`.
- `POST /api/supplier/chiho-files` (upload từ NCC) — file tạo ra ở trạng thái **PENDING**, chưa được coi là đã lưu vào đơn cho tới khi mhgs duyệt.

**Bối cảnh (hệ thống A — mhgs_log_be):** `OrderChiHoFiles` thêm `approval_status/approved_by/approved_at`; endpoint duyệt nội bộ `GET|PATCH /api/order-chiho-files/approvals/` (role admin/KT/GD/PT).

**Ảnh hưởng fullstack:** FE mhcom (`MH/src/container/PaymentManagementContainer`) hiển thị badge trạng thái duyệt từng file. FE nội bộ mhgs (MH-logistic) có màn "Duyệt file chi hộ".

---

## [2026-06-14 16:00] — API list file Chi hộ đã upload (gộp mọi đơn) cho tab mới

**Yêu cầu:** Tab "Danh sách yêu cầu tải lên" ở màn Quản lý chi hộ cần bảng tất cả file NCC đã yêu cầu tải lên across mọi đơn.

**Các file đã thay đổi:**
- `src/modules/supplier-chiho-files/supplier-chiho-files.service.ts`: thêm `listAllUploads(a_supplier_id, status?, includeInactive?)` proxy `GET /api/mhcom/supplier/chiho-files/uploads/` sang mhvn.
- `src/modules/supplier-chiho-files/supplier-chiho-files.controller.ts`: thêm `GET /api/supplier/chiho-files/uploads?status=` (đặt trước route `@Get()` order_id). Resolve supplier qua `ActiveLinkService`.

**Ảnh hưởng fullstack:** Endpoint mới `GET /api/supplier/chiho-files/uploads?status=PENDING|APPROVED|REJECTED` → `{ source_ids, count, data:[{ order_id, order_code, booking_bill_number, file_name, file_url, approval_status, created_at }] }`. Cần header `X-Active-Supplier-Id` khi account đa liên kết. FE `MH/src/services/supplier.services.ts#listChiHoUploads`.

---

## [2026-06-14 18:30] — Bảng kê chi phí: cờ khóa sửa (in_request / order COMPLETED)

**Yêu cầu:** `api/supplier/transactions` vẫn lấy các code đã thêm trong request nhưng thêm trường báo code không thể sửa; ngoài ra code thuộc đơn COMPLETED cũng không sửa được.

**Thay đổi ở MH-api:** Không sửa code (module `supplier-transactions` proxy JSON nguyên trạng sang mhvn). Ghi log vì **contract proxy thay đổi**:
- `GET /api/supplier/transactions` nay mỗi dòng trả thêm `in_request` (bool), `order_completed` (bool), `lock_reason` (`invoice_mh|in_request|order_completed|chi_ho|null`). `editable` đã gộp các điều kiện khóa (hóa đơn MH / đã có trong request / đơn COMPLETED).

**Bối cảnh (hệ thống A — mhgs_log_be):** `mhcom/supplier_statement_views.py` đối chiếu `request_items` (PNL↔'Trucking', Chi hộ↔'Chi hộ') và `order.status`.

**Ảnh hưởng fullstack:** FE Bảng kê chi phí (`MH/src/container/CostStatementContainer`) đã khóa ô Tiền theo `editable` nên tự động không cho sửa các dòng bị khóa; có thể dùng `lock_reason` để hiển thị lý do.

---

## [2026-06-14 22:30] — Export Excel Bảng kê chi phí (proxy file nhị phân sang mhvn)

**Yêu cầu:** mhcom kết nối API export Excel bảng kê chi phí mới tạo ở mhvn.

**Các file đã thay đổi:**
- `src/modules/mhvn-integration/mhvn-integration.service.ts`: thêm `callMhvnDownload()` — GET `responseType: 'arraybuffer'`, gắn token tự động, trả `{ data: Buffer, contentType, contentDisposition }`; parse body lỗi (Buffer→JSON) để handleError đọc message.
- `src/modules/supplier-transactions/supplier-transactions.service.ts`: thêm `exportCostStatement(a_supplier_id, { from, to })` proxy `GET /api/mhcom/supplier/transactions/export/` (map from→start_date, to→end_date).
- `src/modules/supplier-transactions/supplier-cost-statement-export.controller.ts` (mới): `GET /api/supplier/cost-statement/export?from=&to=`. `JwtAuthGuard` + resolve supplier (`X-Active-Supplier-Id`); stream file qua `@Res()` với Content-Type/Content-Disposition từ mhvn.
- `src/modules/supplier-transactions/supplier-transactions.module.ts`: đăng ký controller mới.

**Ảnh hưởng fullstack:** Endpoint mới `GET /api/supplier/cost-statement/export?from=&to=` trả file `.xlsx`. FE `MH/src/services/supplier.services.ts#exportCostStatement` đã trỏ đúng (responseType blob). Cần header `X-Active-Supplier-Id` khi account đa liên kết.

---

## [2026-06-14 23:10] — Propagate đúng message lỗi từ mhvn cho mọi API proxy

**Yêu cầu:** Các API báo lỗi từ mhvn phải thông báo theo lỗi từ mhvn.

**Các file đã thay đổi:**
- `src/modules/mhvn-integration/mhvn-integration.service.ts` (`handleError`): khi mhvn trả lỗi, trích `message` thực tế theo thứ tự `data` (string) → `data.detail` (DRF) → `data.error` → `data.message`, fallback "Gọi API hệ thống mhvn thất bại". Vẫn giữ `mhvnError: data` (body gốc).

**Lý do / bối cảnh:** Trước đây chỉ đọc `data.message` (DRF thường dùng `detail`/`error`) nên FE hiển thị lỗi chung chung thay vì lỗi thật từ mhvn.

**Ảnh hưởng fullstack:** Áp dụng cho TẤT CẢ endpoint proxy qua `callMhvn`/`callMhvnMultipart`/`callMhvnDownload`. FE đọc `error.response.data.message` sẽ thấy đúng lỗi mhvn. (Riêng response dạng blob/export, body lỗi là Blob nên FE vẫn hiện message mặc định.)

---

## [2026-06-15 09:30] — Export Báo cáo kê cước & chi hộ (proxy file sang mhvn)

**Yêu cầu:** Thêm tính năng xuất Báo cáo kê cước & chi hộ ở mhcom (logic giống bao_cao_ke_cuoc_va_chi_ho của mhvn).

**Các file đã thay đổi:**
- `src/modules/supplier-transactions/supplier-transactions.service.ts`: thêm `exportKeCuocChiHo(a_supplier_id, { from, to })` proxy `GET /api/mhcom/supplier/bao-cao-ke-cuoc-chi-ho/export/` (callMhvnDownload; map from→start_date, to→end_date).
- `src/modules/supplier-transactions/supplier-cost-statement-export.controller.ts`: thêm `GET /api/supplier/cost-statement/ke-cuoc-chi-ho/export?from=&to=` — stream file `.xlsx` qua `@Res()`.

**Ảnh hưởng fullstack:** Endpoint mới `GET /api/supplier/cost-statement/ke-cuoc-chi-ho/export?from=&to=` trả `.xlsx`. FE gọi qua `exportKeCuocChiHoReport`. Cần header `X-Active-Supplier-Id` khi account đa liên kết.

## [2026-06-18 22:30] — Proxy JSON Kê cước & Chi hộ (pivot theo container) cho màn cost-statement

**Yêu cầu:** Thêm tab bảng "Kê cước & chi hộ" ở màn /supplier/cost-statement, dữ liệu pivot theo container giống file Excel; lọc thời gian theo ngày container.

**Các file đã thay đổi:**
- `src/modules/supplier-transactions/supplier-transactions.service.ts`: thêm `getKeCuocChiHo(a_supplier_id, { from, to })` — proxy `GET /api/mhcom/supplier/ke-cuoc-chi-ho/` (callMhvn, token supplier; map from→start_date, to→end_date).
- `src/modules/supplier-transactions/supplier-transactions.controller.ts`: thêm route `GET /api/supplier/transactions/ke-cuoc-chi-ho?from=&to=` — resolve active supplier rồi gọi service.

**Lý do / bối cảnh:** Endpoint /transactions hiện trả danh sách phẳng (1 cost = 1 dòng), không dựng được layout pivot nhiều cột tiền của Excel. Cần kênh JSON riêng đã pivot từ hệ thống A.

**Ảnh hưởng fullstack:** Endpoint mới `GET /api/supplier/transactions/ke-cuoc-chi-ho?from=&to=`. FE gọi qua `getSupplierKeCuocChiHo`. Cần header `X-Active-Supplier-Id` khi account đa liên kết. Backend A phải có `GET /api/mhcom/supplier/ke-cuoc-chi-ho/`.

## [2026-06-19 00:45] — Upload file chi hộ: forward order_container_id (gắn theo container)

**Yêu cầu:** File chi hộ gắn theo container thay vì theo đơn hàng.

**Các file đã thay đổi:**
- `src/modules/supplier-chiho-files/supplier-chiho-files.controller.ts`: `POST /api/supplier/chiho-files` nhận thêm `@Body('order_container_id')`, truyền xuống service.
- `src/modules/supplier-chiho-files/supplier-chiho-files.service.ts`: `uploadFiles(..., orderContainerId?)` append `order_container_id` vào multipart khi có.

**Ảnh hưởng fullstack:** Form upload nhận thêm `order_container_id` (tùy chọn) → proxy nguyên trạng sang A `POST /api/mhcom/supplier/chiho-files/`. FE màn Kê cước & chi hộ gửi field này.

## [2026-06-19 02:00] — Revert: upload Chi hộ chỉ theo order_id

**Yêu cầu:** Bỏ gắn file theo container; giữ logic upload theo đơn.

**Các file đã thay đổi:**
- `src/modules/supplier-chiho-files/supplier-chiho-files.controller.ts`: bỏ `@Body('order_container_id')`.
- `src/modules/supplier-chiho-files/supplier-chiho-files.service.ts`: `uploadFiles(...)` bỏ tham số `orderContainerId` và field multipart tương ứng.

**Ảnh hưởng fullstack:** Form upload chỉ còn `order_id` + file (như trước).

## [2026-06-19 04:10] — Hủy đề nghị thay đổi cost (DELETE proxy)

**Yêu cầu:** Màn /cost-statement (tab Đề nghị thay đổi) có nút xóa đề nghị đang PENDING — thêm xử lý.

**Các file đã thay đổi:**
- `src/modules/supplier-change-requests/supplier-change-requests.controller.ts`: thêm `DELETE /api/supplier/change-requests/:id`.
- `src/modules/supplier-change-requests/supplier-change-requests.service.ts`: `remove(a_supplier_id, id)` proxy `DELETE /api/service-change-supplier-requests/<id>/` (token supplier).

**Ảnh hưởng fullstack:** Endpoint mới `DELETE /api/supplier/change-requests/:id`. A đã có sẵn `ServiceChangeSupplierRequestAPI.destroy` (chỉ xóa khi PENDING + đúng supplier). FE gọi qua `deleteChangeRequest`.

## [2026-06-23 23:44] — (Proxy không đổi) Thêm field `chi_ho_ve` cho Kê cước & Chi hộ

**Yêu cầu:** Hiển thị cột "Chi hộ về" trên FE màn /supplier/cost-statement.

**Các file đã thay đổi:** Không có file nào ở MH-api thay đổi.

**Lý do / bối cảnh:** Endpoint `GET /api/supplier/transactions/ke-cuoc-chi-ho` chỉ là proxy sang hệ thống A (Django, `mhgs_log_be`). Field `chi_ho_ve` được hệ thống A sinh và đi xuyên proxy → FE. Ghi entry này để team backend nắm response schema mới.

**Ảnh hưởng fullstack:** Response của `GET /api/supplier/transactions/ke-cuoc-chi-ho` nay có thêm field `chi_ho_ve: string` cho mỗi item `results[]`. Quy tắc: `order.chi_ho_for === 'kh'` → "company_name - tax_number - address" của khách hàng đơn; khác → rỗng. Đã cập nhật type `KeCuocChiHoRow` ở FE.

## [2026-06-24 01:43] — Thêm endpoint xoá yêu cầu upload file Chi hộ (PENDING)

**Yêu cầu:** Trên màn `/supplier/payment-management` tab "Danh sách yêu cầu tải lên" cần xoá được các yêu cầu upload có `approval_status === 'PENDING'`.

**Các file đã thay đổi:**
- `src/modules/supplier-chiho-files/supplier-chiho-files.service.ts`: thêm method `deleteUpload(a_supplier_id, fileId)` proxy `DELETE /api/mhcom/supplier/chiho-files/<id>/` sang hệ thống mhvn.
- `src/modules/supplier-chiho-files/supplier-chiho-files.controller.ts`:
  - Thêm import `Delete`, `Param`, `ParseIntPipe`.
  - Thêm endpoint `DELETE /api/supplier/chiho-files/uploads/:id` — resolve `a_supplier_id` qua `ActiveLinkService` rồi gọi `service.deleteUpload`.

**Lý do / bối cảnh:** NCC cần khả năng huỷ một yêu cầu upload mà mình vừa tạo nhầm khi chưa được mhgs (admin/KT/GD/PT) duyệt. Hệ thống mhvn enforce ràng buộc: file phải thuộc supplier trong token và `approval_status === 'PENDING'` mới xoá được.

**Ảnh hưởng fullstack:** Endpoint mới `DELETE /api/supplier/chiho-files/uploads/:id` (trả 204). FE đã có `deleteChiHoUpload(fileId)` trong `MH/src/services/supplier.services.ts` và nút xoá ở `UploadRequestsTab.tsx`. Hệ thống A đã có view `SupplierChiHoFileDeleteAPI` với route `/api/mhcom/supplier/chiho-files/<int:file_id>/`.

## [2026-06-24 02:13] — Proxy nội dung file Chi hộ từ mhvn về mhcom

**Yêu cầu:** FE mhcom hiện không xem/tải được file đã upload vì `file_url` trả về là path `/media/...` của hệ thống A (Django) — FE không truy cập được trực tiếp.

**Các file đã thay đổi:**
- `src/modules/supplier-chiho-files/supplier-chiho-files.service.ts`: thêm `downloadUpload(a_supplier_id, fileId, disposition)` dùng `MhvnIntegrationService.callMhvnDownload` để lấy buffer + content-type + content-disposition từ A.
- `src/modules/supplier-chiho-files/supplier-chiho-files.controller.ts`:
  - Thêm import `Get`, `Param`, `ParseIntPipe`, `Res`, `Query`, `Response` (express).
  - Thêm endpoint `GET /api/supplier/chiho-files/uploads/:id/download?disposition=inline|attachment`. Resolve supplier qua `ActiveLinkService`, gọi service download, trả binary kèm headers nhận được từ A; `disposition` được sanitize ('inline'/'attachment' only, mặc định 'inline').

**Lý do / bối cảnh:** Theo nguyên tắc kiến trúc (TOKEN-CONNECTION-A-B.md mục 4): FE B KHÔNG gọi thẳng A. Phải proxy file qua BE B; ngoài ra FE cũng không gắn được supplier token vào tab mới/<a download> nên buộc phải stream qua axios.

**Ảnh hưởng fullstack:** Endpoint mới `GET /api/supplier/chiho-files/uploads/:id/download` trả binary (Content-Type + Content-Disposition lấy từ A). FE đã có hàm `downloadChiHoUpload(fileId, disposition)` trả Blob và đã dùng ở tab "Danh sách yêu cầu tải lên" cùng panel upload (`FileUploadPanel`). Phụ thuộc endpoint mới ở A: `GET /api/mhcom/supplier/chiho-files/<id>/download/`.

## [2026-06-24 02:38] — Revert proxy download file Chi hộ (dùng URL trực tiếp)

**Yêu cầu:** Đơn giản hoá — `/media/` ở mhvn không cần auth, FE chỉ cần prepend host của mhvn vào `file_url` là mở/tải được, không cần proxy qua MH-api.

**Các file đã thay đổi:**
- `src/modules/supplier-chiho-files/supplier-chiho-files.service.ts`: bỏ method `downloadUpload`.
- `src/modules/supplier-chiho-files/supplier-chiho-files.controller.ts`: bỏ import `Res`, `Response`; bỏ endpoint `GET uploads/:id/download`.

**Lý do / bối cảnh:** Hệ thống mhvn (A) phục vụ `/media/...` public; FE mhcom có thể truy cập thẳng URL đầy đủ. Proxy qua MH-api là dư thừa khi không cần auth.

**Ảnh hưởng fullstack:** Bỏ endpoint `GET /api/supplier/chiho-files/uploads/:id/download` — không endpoint nào ngoài đời đang phụ thuộc (mới thêm trong cùng session).

## [2026-06-26 03:24] — Module mới: supplier-quality-reports

**Yêu cầu:** Thêm proxy cho tính năng Báo cáo chất lượng NCC ↔ MHVN/GP (xem `QUALITY_REPORTS_FEATURE.md` ở project root).

**Các file đã thay đổi:**
- `src/modules/supplier-quality-reports/supplier-quality-reports.module.ts` (mới): module wrapper, import `MhvnIntegrationModule` + `ActiveTargetModule`.
- `src/modules/supplier-quality-reports/supplier-quality-reports.service.ts` (mới): proxy 6 endpoint sang Django `/api/mhcom/supplier/quality-reports/*` qua `MhvnIntegrationService.callMhvn` (token supplier theo `ActiveAContext`).
- `src/modules/supplier-quality-reports/supplier-quality-reports.controller.ts` (mới): `GET/POST /api/supplier/quality-reports`, `GET/PATCH/DELETE /api/supplier/quality-reports/:id`, `POST /api/supplier/quality-reports/:id/status`, `GET /api/supplier/quality-reports/options`. Bảo vệ bằng `JwtAuthGuard` + `ActiveTargetGuard`, header `X-A-Target` bắt buộc.
- `src/app.module.ts` (line ~59 + ~115): import và thêm `SupplierQualityReportsModule` vào `imports`.

**Lý do / bối cảnh:** Pattern y hệt `supplier-chiho-files` — mhcom backend đứng giữa, mint JWT supplier RS256, route sang đúng base URL (mhvn hoặc gp).

**Ảnh hưởng fullstack:**
- Endpoint mới cho frontend `MH/src/services/supplier.services.ts` (đã thêm functions tương ứng).
- Bắt buộc Django (mhgs_log_be) đã chạy migration `notifications/0002_qualityreport.py` và có view `mhcom/supplier_quality_report_views.py` (cả hai mới tạo cùng phiên này).
