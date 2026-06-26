# Change Log — MH Project

> File này được ghi tự động bởi các agent (frontend, backend, qa) sau mỗi thay đổi code.
> Không xóa hay sửa các entry cũ.

## Format

```
## [YYYY-MM-DD HH:MM] — <tiêu đề>

**Yêu cầu:** ...
**Agent thực hiện:** design | frontend | backend | qa | orchestrator
**Các file đã thay đổi:**
- `path/file.ts` (dòng X–Y): mô tả
**Lý do / bối cảnh:** ...
**Ảnh hưởng fullstack:** (nếu có)
```

---

## [2026-06-25 16:00] — Phase 1 (backend) Multi-target A integration (mhvn + gp) + runtime switch

**Yêu cầu:** Mở rộng mhcom để 1 account có thể đồng thời liên kết hệ mhvn và gp, switch runtime qua header `X-A-Target` không cần re-login. Account giữ cố định một loại (`supplier` HOẶC `customer`) nhưng có thể có nhiều entity per target qua claim mảng (`supplier_ids[]` / `customer_ids[]`). Không đổi spec phía A; backward compat key đơn lẻ.

**Agent thực hiện:** backend

**Các file đã thay đổi:**

Migration & entity:
- `MH-api/src/configs/database/migrations/1772000000000-AddATargetAndAccountType.ts` (mới): thêm `users.account_type` ENUM `'supplier'|'customer'` nullable; thêm `user_a_links.a_target` ENUM `'mhvn'|'gp'` NOT NULL DEFAULT `'mhvn'` (backfill row cũ); DROP unique `UQ_user_a_links_user_entity`, CREATE unique `UQ_user_a_links_user_target_entity (user_id, a_target, link_type, a_entity_id)`; CREATE index `IDX_user_a_links_user_target (user_id, a_target)`. Có `down()` revert đầy đủ.
- `MH-api/src/modules/users/entities/user-a-link.entity.ts`: thêm enum `EATarget` (`MHVN|GP`) + column `aTarget`; cập nhật decorator `@Unique`/`@Index` khớp schema mới.
- `MH-api/src/modules/users/user.entity.ts`: thêm column `accountType` (enum `EALinkType`, nullable).

Guard / decorator:
- `MH-api/src/common/guards/active-target.guard.ts` (mới): `ActiveTargetGuard` đọc header `X-A-Target`, tra `user_a_links` lấy entity ids ở target đó, đọc `users.account_type`, gắn `req.activeContext = {target, accountType, entityIds}`. 400 khi thiếu/sai header, 409 khi chưa liên kết target.
- `MH-api/src/common/guards/active-target.module.ts` (mới): export guard.
- `MH-api/src/common/decorators/active-context.decorator.ts` (mới): `@GetActiveContext()` trích `req.activeContext`.

Auth & integration core:
- `MH-api/src/modules/auth/mhcom-jwt.service.ts`: viết lại — load private key per target (`MHCOM_PRIVATE_KEY_PATH_MHVN/_GP`, fallback `MHCOM_PRIVATE_KEY_PATH`). Method signatures: `issueSupplierToken(ids[], target)`, `issueCustomerToken(ids[], target)`, `issueServiceToken(target)`. Claim format: `{iss:'mhcom', aud:'mhvn', type, sub: ids[0], supplier_ids|customer_ids: [...], exp}`. `aud` luôn `'mhvn'` (A không phân biệt target). Service token cache thành `Map<EATarget, {token,exp}>`.
- `MH-api/src/modules/mhvn-integration/mhvn-integration.service.ts`: viết lại — `baseUrlByTarget` từ `MHVN_API_BASE_URL_MHVN/_GP`, throw startup error nếu thiếu (fallback `MHVN_API_BASE_URL` chỉ cho dev một-target). `CallMhvnOptions` đổi từ `a_supplier_id?/a_customer_id?` sang `activeContext?: ActiveAContext` + `target?: EATarget` (cho service token). Mint token & chọn baseUrl theo target. Áp dụng cho cả 3 method: `callMhvn`, `callMhvnMultipart`, `callMhvnDownload`.

Proxy controllers/services (tất cả route áp `@UseGuards(JwtAuthGuard, ActiveTargetGuard)` + nhận `ActiveAContext` qua `@GetActiveContext()`, xóa header `X-Active-Supplier-Id`/`X-Active-Customer-Id`):
- `MH-api/src/modules/supplier-change-requests/{controller,service,module}.ts`
- `MH-api/src/modules/supplier-chiho-files/{controller,service,module}.ts`
- `MH-api/src/modules/supplier-order-search/{controller,service,module}.ts`
- `MH-api/src/modules/supplier-prices/{controller,service,module}.ts`
- `MH-api/src/modules/supplier-transactions/{supplier-transactions.controller,supplier-transactions.service,supplier-cost-statement-export.controller,supplier-transactions.module}.ts`
- `MH-api/src/modules/bangke/{controller,service,module}.ts`
- `MH-api/src/modules/services-catalog/{controller,service,module}.ts`: service token, nhận `target` từ `ActiveTargetGuard` (FE phải gửi `X-A-Target`).
- `MH-api/src/modules/mhvn-directory/{controller,service}.ts`: admin endpoint — chọn target qua query `?target=mhvn|gp` (không dùng `ActiveTargetGuard` vì admin thường không có `user_a_links`).

Account-links & target endpoint:
- `MH-api/src/common/services/active-link.service.ts`: bỏ resolver runtime; còn helper internal `listLinksByTarget(user)` (gộp theo target), `getLinksForUser(userId)`, `setLinksForUser(userId, linkType, targets[])`. CRUD admin sync luôn `users.account_type`.
- `MH-api/src/modules/account-links/account-links.controller.ts`: đổi route từ `GET /api/account/a-links` → `GET /api/account/a-targets` trả `{account_type, targets:[{a_target, entity_ids[]}]}`.
- `MH-api/src/modules/account-links/admin-account-links.controller.ts`: body mới `{linkType, targets:[{a_target, ids[]}]}` (đa target).
- `MH-api/src/modules/account-links/dto/set-account-links.dto.ts`: thêm `SetAccountLinkTargetDto` + cập nhật `SetAccountLinksDto.targets[]`.

