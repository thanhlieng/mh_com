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

## [2026-06-08 15:00] — Chi hộ: chuyển sang search-then-upload thay vì hiển thị danh sách

**Yêu cầu:** Sửa màn quản lý chi hộ, không hiển thị danh sách đơn hàng nữa mà tìm kiếm đơn hàng theo ô search string. Sau khi API response success, bấm vào đơn hàng mới bắt đầu upload.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/PaymentManagementContainer/index.tsx` (toàn bộ): xoá auto-load danh sách orders, thay bằng ô search + nút Tìm kiếm; `useQuery` chỉ gọi API khi có `searchQuery` (enabled); thêm các trạng thái: chưa search, đang tìm, lỗi, không kết quả; xoá `DateRangePicker`, `filtered`, `clearFilters`, `totalAmount`.

**Lý do / bối cảnh:** UX mới: người dùng chủ động tìm đơn hàng trước, sau đó mới upload chứng từ. Giảm tải API và không load toàn bộ danh sách khi vào trang.

**Ảnh hưởng fullstack:** Vẫn dùng `GET /supplier/transactions?q=...` — không thay đổi contract API.