Env & config:
- `MH-api/src/configs/configs.constants.ts`: thêm `mhcomIntegrationConfig` với các key per-target + ghi chú backward compat.
- `MH-api/.env`: cập nhật comment hướng dẫn các key mới `MHCOM_PRIVATE_KEY_PATH_MHVN/_GP`, `MHVN_API_BASE_URL_MHVN/_GP`; giữ `MHCOM_PRIVATE_KEY_PATH` đơn lẻ làm fallback shared.

**Lý do / bối cảnh:** Bước đầu của feature đa hệ A — cho phép 1 account NCC (hoặc KH) thao tác với cả mhvn lẫn gp trên cùng UI mhcom, switch ở runtime. Backend phải route token + baseUrl theo target nhưng vẫn giữ token spec `iss=mhcom/aud=mhvn` để không đụng code A. Thiết kế guard chuẩn hóa giúp tất cả route proxy đọc cùng một `ActiveAContext` thay vì rải logic resolver/header khắp nơi.

**Ảnh hưởng fullstack:**
- BREAKING (FE): toàn bộ route proxy supplier/customer (supplier-change-requests, supplier-chiho-files, supplier-order-search, supplier-prices, supplier-transactions, supplier-cost-statement, bangke, services-catalog) PHẢI gửi header `X-A-Target: mhvn|gp` thay cho `X-Active-Supplier-Id`/`X-Active-Customer-Id` (header cũ không còn được đọc). Thiếu/sai → 400. Chưa liên kết target → 409.
- BREAKING (FE): route `GET /api/account/a-links` đổi thành `GET /api/account/a-targets`; response shape mới `{account_type, targets:[{a_target, entity_ids[]}]}`. FE phải cập nhật switcher target + entity.
- BREAKING (FE): `PUT /api/admin/account-links/:userId` body đổi từ `{linkType, ids[]}` sang `{linkType, targets:[{a_target, ids[]}]}`. Tab "Kết nối hệ A" trong màn quản trị khách hàng phải cập nhật.
- Admin endpoint `/api/directory/suppliers|customers` thêm query bắt buộc `?target=mhvn|gp`.
- Cần cập nhật env runtime: set `MHCOM_PRIVATE_KEY_PATH_GP` + `MHVN_API_BASE_URL_MHVN` + `MHVN_API_BASE_URL_GP` (hoặc giữ `MHCOM_PRIVATE_KEY_PATH` + `MHVN_API_BASE_URL` cho dev một-target).

---

## [2026-06-07 00:04] — Nút Xuất Excel gọi API backend

**Yêu cầu:** Thêm nút xuất dữ liệu ra Excel, nút này request API chứ không lấy trực tiếp từ bảng.
**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/services/supplier.services.ts` (mới): service `exportCostStatement(params)` gọi `GET /supplier/cost-statement/export` với query params (from, to, billCode, customer, route), `responseType: 'blob'`, trả về `Promise<Blob>`. Kèm comment TODO cho backend.
- `MH/src/container/CostStatementContainer/index.tsx`: import service + `format` từ date-fns + icon `FileSpreadsheetIcon`, `Loader2Icon`; thêm state `isExporting`; thêm hàm `handleExport` — build params từ filter hiện tại → gọi service → tạo anchor download blob → trigger download → cleanup URL; thêm nút "Xuất Excel" ở góc phải filter bar, hiển thị spinner + text "Đang xuất..." khi đang gọi API, disabled khi `isExporting=true`.

**Lý do / bối cảnh:** Export phải do server tạo file (có thể cần join nhiều bảng, định dạng đặc biệt) chứ không nên serialize từ data đã load trên client.

**Ảnh hưởng fullstack:** Backend cần implement `GET /supplier/cost-statement/export` — nhận query params `from`, `to`, `billCode`, `customer`, `route`; trả về file `.xlsx` với header `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

## [2026-06-07 00:03] — Dirty cell tracking + nút Hoàn tác / Xác nhận

**Yêu cầu:** Đánh dấu các ô đã chỉnh sửa, đếm số thay đổi, thêm nút Hoàn tác và Xác nhận. Trạng thái dirty reset khi gọi API (hiện stub).
**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/CostStatementContainer/index.tsx`: thêm `dirtyMap` state + `originalDataRef`; cập nhật `handleUpdate` để mark dirty; thêm prop `isDirty` vào `EditableTextCell` và `EditableNumericCell` (highlight amber); cập nhật `buildColumns` nhận `dirtyMap`; thêm action bar amber với nút Hoàn tác (revert) + Xác nhận (stub API); badge đếm thay đổi trên page header; row dirty tô nền amber nhạt.

**Lý do / bối cảnh:** UX cần phân biệt data đã sửa vs chưa sửa trước khi gửi lên server. Dirty state sẽ tự clear sau khi API trả về thành công.

---

## [2026-06-07 00:00] — Khởi tạo harness phát triển fullstack

**Yêu cầu:** Xây dựng harness fullstack với pipeline từ wireframe đến deployment.
**Agent thực hiện:** orchestrator

**Các file đã tạo:**
- `CLAUDE.md` (root): tổng quan dự án + pipeline overview
- `.claude/agents/orchestrator.md`: agent điều phối pipeline
- `.claude/agents/design.md`: agent thiết kế wireframe và UI spec
- `.claude/agents/frontend.md`: agent implement Next.js/React
- `.claude/agents/backend.md`: agent implement NestJS API
- `.claude/agents/qa.md`: agent viết và chạy tests
- `.claude/change-log.md`: file này
- `.claude/specs/` (thư mục): chứa spec của từng tính năng

**Lý do / bối cảnh:** Thiết lập harness chuẩn để team phát triển fullstack theo pipeline có tổ chức từ wireframe → design spec → backend API → frontend impl → QA test → deploy.

## [2026-06-08 10:30] — Màn quản lý chi hộ: danh sách đơn + upload chứng từ (UI)

**Yêu cầu:** Tại màn quản lý chi hộ hiển thị bảng danh sách đơn hàng, có search trên header, filter theo thời gian; khi bấm vào đơn hàng mở view upload file (pdf/excel/image, có thể upload cả thư mục rồi tách từng file) và hiển thị các file đã upload (tải xuống được). Chỉ làm phía UI, chưa nối backend.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/PaymentManagementContainer/index.tsx`: thay placeholder bằng bảng danh sách đơn chi hộ, ô tìm kiếm trên header (mã đơn/khách hàng/tuyến/ghi chú), filter khoảng thời gian (DateRangePicker), click dòng để mở panel upload; quản lý state file theo từng đơn.
- `MH/src/container/PaymentManagementContainer/FileUploadPanel.tsx` (mới): slide-over panel — dropzone kéo thả, chọn file & chọn thư mục (webkitdirectory), lọc theo định dạng pdf/excel/image, tách & xử lý từng file, danh sách file đã upload kèm nút tải xuống và xóa.
- `MH/src/container/PaymentManagementContainer/types.ts` (mới): type `PaymentOrder`, `UploadedFile`, `PaymentStatus`, `UploadedFileType`.
- `MH/src/container/PaymentManagementContainer/fakeData.ts` (mới): dữ liệu giả `FAKE_PAYMENT_ORDERS` + `FAKE_UPLOADED_FILES`.

**Lý do / bối cảnh:** Dựng UI quản lý chi hộ theo pattern của CostStatementContainer (shadcn/Tailwind + lucide), dùng dữ liệu giả để demo trước khi có API.

**Ảnh hưởng fullstack:** Chưa nối backend. Khi triển khai API cần các endpoint: GET danh sách đơn chi hộ (search + filter ngày), GET danh sách file theo đơn, POST upload file (multipart, hỗ trợ nhiều file/thư mục), GET tải file. Các điểm cần thay TODO nằm ở xử lý `processFiles`/`handleDownload` trong FileUploadPanel và nguồn data trong index.tsx.

## [2026-06-08 10:45] — Chi hộ: bỏ xóa file, xác nhận search local

**Yêu cầu:** File đã tải lên không được phép xóa; phần search ở header là lọc local dữ liệu bảng.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/PaymentManagementContainer/FileUploadPanel.tsx`: bỏ nút xóa và hàm `handleRemove`, bỏ import `Trash2Icon`. File trong danh sách chỉ còn thao tác tải xuống.
- `MH/src/container/PaymentManagementContainer/index.tsx`: search ở header đã là lọc local trên dữ liệu bảng (mã đơn/khách hàng/tuyến/ghi chú) — giữ nguyên, không đổi.

**Lý do / bối cảnh:** Theo yêu cầu mới, chứng từ đã tải lên cần được giữ lại, không cho xóa khỏi UI.

## [2026-06-08 11:15] — Bảng kê chi phí: view con Danh sách đề nghị thay đổi

**Yêu cầu:** Mỗi lần xác nhận thay đổi bảng kê chi phí sẽ tạo 1 đề nghị thay đổi gửi sang hệ thống khác. Thêm màn danh sách đề nghị thay đổi là view con của bảng kê: bảng các đề nghị đã gửi sắp theo thời gian gửi, tìm kiếm theo thời gian gửi và mã đề nghị; mỗi dòng gồm mã đề nghị, thời gian gửi, trạng thái; child-row hiển thị chi tiết các thông tin đã đề nghị thay đổi.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/CostStatementContainer/types.ts`: thêm type `ChangeRequest`, `ChangeRequestItem`, `ChangeRequestStatus` và map `FIELD_LABELS`.
- `MH/src/container/CostStatementContainer/changeRequestData.ts` (mới): dữ liệu giả `FAKE_CHANGE_REQUESTS`.
- `MH/src/container/CostStatementContainer/ChangeRequestList.tsx` (mới): bảng đề nghị có expandable child-row chi tiết (mã bill, trường, giá trị cũ → mới), filter theo thời gian gửi + mã đề nghị, sắp xếp mới nhất trước.
- `MH/src/container/CostStatementContainer/index.tsx`: thêm tab bar 2 view (Bảng kê / Đề nghị thay đổi); `handleConfirm` nay tạo một `ChangeRequest` từ các ô đã sửa rồi chuyển sang view danh sách đề nghị; thêm helper `formatFieldValue`.

**Lý do / bối cảnh:** Quy trình mới: thay đổi bảng kê không sửa trực tiếp mà sinh đề nghị gửi sang hệ thống duyệt khác; cần nơi theo dõi các đề nghị đã gửi và chi tiết từng thay đổi.

**Ảnh hưởng fullstack:** Chưa nối backend. Khi có API cần: POST gửi đề nghị thay đổi (payload gồm danh sách item rowId/field/oldValue/newValue), GET danh sách đề nghị (filter theo thời gian gửi + mã đề nghị). Điểm thay TODO nằm ở `handleConfirm` (index.tsx) và nguồn data trong ChangeRequestList.

## [2026-06-08 11:30] — Đề nghị thay đổi: hủy đề nghị đang chờ duyệt

**Yêu cầu:** Đề nghị đang "Chờ duyệt" có nút xóa để hủy yêu cầu duyệt; đề nghị "Đã duyệt"/"Từ chối" không hiển thị nút xóa.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/CostStatementContainer/ChangeRequestList.tsx`: thêm prop `onCancel`, cột hành động với nút xóa chỉ hiện khi `status === 'Chờ duyệt'` (kèm xác nhận window.confirm, stopPropagation để không mở child-row); cập nhật colSpan tương ứng.
- `MH/src/container/CostStatementContainer/index.tsx`: thêm `handleCancelRequest` lọc bỏ đề nghị "Chờ duyệt" khỏi state và truyền xuống ChangeRequestList.

**Lý do / bối cảnh:** Cho phép người dùng rút lại đề nghị chưa được hệ thống duyệt xử lý; đề nghị đã có kết quả (duyệt/từ chối) thì không cho hủy.

**Ảnh hưởng fullstack:** Chưa nối backend. Khi có API cần: DELETE/POST hủy đề nghị thay đổi theo id (chỉ cho phép khi trạng thái Chờ duyệt) — điểm TODO ở `handleCancelRequest`.

## [2026-06-08 11:50] — Responsive + scroll ngang cho các bảng nhiều cột

**Yêu cầu:** Bảng nhiều cột phải scroll ngang được (không bị fix trong khung view); header/filter/tab responsive cho mobile — mobile không cần hiển thị hết dữ liệu nhưng phải rõ chức năng.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/PaymentManagementContainer/index.tsx`: header xuống dòng trên mobile (icon+title / search full-width / tổng tiền wrap); filter & vùng bảng dùng `px-4 sm:px-6`; bảng `w-full min-w-max` trong `overflow-auto` để scroll ngang; DateRangePicker `w-full sm:w-60`.
- `MH/src/container/PaymentManagementContainer/FileUploadPanel.tsx`: nhóm nút Chọn file/Chọn thư mục `flex-wrap justify-center` cho màn hẹp.
- `MH/src/container/CostStatementContainer/index.tsx`: header wrap, totals xuống dòng trên mobile; tab bar `overflow-x-auto`, nút tab `shrink-0 whitespace-nowrap`; filter bar/dirty bar/bảng dùng `px-4 sm:px-6`; bảng `w-full min-w-max`; export không ép sang phải trên mobile; DateRangePicker `w-full sm:w-60`.
- `MH/src/container/CostStatementContainer/ChangeRequestList.tsx`: filter bar `px-4 sm:px-6`, input/date `w-full sm:w-*`; bảng `w-full min-w-max` để scroll ngang.

**Lý do / bối cảnh:** Bảo đảm trải nghiệm trên màn hình nhỏ: bảng cuộn ngang gọn trong vùng nội dung thay vì tràn/khóa cứng, các thanh điều khiển tự xuống dòng và vẫn thao tác được.

## [2026-06-08 12:10] — Mobile: layout card thay bảng, đủ thông tin chính + đủ chức năng

**Yêu cầu:** Tạo UI responsive cho mobile — hiển thị các thông tin chính nhưng vẫn đủ tính năng. (Lưu ý: skill `responsive-web-design` không có trong môi trường nên tự triển khai.)

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/PaymentManagementContainer/index.tsx`: thêm card-view `sm:hidden` (mã đơn, trạng thái, khách hàng, tuyến, ngày, số tiền, số chứng từ, ghi chú) — bấm card mở panel upload; bảng chuyển `hidden sm:block`.
- `MH/src/container/CostStatementContainer/index.tsx`: thêm component `CostCard` (dùng lại EditableTextCell/EditableNumericCell nên vẫn chỉnh sửa inline trên mobile, có highlight dirty); card-view `sm:hidden` kèm khối tóm tắt tổng; bảng chuyển `hidden sm:block`.
- `MH/src/container/CostStatementContainer/ChangeRequestList.tsx`: thêm card-view `sm:hidden` (mã đề nghị, trạng thái, thời gian gửi, số trường; nút Xem chi tiết mở danh sách thay đổi cũ→mới; nút Hủy đề nghị khi Chờ duyệt); bảng chuyển `hidden sm:block`.

**Lý do / bối cảnh:** Trên mobile bảng nhiều cột khó dùng dù đã scroll ngang; chuyển sang card hiển thị thông tin trọng yếu, giữ đầy đủ thao tác (chỉnh sửa, mở chi tiết, upload, hủy đề nghị). Desktop vẫn dùng bảng như cũ.

## [2026-06-08 12:40] — Sửa lỗi responsive: breakpoint + sidebar che nội dung

**Yêu cầu:** Desktop đang hiển thị như mobile; view mobile bị che hết, không thấy nội dung.

**Agent thực hiện:** frontend

**Nguyên nhân:**
1. `tailwind.config.js` dùng breakpoint dạng range: `sm = 640–1024px (tablet)`, `md = ≥1025px (PC)`. Các class `sm:` chỉ áp dụng cho tablet nên trên desktop (md) mất hết override → quay về layout mobile.
2. `SupplierSidebar` là `w-60` cố định, luôn hiển thị → trên mobile chiếm/che hết vùng nội dung.

**Các file đã thay đổi:**
- `MH/src/container/CostStatementContainer/index.tsx`, `ChangeRequestList.tsx`, `MH/src/container/PaymentManagementContainer/index.tsx`: đổi toàn bộ tiền tố `sm:` → `md:` để layout desktop áp dụng đúng từ PC (≥1025px); mobile + tablet dùng card, PC dùng bảng.
- `MH/src/layout/SupplierLayout.tsx`: thêm state `open`, top bar `md:hidden` với nút hamburger (MenuIcon) để mở menu; bọc nội dung trong cột `min-w-0` tránh tràn.
- `MH/src/container/SupplierSidebar/index.tsx`: nhận props `open/onClose`; chuyển thành drawer trượt (`fixed -translate-x-full`, mở `translate-x-0`) trên mobile/tablet, `md:static md:translate-x-0` trên PC; thêm backdrop; click menu tự đóng drawer.

**Lý do / bối cảnh:** Khắc phục đúng cơ chế breakpoint range của dự án và làm sidebar responsive để mobile thấy được nội dung, vẫn truy cập được điều hướng qua nút menu.

## [2026-06-08 13:10] — Màn mới: Chi phí vận chuyển theo tuyến + upload giá + tải template

**Yêu cầu:** Thêm màn hiển thị danh sách chi phí vận chuyển theo tuyến đường đã tạo; có modal upload giá mới và nút tải template Excel để điền giá.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/routes/routes.tsx`: thêm `SUPPLIER_SHIPPING_RATE = '/supplier/shipping-rate'`.
- `MH/src/services/supplier.services.ts`: thêm stub `downloadShippingRateTemplate()` (GET /supplier/shipping-rate/template) và `uploadShippingRates(file)` (POST /supplier/shipping-rate/import, multipart).
- `MH/src/container/ShippingRateContainer/types.ts` (mới): type `ShippingRate`, `RateStatus`.
- `MH/src/container/ShippingRateContainer/fakeData.ts` (mới): `FAKE_SHIPPING_RATES`.
- `MH/src/container/ShippingRateContainer/UploadRateModal.tsx` (mới): modal upload giá (dropzone + chọn file .xls/.xlsx/.csv) + nút "Tải template" sinh CSV client-side (có BOM, mở bằng Excel).
- `MH/src/container/ShippingRateContainer/index.tsx` (mới): danh sách responsive (bảng PC / card mobile theo `md:`), search local + filter ngày áp dụng, nút "Upload giá mới" mở modal.
- `MH/src/pages/supplier/shipping-rate.tsx` (mới): page dùng SupplierLayout.
- `MH/src/container/SupplierSidebar/index.tsx`: thêm mục menu "Chi phí vận chuyển" (RouteIcon) trỏ tới SUPPLIER_SHIPPING_RATE.

**Lý do / bối cảnh:** Cung cấp nơi quản lý đơn giá vận chuyển theo tuyến; cho phép cập nhật hàng loạt bằng file Excel theo template chuẩn.

**Ảnh hưởng fullstack:** Chưa nối backend. Khi có API: GET template Excel, POST import file giá; điểm TODO ở `handleSubmit` (UploadRateModal) và `handleUploaded` (index). Hiện template được sinh phía client dạng CSV; backend có thể thay bằng .xlsx thật.

## [2026-06-08 13:45] — Tích hợp API hệ thống A: transactions (bảng kê) + chi hộ files

**Yêu cầu:** Dựa vào docs API từ hệ thống A, tạo request trên hệ thống B cho transactions (màn Bảng kê chi phí) và chi hộ (màn Quản lý chi hộ).

**Agent thực hiện:** backend + frontend

**Backend (MH-api):**
- Thêm `callSystemAMultipart()` vào `system-a-integration.service.ts` (forward upload file kèm token).
- Module mới `supplier-transactions`: `GET /api/supplier/transactions` proxy A.
- Module mới `supplier-chiho-files`: `GET/POST /api/supplier/chiho-files` proxy A (liệt kê + upload multipart).
- Đăng ký module trong `app.module.ts`; khai báo `form-data` trong package.json; cập nhật MH-api/CLAUDE.md.

**Frontend (MH):**
- `MH/src/services/supplier.services.ts`: thêm `getSupplierTransactions()`, `listChiHoFiles()`, `uploadChiHoFiles()` + types (PnlTransaction/ChiHoTransaction/ChiHoFile...) gọi tới endpoint hệ thống B.

**Lý do / bối cảnh:** Tuân thủ SPEC-ket-noi-A-B: FE→BE B→A, token RS256 supplier do B ký. Tham chiếu docs: `api/system-b-supplier-transactions.md`, `api/system-b-supplier-chiho-files.md`.

**Ảnh hưởng fullstack:** Contract endpoint B đã thống nhất giữa MH-api và MH services (xem MH-api/.claude/change-log.md). Bước tiếp theo (chưa làm): thay fake data ở CostStatementContainer/PaymentManagementContainer bằng các service mới.

## [2026-06-08 14:00] — Gắn API thật vào màn Bảng kê chi phí và Quản lý chi hộ

**Yêu cầu:** Gắn các API đã được tạo trong `api/` vào màn hình tương ứng (CostStatement + PaymentManagement).

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/CostStatementContainer/index.tsx` (dòng 12, 37–51, 76–104, ~560–620, ~700–710, ~880–888): thay FAKE_COST_DATA bằng `getSupplierTransactions()` (useQuery), thêm `mapTransactionToRow` chuyển đổi API response → CostStatementRow, xoá dateFiltered client-side, thêm `handleApplyFilters` gọi API với params, xoá imports `FAKE_COST_DATA`, `isWithinInterval`, `parseISO`.
- `MH/src/services/supplier.services.ts` (dòng 97, 117): thêm `order_id: number | null` vào `PnlTransaction` và `ChiHoTransaction`.
- `MH/src/container/PaymentManagementContainer/types.ts` (dòng 10): thêm `aOrderId?: number` vào `PaymentOrder`.
- `MH/src/container/PaymentManagementContainer/index.tsx` (dòng 21–29, 34–63, 83–119): thay FAKE_PAYMENT_ORDERS + FAKE_UPLOADED_FILES bằng `getSupplierTransactions()` (filter chi_ho), thêm `mapChiHoToOrder`, thêm `mapChiHoFileToUploaded`, useEffect gọi `listChiHoFiles` khi chọn đơn.
- `MH/src/container/PaymentManagementContainer/FileUploadPanel.tsx` (dòng 20–21, 96–132): thêm imports `uploadChiHoFiles`/`ChiHoFile`, thêm `mapChiHoFileToUploaded`, thay processFiles bằng `uploadChiHoFiles` API call.

**Lý do / bối cảnh:** Bước cuối cùng của tích hợp API hệ thống A: thay dữ liệu giả bằng dữ liệu thật từ API qua proxy system B. CostStatement gọi `GET /api/supplier/transactions`, PaymentManagement gọi `GET /api/supplier/transactions` (lọc chi_ho) + `GET /api/supplier/chiho-files` + `POST /api/supplier/chiho-files`.

**Ảnh hưởng fullstack:** CostStatementContainer giờ phụ thuộc vào endpoint `GET /api/supplier/transactions` (proxy A); PaymentManagementContainer phụ thuộc vào `GET /api/supplier/transactions`, `GET /api/supplier/chiho-files`, `POST /api/supplier/chiho-files`. Tất cả đều cần JWT + `a_supplier_id` hợp lệ. Container không còn dùng fake data nữa.

## [2026-06-08 14:30] — Wrap API requests trong React Query

**Yêu cầu:** Bọc các API request vừa code trong ReactQuery.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/PaymentManagementContainer/index.tsx` (dòng 101–125): thay `useEffect` gọi `listChiHoFiles` bằng `useQuery` với `enabled` khi có `selectedOrder?.aOrderId`; `handleFilesChange` gọi `filesQuery.refetch()` sau upload.
- `MH/src/container/PaymentManagementContainer/FileUploadPanel.tsx` (dòng 14, 126–165): thêm `useMutation` từ react-query; `processFiles` dùng `uploadMutation.mutateAsync` thay vì gọi trực tiếp `uploadChiHoFiles`.

**Lý do / bối cảnh:** Chuẩn hoá toàn bộ API calls qua React Query để hưởng lợi từ caching, loading state, refetch, và error handling thống nhất.

**Ảnh hưởng fullstack:** Không thay đổi contract API.

## [2026-06-08 16:00] — Tích hợp API đề nghị thay đổi cost (ServiceChangeSupplierRequest)

**Yêu cầu:** Dựa vào API-service-change-supplier-request.md, tích hợp các API liên quan đến đề nghị thay đổi cost PNL từ hệ thống A qua proxy B.

**Agent thực hiện:** backend + frontend

**Backend (MH-api):**
- `src/modules/supplier-change-requests/dto/create-change-request.dto.ts` (mới): DTO với validation `pnl`, `order`, `requested_cost` (required) + `reason` (optional).
- `src/modules/supplier-change-requests/supplier-change-requests.module.ts` (mới): module import SystemAIntegrationModule.
- `src/modules/supplier-change-requests/supplier-change-requests.controller.ts` (mới): 3 endpoint — `GET /api/supplier/change-requests` (danh sách), `GET /api/supplier/change-requests/:id` (chi tiết), `POST /api/supplier/change-requests` (tạo). Tất cả đều kiểm tra `a_supplier_id`, proxy qua SystemAIntegrationService.
- `src/modules/supplier-change-requests/supplier-change-requests.service.ts` (mới): proxy `GET /api/service-change-supplier-requests/`, `GET /api/service-change-supplier-requests/<id>/`, `POST /api/service-change-supplier-requests/` trên hệ thống A.
- `src/app.module.ts` (dòng 53, 106): import + đăng ký `SupplierChangeRequestsModule`.

**Frontend (MH):**
- `src/services/supplier.services.ts` (dòng 198–259): thêm types `CreateChangeRequestPayload`, `ChangeRequestResponse` + 3 methods `getChangeRequests()`, `createChangeRequest()`, `getChangeRequestDetail()`.
- `src/container/CostStatementContainer/types.ts` (dòng 3–16): thêm `pnlId`, `orderId`, `transactionType` vào `CostStatementRow`; cập nhật `EditableField` exclude list. Thêm `API_STATUS_TO_VN` mapper + function `mapApiResponseToChangeRequest()`.
- `src/container/CostStatementContainer/index.tsx` (dòng 38–55): xoá import `FAKE_CHANGE_REQUESTS`/`ChangeRequestItem`; thêm import `getChangeRequests`, `createChangeRequest`, `useMutation`, `useQueryClient`, `mapApiResponseToChangeRequest`. (dòng 78–103): thêm mapping `pnlId`, `orderId`, `transactionType` trong `mapTransactionToRow`. (dòng 609–630): thay `changeRequests` state bằng React Query `useQuery` + `useMemo` mapping từ API. (dòng 666–710): `handleConfirm` gọi `createMutation.mutateAsync` cho mỗi row dirty có `freightCost` (PNL type), dùng `window.prompt` lấy lý do. (dòng 713): `handleCancelRequest` dùng `queryClient.invalidateQueries` (chưa có cancel API).

**Lý do / bối cảnh:** Tích hợp API hệ thống A cho chức năng đề nghị thay đổi cost (ServiceChangeSupplierRequest). FE thay dữ liệu giả (FAKE_CHANGE_REQUESTS) bằng API thật qua proxy B. Mỗi thay đổi cước phí trên một PNL row → 1 POST API call.

**Ảnh hưởng fullstack:**
- Frontend: `CostStatementContainer` giờ phụ thuộc vào `GET /api/supplier/change-requests` và `POST /api/supplier/change-requests`. Container không còn dùng fake data cho change requests nữa.
- Backend: Module mới `supplier-change-requests` với 3 endpoint proxy sang A. Cần `SYSTEM_A_API_BASE_URL` cấu hình đúng và hệ thống A hỗ trợ các endpoint tương ứng.
- API contract: `POST /api/supplier/change-requests` body `{pnl, order, requested_cost, reason?}`. Response theo schema trong `API-service-change-supplier-request.md`.
- Chưa có API hủy đề nghị — `handleCancelRequest` hiện chỉ refetch danh sách (TODO).

## [2026-06-08 15:00] — Chi hộ: chuyển sang search-then-upload thay vì hiển thị danh sách

**Yêu cầu:** Sửa màn quản lý chi hộ, không hiển thị danh sách đơn hàng nữa mà tìm kiếm đơn hàng theo ô search string. Sau khi API response success, bấm vào đơn hàng mới bắt đầu upload.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/PaymentManagementContainer/index.tsx` (toàn bộ): xoá auto-load danh sách orders, thay bằng ô search + nút Tìm kiếm; `useQuery` chỉ gọi API khi có `searchQuery` (enabled); thêm các trạng thái: chưa search, đang tìm, lỗi, không kết quả; xoá `DateRangePicker`, `filtered`, `clearFilters`, `totalAmount`.

**Lý do / bối cảnh:** UX mới: người dùng chủ động tìm đơn hàng trước, sau đó mới upload chứng từ. Giảm tải API và không load toàn bộ danh sách khi vào trang.

**Ảnh hưởng fullstack:** Vẫn dùng `GET /supplier/transactions?q=...` — không thay đổi contract API.

## [2026-06-17 09:10] — Ẩn backend, route toàn bộ API call qua domain frontend (mhgreatsun.com)

**Yêu cầu:** Ẩn backend khỏi Internet, mọi API call đi qua endpoint của frontend, dùng domain `https://mhgreatsun.com`.

**Các file đã thay đổi:**
- `MH/next.config.js` (mục `rewrites`): bật `rewrites()` dạng `fallback` proxy mọi path không khớp page Next.js sang `http://backend-mh:3000/:path*`. Next.js đóng vai reverse proxy server-side.
- `docker-compose.yml` (service `backend-mh`): bỏ network `proxy`, đổi `ports: ["3000"]` → `expose: ["3000"]` để backend chỉ truy cập được qua mạng nội bộ `mh-internal`, không publish ra host.
- `docker-compose.yml` (service `frontend-mh`): đổi `NEXT_PUBLIC_API_HOST` (cả build arg + env) từ `http://backend-mh:3000` → `https://mhgreatsun.com`; gỡ `ports: ["3000"]` (Traefik truy cập qua network `proxy`); gắn middleware redirect HTTP→HTTPS (`traefik.http.routers.mhcom-frontend.middlewares=mhcom-frontend-https`) vốn bị định nghĩa nhưng chưa attach; chuẩn hoá lại khối `labels`.

**Lý do / bối cảnh:** `NEXT_PUBLIC_API_HOST` được inline vào bundle client lúc build và chạy ở trình duyệt; giá trị cũ `http://backend-mh:3000` là DNS nội bộ Docker, trình duyệt không gọi được nên mọi API call fail. Trỏ về `https://mhgreatsun.com` (cùng origin frontend) + rewrites giúp trình duyệt gọi cùng domain, Next.js forward nội bộ tới backend → backend được ẩn hoàn toàn.

**Ảnh hưởng fullstack:** Không đổi API contract. `BASE_URL` → `https://mhgreatsun.com`, `BASE_URL_GEN_BILL` → `https://mhgreatsun.com/api` (xem `MH/src/contants/common.constants.ts`). Lưu ý: đổi `NEXT_PUBLIC_API_HOST` bắt buộc **build lại image frontend** (`docker compose build frontend-mh`), không chỉ restart.

## [2026-06-17 09:20] — Fix bundle inline "undefined" trong NEXT_PUBLIC_API_HOST (Dockerfile)

**Yêu cầu:** API call ra `https://mhgreatsun.com/undefined/api/` — chữ "undefined" do biến môi trường rỗng lúc build.

**Các file đã thay đổi:**
- `MH/Dockerfile` (trước bước `RUN yarn build`): thêm `ARG NEXT_PUBLIC_API_HOST` và `ENV NEXT_PUBLIC_API_HOST=$NEXT_PUBLIC_API_HOST`.

**Lý do / bối cảnh:** `args` trong docker-compose được truyền vào build nhưng Dockerfile chưa khai báo `ARG`/`ENV`, nên lúc `next build` chạy `process.env.NEXT_PUBLIC_API_HOST` = undefined → Next inline chuỗi "undefined" vào bundle client → `BASE_URL_GEN_BILL = "undefined/api"` (xem `MH/src/contants/common.constants.ts`). Lưu ý không set `ENV NODE_ENV=production` trước `yarn install` để không bỏ devDependencies (cần cho build).

**Ảnh hưởng fullstack:** Không đổi API contract. Bắt buộc build lại image frontend không dùng cache cũ.

## [2026-06-25 15:29] — FE Phase 2: Multi-target A integration (mhvn + gp) với runtime switch

**Yêu cầu:** Implement frontend cho phase 2 multi-target. 1 account mhcom có thể liên kết đồng thời 2 hệ A (mhvn/gp); FE cần switch target runtime, gửi header `X-A-Target` mọi request `/api/*` (trừ auth + endpoint lấy danh sách target), xoá hoàn toàn header cũ `X-Active-Supplier-Id`/`X-Active-Customer-Id`.

**Agent thực hiện:** frontend

**Các file đã tạo:**
- `MH/src/services/account-target.services.ts`: type `ATarget`, `AccountType`, `AccountTargetsResponse` và hàm `fetchAccountTargets()` gọi `GET /api/account/a-targets`.
- `MH/src/store/slices/activeTargetSlice.ts`: Redux Toolkit slice quản lý `current`, `availableTargets`, `accountType`. Actions: `setActiveTarget`, `hydrateFromAccountTargets`, `clearActiveTarget`. Persist `current` + `accountType` qua localStorage (`mhcom_active_target`, `mhcom_account_type`); đọc lại lúc init slice.
- `MH/src/lib/queryClient.ts`: singleton `QueryClient` chia sẻ giữa `_app.tsx` và `TargetSwitcher` để `queryClient.clear()` khi switch target.
- `MH/src/components/TargetSwitcher/index.tsx`: Ant Design `Select`. Ẩn khi `availableTargets.length < 2`. Label format `MHVN (2 NCC)` / `GP (1 KH)` theo `accountType`. Khi đổi → dispatch `setActiveTarget` + `queryClient.clear()` + notification.

**Các file đã sửa:**
- `MH/src/contants/Storage.ts`: xoá `A_LINK_TYPE`, `A_LINK_IDS`, `ACTIVE_SUPPLIER_ID`, `ACTIVE_CUSTOMER_ID`. Thêm `ACCOUNT_TYPE = 'mhcom_account_type'`, `ACTIVE_A_TARGET = 'mhcom_active_target'`.
- `MH/src/contants/endpoint.ts`: thêm `ACCOUNT_A_TARGETS = '/account/a-targets'`.
- `MH/src/store/store.ts`: đăng ký reducer `activeTarget`.
- `MH/src/pages/_app.tsx`: bật `<Provider store={store}>` (trước đây bị comment), import `queryClient` từ `@/lib/queryClient` thay vì khởi tạo inline.
- `MH/src/utils/axiosClient2.ts`: thay logic inject `X-Active-Supplier-Id`/`X-Active-Customer-Id` bằng inject `X-A-Target` đọc từ `store.getState().activeTarget.current`. Whitelist URL: `/auth/`, `auth/refresh-tokens`, `/account/a-targets`. Bonus response interceptor: hiện `notification.error` rõ ràng cho lỗi 409 (chưa liên kết target) và 400 (thiếu header).
- `MH/src/utils/Http-request.ts`: thêm cùng logic inject `X-A-Target` (vì cũng gọi `/api/*`).
- `MH/src/container/LoginPage/index.tsx`: thay flow đọc `getAccountLinks` (cũ) bằng `fetchAccountTargets`. Sau khi login thành công → fetch + dispatch `hydrateFromAccountTargets`. Nếu `targets.length === 0` → `Modal.error` "chưa liên kết hệ A nào" + clear state + `removeAll()` + không cho vào app. Điều hướng đến `SUPPLIER_COST_STATEMENT` nếu `account_type='supplier'`, ngược lại `MANAGER_BOOKINGS`.
- `MH/src/container/SupplierSidebar/index.tsx`: thêm `TargetSwitcher` ở khu vực sidebar (ẩn nếu chỉ có 1 target). Logout dispatch `clearActiveTarget()`.
- `MH/src/layout/ManagerLayout.tsx`: logout dispatch `clearActiveTarget()`.
- `MH/src/components/layout/Menu.tsx`: logout admin cũng dispatch `clearActiveTarget()` (defensive cleanup).
- `MH/src/container/banner/index.tsx`: logout từ banner dispatch `clearActiveTarget()`.
- `MH/src/routes/withPrivateRouteSupplier.tsx`: thay check `A_LINK_TYPE` bằng `ACCOUNT_TYPE`.
- `MH/src/services/supplier.services.ts`: cập nhật comment `X-Active-Supplier-Id` → `X-A-Target (mhvn|gp)`.

**Lý do / bối cảnh:** BE đã chuyển sang mô hình multi-target: 1 account có thể trỏ tới nhiều hệ A. Header cũ trở nên vô nghĩa; guard mới bắt buộc `X-A-Target` cho mọi request `/api/*` (trừ whitelist auth + a-targets). User cần switch target runtime mà không re-login → cache server-state phải bị invalidate (queryClient.clear) để mọi query refetch với target mới.

**Ảnh hưởng fullstack:**
- Endpoint mới được tiêu thụ: `GET /api/account/a-targets` (yêu cầu JWT, không cần `X-A-Target`).
- Header `X-A-Target` (`mhvn|gp`) gửi cho mọi request `/api/*` ngoại trừ `/api/auth/*` và `/api/account/a-targets`.
- Đã xoá hoàn toàn header cũ `X-Active-Supplier-Id` và `X-Active-Customer-Id` ở FE (grep không còn match).
- Storage keys cũ (`active_supplier_id`, `active_customer_id`, `a_link_type`, `a_link_ids`) không còn được set; có thể cần script cleanup phía client lần đầu (browser tự bỏ qua, không ảnh hưởng chức năng).
- Lỗi 409 từ guard (account chưa liên kết target) được hiển thị bằng `notification.error`; lỗi 400 (thiếu header) tương tự.

**Build:** `yarn build` pass (Next.js 12, không có lỗi TS/ESLint blocker; chỉ còn warning sort-imports không liên quan code mới).


## [2026-06-25 17:30] — QA: tests + checklist cho Multi-target A integration

**Yêu cầu:** Viết và chạy test cho feature Multi-target A integration (mhvn + gp với runtime switch). Phase 1 (backend) + Phase 2 (frontend) đã xong.

**Agent thực hiện:** qa

**Các file đã thay đổi:**

Backend unit tests (Jest):
- `MH-api/src/modules/auth/mhcom-jwt.service.spec.ts` (mới): 12 tests — verify multi-target JWT mint (`supplier_ids`/`customer_ids` claim, `sub`, `iss`, `aud`), service token cache per-target, key fallback legacy, RSA sign/verify cross-target.
- `MH-api/src/common/guards/active-target.guard.spec.ts` (mới): 8 tests — header missing/invalid (400), không có link (409), gắn `req.activeContext` đúng cho supplier/customer, fallback `accountType` từ `linkType` row đầu, reject khi data lệch.
- `MH-api/src/modules/mhvn-integration/mhvn-integration.service.spec.ts` (mới): 8 tests — `callMhvn` route baseUrl + token theo `activeContext.target`, service token khi không có context, no-share giữa target, fallback legacy `MHVN_API_BASE_URL`.

Backend integration tests (Supertest):
- `MH-api/test/multi-target.e2e-spec.ts` (mới): 7 tests — `GET /api/account/a-targets` response shape, `GET /api/supplier/transactions` với `X-A-Target` thiếu/invalid/mhvn/gp/no-link (400/400/200/200/409), forward query string. Strategy: mock `DataSource` + `HttpService`, override `JwtAuthGuard` bằng stub, mount mini-module gồm `SupplierTransactionsController` + `AccountLinksController`. Không cần Postgres thật.

Test infra:
- `MH-api/package.json` (jest section): thêm `moduleNameMapper` cho `src/*` → `<rootDir>/$1` và `axios` → `axios/dist/node/axios.cjs` (axios v1 ESM khiến jest+ts-jest không parse được).
- `MH-api/test/jest-e2e.json`: thêm cùng `moduleNameMapper` cho e2e config.

Frontend component test (RTL + Redux Provider):
- `MH/src/components/TargetSwitcher/index.spec.tsx` (mới): 7 tests — không render khi <2 target/current=null, label NCC/KH đúng, click target khác dispatch `setActiveTarget` + `queryClient.clear()`, click target trùng không dispatch.
- Mock `@/lib/queryClient` (spy `clear`) và `antd.notification` (silence).

Manual E2E checklist:
- `.claude/specs/multi-target-e2e-checklist.md` (mới): 30+ checkbox items chia theo UI supplier/customer, persistence, auth guards, token correctness, admin link mgmt, edge cases.

**Lý do / bối cảnh:** Đảm bảo regression coverage cho luồng đa target trước khi deploy. Đặc biệt verify (a) JWT claim đúng cho `supplier_ids[]`/`customer_ids[]`, (b) routing baseUrl `mhvn` vs `gp` không bị mix-up, (c) guard trả mã lỗi đúng cho 3 case (thiếu/invalid/no-link), (d) FE TargetSwitcher clear cache khi switch.

**Kết quả run:**
- Backend unit: `yarn test` → 3 suites / 28 tests pass.
- Backend e2e: `yarn test:e2e --testPathPattern=multi-target` → 1 suite / 7 tests pass.
- Frontend: `yarn test --testPathPattern=TargetSwitcher` → 1 suite / 7 tests pass.
- TỔNG: 42 tests pass / 0 fail.

**Bug phát hiện:** Không (code phase 1 + 2 hoạt động đúng spec qua các test).

**Ảnh hưởng fullstack:** Không thay đổi runtime code production — chỉ test files + 2 dòng config jest (moduleNameMapper) trong `MH-api/package.json` và `MH-api/test/jest-e2e.json`. Cần đảm bảo deployer hiểu rằng config jest mới giúp resolve absolute path `src/*` trong test (không ảnh hưởng `nest build` vốn dùng `tsconfig.baseUrl`).

## [2026-06-26 03:24] — Tính năng "Báo cáo chất lượng" NCC ↔ MHVN/GP (full-stack)

**Yêu cầu:** Theo file `mhgs_log_be/docs/excel_123_structure.md` (Bảng 1 cho NCC trên mhcom, Bảng 2 cho MHVN/GP). Cả 2 bên đều có thể tạo bản ghi; chuyển trạng thái 2 chiều; thông báo về user GD/admin khi NCC gửi báo cáo; 2 tab gửi/nhận; filter theo thời gian, trạng thái, mức độ (mhvn thêm filter NCC); pagination.

**Agent thực hiện:** claude (full-stack one-shot)

**Các thay đổi chính:**
- Backend Django (mhgs_log_be): model `QualityReport` + migration `0002_qualityreport.py`; 2 view-set (mhcom supplier-token & mhvn web-user-token); thông báo `QUALITY_REPORT` cho user có `role.desc` chứa `GD` hoặc `is_superuser=True`.
- Backend NestJS (MH-api): module `supplier-quality-reports` proxy sang Django bằng JWT supplier RS256, gắn vào `ActiveTargetGuard` (`X-A-Target`).
- Frontend Next.js (MH): page `/supplier/quality-reports`, container `QualityReportsContainer` (Tabs gửi/nhận, Table với pagination + filter, Modal Form Ant Design).
- Frontend React Vite (MH-logistic): page `QualityReport` với 2 tab, filter có thêm NCC, modal tạo/sửa có select supplier.

**Ảnh hưởng fullstack:** Tính năng mới hoàn toàn — không phá vỡ contract cũ. Yêu cầu chạy migration Django (`python manage.py migrate notifications`) và rebuild MH-api + MH + MH-logistic. Xem chi tiết trong `QUALITY_REPORTS_FEATURE.md` ở project root.
