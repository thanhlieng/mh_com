# Change Log — Dự án MH

File này ghi lại toàn bộ các thay đổi code do Claude thực hiện theo yêu cầu.
Mục đích: giúp team hiểu được những gì đang được làm mà không cần đọc từng diff.

---

## [2026-06-16 00:00] — Sửa sort cột "Đơn giá" không hoạt động ở màn Thiết lập giá vận chuyển

**Yêu cầu:** Sortable ở cột Đơn giá không hoạt động khi click icon sort.

**Các file đã thay đổi:**
- `MH/src/container/ShippingRateContainer/index.tsx` (import + useReactTable): Thêm import `SortingState`, `getSortedRowModel`; thêm state `sorting`; bổ sung `onSortingChange` và `getSortedRowModel()` vào config table.

**Lý do / bối cảnh:** TanStack Table v8 yêu cầu khai báo `getSortedRowModel()` trong config table và truyền `sorting` state vào `state`. Thiếu hai thứ này khiến `column.toggleSorting()` không có tác dụng dù UI đã có nút sort.

---

## [2026-06-11 00:00] — Thêm màn "Bảng giá dịch vụ" (Supplier) với chỉnh sửa đơn giá inline + gửi yêu cầu thay đổi giá

**Yêu cầu:** Xây màn còn thiếu cho app supplier (System B): liệt kê bảng giá hiện tại của supplier, sửa đơn giá inline, và nút xác nhận → gửi yêu cầu thay đổi giá. Backend + proxy đã có sẵn, chỉ thiếu FE + service.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: thêm interface `SupplierPrice`, `SupplierPricesResponse`; thêm `getSupplierPrices()` (GET `/supplier/prices`) và `updateSupplierPrices(items)` (PATCH `/supplier/prices` body `{ items }`).
- `src/container/SupplierPriceListContainer/index.tsx` (mới): bảng (@tanstack/react-table) mirror pattern `CostStatementContainer` — `EditableNumericCell`, dirty-map theo row id, action bar "{n} thay đổi" với "Hoàn tác" và "Gửi yêu cầu thay đổi giá". Cột: STT, Dịch vụ, Loại cont, Loại hàng, Tuyến, Đơn giá (editable), Cont tiếp theo, VAT, Tiền tệ. Coerce số tiền dạng string qua `Number()`, format `toLocaleString('vi-VN')`. Dùng `useQuery(['supplier-prices'])`, `useMutation(updateSupplierPrices)`; on success notify + invalidate + điều hướng sang `/supplier/price-changes`.
- `src/pages/supplier/prices.tsx` (mới): page dynamic import + `SupplierLayout` (mirror `price-changes.tsx`).
- `src/routes/routes.tsx`: thêm hằng `SUPPLIER_PRICES = '/supplier/prices'`.
- `src/container/SupplierSidebar/index.tsx`: thêm mục menu "Bảng giá dịch vụ" (icon `DollarSignIcon`) phía trên "Yêu cầu thay đổi giá".

**Lý do / bối cảnh:** Supplier cần xem bảng giá hiện tại và đề xuất sửa đơn giá; chỉnh sửa chỉ tạo yêu cầu PENDING chờ duyệt, không đổi giá ngay.

**Ảnh hưởng fullstack:**
- `GET /api/supplier/prices` → `{ count, results: SupplierPrice[] }` (amounts là Decimal → string).
- `PATCH /api/supplier/prices` body `{ items: [{ id, amount }] }` → `{ created, skipped: number[] }`, tạo yêu cầu thay đổi giá EDIT_AMOUNT (PENDING) trên hệ thống A. Chỉ trường `amount` được sửa.

## [2026-06-09] — Thêm toast (antd notification) thông báo kết quả request API màn Bảng kê chi phí

**Yêu cầu:** Hiện tại request API thành công hay thất bại đều không có thông báo; thêm toast thông báo khi gọi API.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/index.tsx`:
  - Thêm import `notification` từ `antd` (theo convention sẵn có của dự án, vd `ListContainer/components/ExpandItems.tsx`).
  - `createMutation` (tạo đề nghị thay đổi): thêm `notification.success` khi gửi thành công và `notification.error` (đọc `e.response.data.message`) khi lỗi.
  - `apiQuery` (getSupplierTransactions) và `changeRequestsQuery` (getChangeRequests): thêm `onError` → `notification.error`.
  - `handleExport`: thêm `notification.success` khi xuất Excel xong, `notification.error` khi lỗi (thay cho việc chỉ `console.error`).
  - Xóa hàm `formatFieldValue` (dead code còn lại sau khi bỏ `window.prompt` ở thay đổi trước).

**Lý do / bối cảnh:** Người dùng không biết kết quả thao tác gọi API. Dùng `notification` của antd với `placement: 'top'` để đồng nhất với phần còn lại của dự án.

**Ảnh hưởng fullstack:** Không đổi API; chỉ đọc `error.response.data.message` từ response lỗi để hiển thị.

---

## [2026-06-09] — Gộp nhiều thay đổi cước phí thành 1 API call, bỏ prompt lý do

**Yêu cầu:** Bỏ cửa sổ prompt hỏi lý do; thay vì gọi 1 API per thay đổi, gom tất cả thành 1 API call với body là list.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `src/services/supplier.services.ts` (sau dòng 259): Thêm type `CreateChangeRequestsBulkPayload` và hàm `createChangeRequestsBulk` — POST `/supplier/change-requests/bulk` với body là array các `{pnl, order, requested_cost}`.
- `src/container/CostStatementContainer/index.tsx` (dòng 38, 626–703): Đổi import sang `createChangeRequestsBulk`; rewrite `handleConfirm` — bỏ hoàn toàn `window.prompt`, gom tất cả dirty rows có `freightCost` + `pnlId` + `orderId` vào 1 array, gọi `createMutation.mutateAsync(payload)` một lần duy nhất.

**Lý do / bối cảnh:** Gọi N API đồng thời cho N thay đổi tốn tài nguyên và khó xử lý lỗi; bulk call đơn giản hơn và phù hợp với backend mới hỗ trợ batch endpoint. Prompt lý do bị bỏ theo yêu cầu UX.

**Ảnh hưởng fullstack:** Backend cần hỗ trợ endpoint `POST /supplier/change-requests/bulk` nhận `[{pnl, order, requested_cost}, ...]` và trả về `ChangeRequestResponse[]`.

---

## [2026-06-09] — Đổi UI màn đề nghị thay đổi từ parent-child sang flat rows

**Yêu cầu:** Đổi UI màn "Đề nghị thay đổi" từ dạng parent row (ChangeRequest) + child rows expand (ChangeRequestItem) thành mỗi ChangeRequestItem là 1 row phẳng riêng biệt.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/ChangeRequestList.tsx` (toàn bộ): Xóa logic expand/collapse, thêm hàm `flattenRequests()` để flat hóa `ChangeRequest[]` thành mảng `FlatRow[]`. Mỗi `ChangeRequestItem` trở thành 1 row hiển thị đầy đủ: Mã đề nghị, Thời gian gửi, Mã bill, Trường thay đổi, Giá trị cũ → Giá trị mới, Trạng thái, Hủy.

**Lý do / bối cảnh:** UI parent-child dạng accordion không trực quan, user muốn nhìn thấy toàn bộ chi tiết thay đổi trực tiếp trên bảng mà không cần click expand.

---

## [2026-06-07 00:02] — Tích hợp view Bảng kê chi phí — domain data thực

**Yêu cầu:** Tích hợp view bảng kê đã plan, dùng đúng data model vận chuyển (billCode, customer, route, cargoType, freightCost, surcharge...).

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `src/components/ui/input.tsx`: sửa `interface InputProps` thành `type InputProps` để pass ESLint no-empty-interface
- `src/container/CostStatementContainer/index.tsx`: viết lại hoàn toàn — dùng `types.ts` + `fakeData.ts`, thêm `EditableNumericCell` cho cước phí/phụ phí/số lượng, auto-tính `total = freightCost + surcharge` khi edit, summary footer row, 3 DB filter đúng domain (Mã bill / Khách hàng / Tuyến đường)

**Lý do / bối cảnh:** File `types.ts` và `fakeData.ts` có domain data phù hợp hơn (tuyến đường, loại hàng, cước phí, phụ phí). Container cũ dùng data placeholder sai domain.

## [2026-06-07 00:01] — Màn hình Bảng kê chi phí — TanStack Table + shadcn

**Yêu cầu:** Màn hình có bảng editable, DateRange selector, 3 input query DB, search local trên từng cột header. Dùng TanStack Table + shadcn. Fake data trước.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `package.json`: thêm `@tanstack/react-table@8`, `@radix-ui/react-label`, downgrade `date-fns` về v3 (tương thích Next.js 12 moduleResolution node)
- `src/components/ui/calendar.tsx`: cập nhật lên API react-day-picker v10 (classNames keys mới: `month_caption`, `button_previous`, `button_next`, `day_button`, `range_start`, `range_end`, `selected`, v.v.)
- `src/components/ui/badge.tsx`: thêm variant `success`, `warning`
- `src/components/ui/input.tsx`: mới — shadcn Input component
- `src/components/ui/label.tsx`: mới — shadcn Label component
- `src/components/DateRangePicker/index.tsx`: mới — DateRange picker với Popover + Calendar, hiển thị dd/MM/yyyy tiếng Việt
- `src/container/CostStatementContainer/fake-data.ts`: mới — 20 bản ghi fake với các trường code, date, partnerCode, orderCode, description, category, amount, status, note
- `src/container/CostStatementContainer/index.tsx`: implement đầy đủ — TanStack Table với column-level search, inline editable cells, date range filter local, 3 DB query inputs, total amount footer

**Lý do / bối cảnh:** Khung màn hình Bảng kê chi phí dùng fake data. Khi có API thực tế sẽ thay thế FAKE_COST_STATEMENT và nối nút "Áp dụng" với API call.

## [2026-06-07 00:00] — Dựng khung Supplier view (shadcn)

**Yêu cầu:** Tách user thành 2 loại supplier / customer theo trường `a_supplier_id` / `a_customer_id`. Dựng khung view supplier với sidebar và 2 module: Bảng kê chi phí, Quản lý chi hộ. Sử dụng shadcn/ui.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `package.json`: thêm dependencies `class-variance-authority`, `lucide-react`, `@radix-ui/react-slot`, `@radix-ui/react-separator`
- `src/lib/utils.ts` (mới): hàm `cn` kết hợp clsx + tailwind-merge cho shadcn
- `src/components/ui/button.tsx` (mới): shadcn Button component với variants
- `src/components/ui/separator.tsx` (mới): shadcn Separator component
- `src/styles/globals.css`: thêm CSS variables shadcn (sidebar, primary, muted, border…)
- `tailwind.config.js`: thêm color tokens shadcn + sidebar color scheme
- `src/services/Authen.type.ts`: thêm `a_supplier_id?: string | null` và `a_customer_id?: string | null` vào interface `IUser`
- `src/routes/routes.tsx`: thêm constants `SUPPLIER_HOME`, `SUPPLIER_COST_STATEMENT`, `SUPPLIER_PAYMENT_MANAGEMENT`
- `src/routes/withPrivateRouteSupplier.tsx` (mới): route guard kiểm tra `a_supplier_id` trong localStorage
- `src/container/LoginPage/index.tsx` (dòng 40–42): cập nhật redirect sau login — nếu `a_supplier_id` tồn tại → `/supplier/cost-statement`, còn lại → `/manager/booking`
- `src/layout/SupplierLayout.tsx` (mới): layout 2 cột — sidebar cố định 240px + main content
- `src/container/SupplierSidebar/index.tsx` (mới): sidebar dark với logo, nav 2 module, user info, logout
- `src/container/CostStatementContainer/index.tsx` (mới): skeleton page "Bảng kê chi phí" (placeholder)
- `src/container/PaymentManagementContainer/index.tsx` (mới): skeleton page "Quản lý chi hộ" (placeholder)
- `src/pages/supplier/index.tsx` (mới): redirect tự động → `/supplier/cost-statement`
- `src/pages/supplier/cost-statement.tsx` (mới): page Bảng kê chi phí với SupplierLayout
- `src/pages/supplier/payment-management.tsx` (mới): page Quản lý chi hộ với SupplierLayout

**Lý do / bối cảnh:** Phân tách view theo loại tài khoản. User có `a_supplier_id` dùng giao diện mới (sidebar-based, shadcn), user có `a_customer_id` giữ nguyên view cũ.

**Ảnh hưởng fullstack:** Backend cần trả về trường `a_supplier_id` và `a_customer_id` trong response của `POST /auth/login` (object `user`).

---

## [2026-06-08 20:40] — Chuyển PaymentManagement sang API tra cứu đơn theo mã (order-by-code)

**Yêu cầu:** Thay API `GET /supplier/transactions` bằng API tra cứu đơn hàng theo mã từ hệ thống A (`order-by-code`) trong màn Quản lý chi hộ.

**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/services/supplier.services.ts` (dòng 198–271): thêm types `ChihosItem`, `OrderByCodeResponse` và service function `getOrderByCode` (mock với 2 chihos, delay 600ms)
- `MH/src/container/PaymentManagementContainer/index.tsx`: thay `getSupplierTransactions` → `getOrderByCode`; thay `mapChiHoToOrder` mapping từ `ChiHoTransaction` → mapping từ `OrderByCodeResponse.chihos` items; xoá import `ChiHoTransaction`

**Lý do / bối cảnh:** Hệ thống B không còn lưu giao dịch chi hộ dạng flat. Thay vào đó, màn Quản lý chi hộ cần search đơn trước (order-code), sau đó hiển thị các khoản chi hộ (chihos) trong đơn đó.

**Ảnh hưởng fullstack:** API mới `GET /api/order_by_code/?q=<code>` thuộc `mhgs_log_be` (Django - hệ thống A). Cần proxy endpoint trên system B hoặc gọi trực tiếp từ frontend. Hiện tại dùng mock data với timeout 600ms.


## [2026-06-10 00:00] — Xây dựng lại bảng "Bảng kê chi phí" theo contract API mới

**Yêu cầu:** Rebuild bảng Bảng kê chi phí theo contract row mới của hệ thống A (Django, proxy qua system B tại `GET /api/supplier/transactions`). Đổi bộ cột, quy tắc chỉnh sửa, và bộ lọc tìm kiếm.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`:
  - Thay union `PnlTransaction | ChiHoTransaction` bằng interface `SupplierTransaction` thống nhất với các trường mới: `type, id, order_id, order_code, booking_bill_number, container_no, container_type, route, service_name, contract_number, amount, expense_type, category, editable` (+ phụ trợ `created_at, invoice_date, customer_name, supplier_name, invoice_exporter`).
  - `SupplierTransactionsResponse`, `getSupplierTransactions`, các export change-request và chiho-files giữ nguyên.
  - `CostStatementExportParams`: bỏ `billCode/customer/route`, thêm `q`.
- `src/container/CostStatementContainer/types.ts`:
  - Viết lại `CostStatementRow` khớp cột mới: `id, orderCode, bookingBillNumber, containerNo, containerType, route, serviceName, contractNumber, amount, category, editable, pnlId?, orderId?, type`. Thêm type `CostCategory`.
  - `EditableField` rút gọn còn `'amount'`. `FIELD_LABELS = { amount: 'Tiền' }`.
  - `mapApiResponseToChangeRequest` đổi `field: 'freightCost'/'Cước phí'` → `'amount'/'Tiền'` (logic đọc từ `ChangeRequestResponse` không đổi).
- `src/container/CostStatementContainer/index.tsx`:
  - `mapTransactionToRow`, `buildColumns`, `CostCard`, header/body/footer, filter bar viết lại.
  - Bộ cột mới (đúng thứ tự): STT, Mã đơn, Mã booking, Số container, Loại cont, Tuyến đường, Dịch vụ, Số hoá đơn, Tiền, Loại. Bỏ các cột cũ (Ngày tạo, Khách hàng, Loại hàng, SL, Cước phí, Phụ phí, Tổng cộng, Trạng thái, Ghi chú) và khái niệm CostStatus.
  - Cột "Loại" render bằng Badge: `cost`→"Chi phí" (default), `invoice_mh`→"Chi hộ MH" (warning), `chi_ho`→"Chi hộ" (secondary).
  - Chỉnh sửa: chỉ ô **Tiền** và chỉ khi `row.editable === true` (pnl & expense_type !== 'invoice_mh'); các ô khác read-only; ô Tiền không editable hiển thị VND dạng text. Giữ dirty-tracking + "Hoàn tác". "Xác nhận" gom các dòng editable đã sửa thành payload `{ pnl, order, requested_cost }` rồi `createChangeRequest`, thành công thì chuyển sang tab "Đề nghị thay đổi".
  - Bộ lọc: thay 3 ô (Mã bill/Khách hàng/Tuyến đường) bằng 1 ô "Tìm kiếm" gửi qua param `q`. Giữ DateRangePicker (`start_date`/`end_date`) + nút "Áp dụng"/"Xóa bộ lọc". "Áp dụng" set `queryParams` `{ q, start_date, end_date, page:1, page_size:200 }`.
  - Tổng kết: bỏ Cước/Phụ phí/Tổng cộng, hiển thị "Tổng tiền" = tổng `amount` các dòng hiển thị (header, footer, card mobile).
  - Export giữ nút cũ, truyền `q` + `from`/`to` (endpoint vẫn là TODO backend).
- `src/container/CostStatementContainer/fakeData.ts`, `changeRequestData.ts`: cập nhật mock (không còn import nơi nào) theo shape mới để giữ type-clean.

**Lý do / bối cảnh:** Backend đang dựng lại contract row của API transactions. Frontend code trước theo contract mới này để khi backend xong là khớp ngay.

**Ảnh hưởng fullstack:**
- `GET /api/supplier/transactions` (system B proxy → Django): mỗi item trong `results[]` phải theo shape `SupplierTransaction` mới ở trên; nhận thêm param `q` (tìm kiếm server-side trên mã đơn/booking/container/tuyến/dịch vụ/hoá đơn).
- `POST /api/supplier/change-requests`: payload mỗi dòng vẫn là `{ pnl, order, requested_cost }` (chỉ áp cho dòng pnl editable).
- `GET /supplier/cost-statement/export` (TODO backend): đổi params còn `from, to, q`.

**Kiểm tra type:** chạy `yarn typecheck` (`tsc --noEmit --incremental false`) → Done, không lỗi.

---

## [2026-06-10 01:00] — LoginPage & guard theo logic multi-link supplier/customer

**Yêu cầu:** Sửa `LoginPage` (và luồng liên quan) theo logic mới: một account liên kết NHIỀU supplier hoặc NHIỀU customer. Trước đây login điều hướng dựa trên `res.user.a_supplier_id` — trường này backend không còn trả về nên supplier không vào được màn bảng kê.

**Các file đã thay đổi:**
- `src/contants/Storage.ts`: thêm key `A_LINK_TYPE`, `A_LINK_IDS`, `ACTIVE_SUPPLIER_ID`, `ACTIVE_CUSTOMER_ID`.
- `src/services/supplier.services.ts`: thêm `getAccountLinks()` gọi `GET /api/account/a-links` + type `AccountLinks`/`ALinkType`.
- `src/container/LoginPage/index.tsx`: sau khi lưu token, gọi `getAccountLinks()`; lưu `linkType`/`ids` + id active mặc định (ids[0]); điều hướng `supplier` → `SUPPLIER_COST_STATEMENT`, còn lại → `MANAGER_BOOKINGS`. Xoá id active cũ trước khi set để tránh lẫn phiên.
- `src/routes/withPrivateRouteSupplier.tsx`: guard theo `A_LINK_TYPE === 'supplier'` (đọc từ localStorage) thay vì `user.a_supplier_id`.
- `src/utils/axiosClient2.ts`: interceptor tự đính header `X-Active-Supplier-Id` / `X-Active-Customer-Id` từ storage cho mọi request.
- `src/services/Authen.type.ts`: bỏ field chết `a_supplier_id`/`a_customer_id` khỏi `IUser`.

**Lý do / bối cảnh:** Backend đã bỏ cột scalar `a_supplier_id`/`a_customer_id`; nguồn liên kết giờ là bảng `user_a_links`, truy vấn qua `GET /api/account/a-links`. FE cần lấy loại liên kết để điều hướng và lưu id active để các API proxy gửi đúng header.

**Ảnh hưởng fullstack:**
- Phụ thuộc endpoint `GET /api/account/a-links` (MH-api) trả `{ linkType, ids }`.
- Các API supplier/customer (vd `/api/supplier/transactions`, `/api/bangke`) nhận header `X-Active-Supplier-Id` / `X-Active-Customer-Id` (do axiosClient2 tự đính). Account nhiều liên kết nếu thiếu header sẽ bị `400`; hiện FE mặc định chọn `ids[0]` (chưa có UI switcher đổi id active — TODO).

## [2026-06-11 00:00] — Màn supplier "Yêu cầu thay đổi giá" (FE2 price-change approval)

**Yêu cầu:** Xây màn supplier hiển thị trạng thái các yêu cầu thay đổi giá của chính supplier và cho phép XÓA yêu cầu khi còn PENDING.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: thêm interface `SupplierPriceChange` + các type liên quan, hàm `getSupplierPriceChanges(status?)` (GET `/supplier/price-changes`) và `deleteSupplierPriceChange(id)` (DELETE `/supplier/price-changes/:id`).
- `src/container/SupplierPriceChangeContainer/types.ts` (mới): map nhãn/màu tiếng Việt cho Loại, Nguồn, Trạng thái + options Select lọc trạng thái.
- `src/container/SupplierPriceChangeContainer/index.tsx` (mới): antd `Table` (STT, Loại badge, Tuyến/Dịch vụ/Container, Giá cũ → Giá mới định dạng VND, Nguồn, Trạng thái Tag, Ngày tạo dayjs, Người duyệt, Hành động). React-query `useQuery(['supplier-price-changes', status])`; nút Xóa chỉ hiện khi `status === 'PENDING'`, bọc trong `Popconfirm` "Xóa yêu cầu này?" → `useMutation(deleteSupplierPriceChange)`; success → invalidate list + `notification.success` "Đã xóa yêu cầu". Có `Select` lọc trạng thái (Tất cả/Chờ duyệt/Đã duyệt/Từ chối/Xung đột). Bọc `withPrivateRouteSupplier`.
- `src/pages/supplier/price-changes.tsx` (mới): page wiring (dynamic import + `SupplierLayout`).
- `src/routes/routes.tsx`: thêm hằng `SUPPLIER_PRICE_CHANGES = '/supplier/price-changes'`.
- `src/container/SupplierSidebar/index.tsx`: thêm menu "Yêu cầu thay đổi giá" (icon `TagIcon`).

**Lý do / bối cảnh:** Task FE2 của kế hoạch duyệt thay đổi giá — supplier cần theo dõi trạng thái yêu cầu và tự hủy yêu cầu chưa được duyệt.

**Ảnh hưởng fullstack:**
- Phụ thuộc endpoint B (proxy sang A, token supplier, header `X-Active-Supplier-Id` tự đính bởi axiosClient2):
  - `GET /api/supplier/price-changes?status=<opt>` → `SupplierPriceChange[]`.
  - `DELETE /api/supplier/price-changes/:id` → 204; 400 nếu không PENDING, 404 nếu không phải chủ sở hữu.
- Dữ liệu được server scope theo token; không lọc ownership phía client.

---

## [2026-06-11 17:30] — Gộp màn Bảng giá dịch vụ vào màn Chi phí vận chuyển, đổi tên "Thiết lập giá vận chuyển"

**Yêu cầu:** Màn "Chi phí vận chuyển" và "Bảng giá dịch vụ" là một. Chuyển logic gọi API giá (list + sửa đơn giá + gửi yêu cầu thay đổi) sang màn Chi phí vận chuyển và đổi tên thành "Thiết lập giá vận chuyển". Chưa ghép API ở màn danh sách yêu cầu thay đổi (giữ nguyên).

**Các file đã thay đổi:**
- `src/container/ShippingRateContainer/index.tsx`: thay toàn bộ nội dung demo (fakeData) bằng bảng giá thật — `getSupplierPrices` + ô Đơn giá sửa inline + nút "Gửi yêu cầu thay đổi giá" (`updateSupplierPrices`); tiêu đề H1 "Thiết lập giá vận chuyển".
- `src/container/SupplierSidebar/index.tsx`: đổi nhãn "Chi phí vận chuyển" → "Thiết lập giá vận chuyển"; bỏ mục "Bảng giá dịch vụ" và import `SUPPLIER_PRICES`, `DollarSignIcon` thừa.
- `src/routes/routes.tsx`: bỏ hằng `SUPPLIER_PRICES`.
- **Đã xóa:** `src/container/SupplierPriceListContainer/`, `src/pages/supplier/prices.tsx`, và các file stub không dùng `ShippingRateContainer/{fakeData,types,UploadRateModal}`.

**Lý do / bối cảnh:** Hai màn trùng chức năng; gộp về một màn duy nhất ở route `/supplier/shipping-rate`.

**Ảnh hưởng fullstack:** Không đổi API. Vẫn dùng `GET /api/supplier/prices` và `PATCH /api/supplier/prices` (tạo yêu cầu thay đổi PENDING). Màn `/supplier/prices` đã bị gỡ.

---

## [2026-06-11 18:10] — Khôi phục modal tải template + upload Excel trên màn Thiết lập giá vận chuyển

**Yêu cầu:** Khôi phục lại modal tải template + upload Excel (đã bị xoá khi gộp màn) trên màn giá; xác nhận API lấy danh sách yêu cầu thay đổi giá ở hệ thống B.

**Các file đã thay đổi:**
- `src/container/ShippingRateContainer/UploadRateModal.tsx`: khôi phục từ git; thay TODO upload bằng gọi thật `importSupplierPrices`; thêm chọn "Loại tuyến" (DOMESTIC/DOMESTIC_PORT) + nhập "Mã tiền tệ (currency id)" (backend yêu cầu); hiển thị lỗi import.
- `src/container/ShippingRateContainer/index.tsx`: thêm lại nút "Upload Excel giá" + render `UploadRateModal`; sau khi import thành công → toast số yêu cầu tạo ra, invalidate `['supplier-prices']`, điều hướng sang `/supplier/price-changes`.
- `src/services/supplier.services.ts`: thêm `importSupplierPrices(file, routeType, currencyId)` → `POST /api/supplier/prices/import` (multipart) + type `ImportSupplierPricesResponse`.
- Xoá `ShippingRateContainer/types.ts` (mồ côi sau khi bỏ bảng demo).

**Lý do / bối cảnh:** Upload Excel tạo batch yêu cầu thay đổi giá PENDING (CREATE/REPLACE) chờ duyệt trên hệ thống A, không đổi giá ngay.

**Ảnh hưởng fullstack:** Dùng `POST /api/supplier/prices/import` (đã có ở B, proxy sang A). API danh sách yêu cầu thay đổi giá ở B: `GET /api/supplier/price-changes` (đã có sẵn) + service `getSupplierPriceChanges` + màn `/supplier/price-changes`.

---

## [2026-06-12 18:30] — Đổi tên hệ thống system-a→mhvn, system-b→mhcom (cập nhật comment tài liệu)

**Yêu cầu:** Đổi quy ước đặt tên 2 hệ thống: system-a = mhvn, system-b = mhcom.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: sửa comment tham chiếu tài liệu `api/system-b-supplier-*.md` → `api/mhcom-supplier-*.md` (theo file doc đã đổi tên ở backend mhvn).

**Ảnh hưởng fullstack:** Wire đổi đồng bộ ở 2 backend (iss='mhcom', aud='mhvn', path `/api/mhcom/...`). FE không gọi trực tiếp path `/api/mhcom/...` (đi qua proxy mhcom/MH-api), nên không đổi code gọi API.

---

## [2026-06-12 18:30] — Tab "Kết nối mhvn" ở màn quản trị khách hàng (liên kết account ↔ supplier/customer mhvn)

**Yêu cầu:** Tại view `/administrator/customer` (list + sửa khách hàng), thêm tab "Kết nối mhvn" với dropdown chọn account này liên kết với supplier hay customer nào bên mhvn. Được chọn nhiều, nhưng chỉ một loại (supplier HOẶC customer), không thể cả hai cùng lúc.

**Các file đã thay đổi:**
- `src/customer/components/MhvnConnect/MhvnConnect.tsx` (mới): component tab — Radio chọn loại (supplier/customer), Select multiple (search) lấy options từ danh mục mhvn, nạp liên kết hiện tại, nút "Lưu liên kết". Đổi loại → xoá lựa chọn (đảm bảo chỉ một loại). Nếu account chưa có user → hiện cảnh báo.
- `src/customer/components/ModalCustomer/EditCustomer.tsx`: import `MhvnConnect` + `USER`; tính `isAdmin` từ localStorage; thêm `Tabs.TabPane` "Kết nối mhvn" (chỉ hiện với admin), truyền `userId={value?.userId}`.
- `src/services/supplier.services.ts`: thêm `getMhvnSuppliers`, `getMhvnCustomers` (danh mục mhvn), `getAccountLinksByUser`, `setAccountLinksByUser` (quản lý liên kết theo userId) + interface `MhvnDirectoryEntity`.

**Lý do / bối cảnh:** Admin cần ánh xạ tài khoản mhcom sang một/nhiều thực thể bên mhvn để token gửi sang mhvn định danh đúng. Theo mô hình multi-link: một account chỉ thuộc đúng một loại.

**Ảnh hưởng fullstack:** Phụ thuộc các endpoint backend (chỉ ADMIN):
- `GET /api/directory/suppliers?q=`, `GET /api/directory/customers?q=` → `{ message, suppliers|customers: [...] }`.
- `GET /api/admin/account-links/:userId` → `{ linkType, ids }`.
- `PUT /api/admin/account-links/:userId` body `{ linkType: 'supplier'|'customer'|null, ids: string[] }` → thay thế toàn bộ liên kết.

## [2026-06-14 00:00] — Thêm nút "Tải lại" cho các bảng route NCC (supplier/*)

**Yêu cầu:** Trong các trang `supplier/*` có các bảng hiển thị dữ liệu, thêm nút reload để tải lại data các bảng.

**Các file đã thay đổi:**
- `src/container/ShippingRateContainer/index.tsx`: thêm import `RefreshCwIcon`; thêm nút "Tải lại" (variant outline) ở page header, gọi `apiQuery.refetch()`, disable + icon quay khi `isFetching`.
- `src/container/SupplierPriceChangeContainer/index.tsx`: thêm import `RefreshCwIcon`; lấy thêm `refetch` từ `useQuery`; thêm nút "Tải lại" cạnh bộ lọc trạng thái, gọi `refetch()`.
- `src/container/CostStatementContainer/index.tsx`: thêm import `RefreshCwIcon`; gom phần thống kê + nút "Tải lại" vào một cụm bên phải header; nút refetch theo view hiện tại (`apiQuery` cho bảng kê, `changeRequestsQuery` cho đề nghị thay đổi).
- `src/container/PaymentManagementContainer/index.tsx`: thêm import `RefreshCwIcon`; thêm nút "Tải lại" cạnh nút Tìm kiếm (chỉ hiện khi đã có `searchQuery`), gọi `apiQuery.refetch()` để chạy lại tìm kiếm hiện tại.

**Lý do / bối cảnh:** Người dùng NCC cần làm mới dữ liệu bảng mà không phải reload cả trang. Tất cả bảng đã dùng react-query `useQuery` nên chỉ cần expose `refetch`/`isFetching` và gắn nút bấm.

**Ảnh hưởng fullstack:** Không thay đổi API. Nút chỉ refetch lại các endpoint hiện có (`getSupplierPrices`, `getSupplierPriceChanges`, `getSupplierTransactions`/`getChangeRequests`, `getOrderByCode`).

---

## [2026-06-14 10:30] — Nối API thật cho ô tìm kiếm màn Quản lý chi hộ

**Yêu cầu:** Ô input search ở màn "Quản lý chi hộ" tra cứu đơn theo số booking/bill (match exact). Thay MOCK bằng API thật.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts` (`getOrderByCode`): bỏ `MOCK_ORDER` và mock `setTimeout`; gọi `axiosClient2.get('/supplier/order-by-booking', { params: { q } })`.
- `src/container/PaymentManagementContainer/index.tsx`: cập nhật placeholder ("Nhập chính xác số booking / bill...") và text gợi ý empty-state cho đúng logic tìm theo booking/bill khớp chính xác.

**Lý do / bối cảnh:** Backend mhcom đã có proxy `GET /api/supplier/order-by-booking` → mhvn (`SupplierOrderByBookingAPI`, match exact `booking_bill_number`).

**Ảnh hưởng fullstack:** Gọi endpoint mới `GET /api/supplier/order-by-booking?q=<booking>` (cần header `X-Active-Supplier-Id` khi account đa liên kết). Response giữ nguyên shape `OrderByCodeResponse` nên phần map/UI không đổi.

---

## [2026-06-14 14:00] — Hiển thị trạng thái duyệt file Chi hộ (màn Quản lý chi hộ)

**Yêu cầu:** File chi hộ NCC upload nay phải qua bước duyệt của mhgs trước khi lưu vào đơn. FE cần cho NCC thấy trạng thái duyệt của từng file.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: `ChiHoFile` thêm `approval_status` (PENDING/APPROVED/REJECTED), `approved_by`, `approved_at`; thêm type `ChiHoApprovalStatus`.
- `src/container/PaymentManagementContainer/types.ts`: `UploadedFile` thêm `approvalStatus`.
- `src/container/PaymentManagementContainer/index.tsx` + `FileUploadPanel.tsx`: map `approval_status` → `approvalStatus`; panel hiển thị badge "Chờ duyệt / Đã duyệt / Từ chối" cạnh tên file.

**Lý do / bối cảnh:** Backend mhgs thêm bước duyệt; file upload từ mhcom khởi tạo ở PENDING.

**Ảnh hưởng fullstack:** Phụ thuộc field mới `approval_status` từ `GET /api/supplier/chiho-files` (proxy → mhvn). Không đổi cách gọi API.

---

## [2026-06-14 15:10] — Danh sách yêu cầu tải lên + filter trạng thái (panel chi hộ)

**Yêu cầu:** Trong panel chỉ thấy file đã tải/đã duyệt. Cần 1 list riêng xem danh sách đã yêu cầu tải lên, có filter trạng thái — KHÔNG thêm màn hình mới, KHÔNG thêm tab.

**Các file đã thay đổi:**
- `src/container/PaymentManagementContainer/FileUploadPanel.tsx`: đổi mục "File đã tải lên" → "Danh sách yêu cầu tải lên"; thêm bộ lọc trạng thái dạng chip (Tất cả / Chờ duyệt / Đã duyệt / Từ chối) kèm số đếm từng trạng thái; danh sách render theo filter (`visibleFiles`), có empty-state riêng cho từng trường hợp.

**Lý do / bối cảnh:** NCC cần theo dõi mọi file đã yêu cầu tải lên và lọc nhanh theo trạng thái duyệt, ngay trong slide-over hiện có (không tạo route/tab mới).

**Ảnh hưởng fullstack:** Không. Dùng lại field `approval_status` (đã có) từ `GET /api/supplier/chiho-files`; thuần FE.

---

## [2026-06-14 16:00] — Tab "Danh sách yêu cầu tải lên" (gộp mọi đơn) màn Quản lý chi hộ

**Yêu cầu:** Thêm 1 tab ở màn Quản lý chi hộ hiển thị bảng tất cả file đã yêu cầu tải lên across mọi đơn: đơn nào, trạng thái, tên file, ngày tải, nút tải/xem trực tiếp.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: thêm `ChiHoUploadRow`, `ChiHoUploadsListResponse`, `listChiHoUploads(status?)` gọi `GET /api/supplier/chiho-files/uploads`.
- `src/container/PaymentManagementContainer/UploadRequestsTab.tsx` (mới): bảng (Mã đơn, Booking/Bill, Tên file, Trạng thái, Ngày tải, nút Xem/ExternalLink + Tải/Download) + filter trạng thái dạng chip + nút Tải lại.
- `src/container/PaymentManagementContainer/index.tsx`: thêm thanh tab ("Tra cứu & tải lên" | "Danh sách yêu cầu tải lên"), render có điều kiện theo tab.
- `src/container/PaymentManagementContainer/FileUploadPanel.tsx`: hoàn lại mục danh sách file trong panel về "File đã tải lên" (bỏ filter cục bộ thêm ở bản trước) để tab mới là danh sách chuẩn; giữ badge trạng thái mỗi file.

**Lý do / bối cảnh:** Người dùng làm rõ muốn 1 tab bảng tổng hợp mọi đơn (không phải filter trong panel theo từng đơn).

**Ảnh hưởng fullstack:** Phụ thuộc endpoint mới `GET /api/supplier/chiho-files/uploads?status=` (proxy → mhvn `GET /api/mhcom/supplier/chiho-files/uploads/`).

---

## [2026-06-14 17:00] — Gộp màn "Yêu cầu thay đổi giá" thành tab của "Thiết lập giá vận chuyển"

**Yêu cầu:** Chuyển màn "Yêu cầu thay đổi giá" thành 1 tab trong màn "Thiết lập giá vận chuyển".

**Các file đã thay đổi:**
- `src/container/SupplierPriceChangeContainer/PriceChangeList.tsx` (mới): tách phần filter trạng thái + bảng yêu cầu thay đổi giá (bỏ header/title + HOC) thành component tái dùng.
- `src/container/SupplierPriceChangeContainer/index.tsx`: **đã xóa** (wrapper standalone không còn dùng).
- `src/container/ShippingRateContainer/index.tsx`: thêm thanh tab "Thiết lập giá" | "Yêu cầu thay đổi giá"; tab giá giữ toolbar (Tải lại/Upload Excel) + bảng + dirty bar; tab còn lại render `<PriceChangeList />`. Badge số thay đổi trên nhãn tab. Sau khi gửi/upload yêu cầu tự chuyển sang tab "Yêu cầu thay đổi giá" (thay `router.push`). Hỗ trợ deep-link `?tab=changes`.
- `src/container/SupplierSidebar/index.tsx`: bỏ menu "Yêu cầu thay đổi giá"; bỏ import `TagIcon` + `SUPPLIER_PRICE_CHANGES` không dùng.
- `src/pages/supplier/price-changes.tsx`: redirect sang `/supplier/shipping-rate?tab=changes`.

**Lý do / bối cảnh:** Gom thao tác giá vào một màn để supplier sửa giá và xem trạng thái yêu cầu cùng chỗ.

**Ảnh hưởng fullstack:** Không. Thuần FE, dùng lại service `getSupplierPrices`, `updateSupplierPrices`, `getSupplierPriceChanges`, `deleteSupplierPriceChange`.

---

## [2026-06-14 17:40] — Đồng bộ kiểu bảng màn "Yêu cầu thay đổi giá" với các màn khác

**Yêu cầu:** Đổi kiểu bảng ở màn (tab) "Yêu cầu thay đổi giá" cho giống các bảng ở màn khác.

**Các file đã thay đổi:**
- `src/container/SupplierPriceChangeContainer/PriceChangeList.tsx`: thay Ant Design `Table`/`Tag`/`Spin`/`Select`/`Popconfirm` bằng bảng HTML + Tailwind giống `ChangeRequestList`/`PaymentManagementContainer` (header `bg-muted/40`, sọc dòng `bg-muted/10`, `Badge` shadcn cho Loại/Trạng thái, cột "Giá cũ → Giá mới" tách dấu mũi tên). Thêm card list cho mobile; filter trạng thái dạng chip (thay Select); xóa yêu cầu PENDING bằng nút icon `Trash2` + `window.confirm` (thay Popconfirm).
- `src/container/SupplierPriceChangeContainer/types.ts`: bỏ `CHANGE_TYPE_COLOR`, `STATUS_COLOR` (màu antd Tag không còn dùng).

**Lý do / bối cảnh:** Thống nhất giao diện bảng trong khu vực supplier (đều dùng bảng Tailwind + `Badge`, không trộn antd Table).

**Ảnh hưởng fullstack:** Không. Thuần FE, dùng lại service hiện có.

---

## [2026-06-14 18:30] — Đồng bộ type Bảng kê chi phí với cờ khóa sửa mới

**Yêu cầu:** API transactions thêm cờ khóa sửa cho code đã trong request / đơn COMPLETED.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: `SupplierTransaction` thêm `in_request?`, `order_completed?`, `lock_reason?`; cập nhật chú thích `editable` (false khi hóa đơn MH / in_request / order_completed).

**Lý do / bối cảnh:** Backend mhvn nay set `editable=false` cho các dòng bị khóa và kèm lý do. FE Bảng kê chi phí đã khóa ô Tiền theo `editable` nên không cần đổi logic; có sẵn `lock_reason` để hiển thị lý do nếu cần.

**Ảnh hưởng fullstack:** Phụ thuộc field mới từ `GET /api/supplier/transactions` (proxy → mhvn `/api/mhcom/supplier/transactions/`).

---

## [2026-06-14 19:00] — Upload chi hộ: chọn file → xác nhận mới tải lên

**Yêu cầu:** Ở phần upload chi hộ (mhcom), hiện chọn file là upload luôn. Đổi để user chọn file, xoá được file đã chọn, bấm Xác nhận mới upload.

**Các file đã thay đổi:**
- `src/container/PaymentManagementContainer/FileUploadPanel.tsx`:
  - Bỏ upload-ngay; thêm state `staged` (file đã chọn, chưa upload). `addFiles` chỉ thêm vào danh sách chờ + lọc định dạng.
  - Thêm mục "Chờ tải lên": liệt kê file đã chọn, nút X xoá từng file + nút "Xóa hết".
  - Footer thêm nút "Xác nhận tải lên (n)" — bấm mới gọi `uploadChiHoFiles` cho toàn bộ file chờ; onSuccess dọn danh sách chờ + nạp vào "File đã tải lên".
  - Dropzone bỏ trạng thái "Đang xử lý", ghi chú rõ file chỉ tải lên sau khi Xác nhận.

**Lý do / bối cảnh:** Cho phép user kiểm tra/loại bớt file trước khi gửi, tránh upload nhầm.

**Ảnh hưởng fullstack:** Không. Vẫn dùng `POST /api/supplier/chiho-files` như cũ, chỉ khác thời điểm gọi (1 lần khi Xác nhận).

---

## [2026-06-14 20:10] — Đồng bộ panel upload chi hộ với màn list rút gọn

**Yêu cầu:** Màn list Quản lý chi hộ đã sửa để hiển thị ít thông tin hơn (Mã đơn, Mã booking, Ngày tạo, Người liên hệ). Điều chỉnh panel upload cho khớp.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: `OrderByCodeResponse` rút gọn theo response mới của A (`id, order_code, booking_bill_number, bl, created_at, created_by`); bỏ `status/order_type/customer_name/shipper/chihos`.
- `src/container/PaymentManagementContainer/index.tsx`: `orders` nay là `[OrderByCodeResponse]`; bỏ `mapChiHoToOrder`, `STATUS_BADGE` (chết); `selectedId`/`filesByOrder` key theo `id` (number); `filesQuery` + `handleFilesChange` dùng `order.id`; card mobile dùng `order_code`; bỏ import thừa (`Badge`, `PaperclipIcon`).
- `src/container/PaymentManagementContainer/FileUploadPanel.tsx`: prop `order` đổi sang `OrderByCodeResponse`; header hiển thị **Mã đơn · Mã booking (badge) · Ngày tạo · Người liên hệ**; upload/list file dùng `order.id` thay `aOrderId`; bỏ `STATUS_BADGE`/`formatVND` thừa.

**Lý do / bối cảnh:** Đơn tra cứu theo booking trả về 1 đơn; panel chỉ cần thông tin định danh đơn để đính kèm chứng từ.

**Ảnh hưởng fullstack:** Khớp response mới của `GET /api/supplier/order-by-booking` (A đã trả `created_at`/`created_by`, bỏ chihos). Không đổi cách gọi API upload.

---

## [2026-06-14 21:00] — Tooltip "Đã khoá" cho cost không sửa được (Bảng kê chi phí)

**Yêu cầu:** Ở route `supplier/cost-statement`, các cost không thể sửa khi hover vào giá hiển thị: "Đã khoá, vui lòng liên hệ MH để thay đổi".

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/index.tsx`: ô Tiền read-only (`!row.editable`) bọc trong antd `Tooltip` title "Đã khoá, vui lòng liên hệ MH để thay đổi"; thêm `cursor-not-allowed` + màu `text-muted-foreground` để báo hiệu khoá. Import thêm `Tooltip` từ antd.

**Lý do / bối cảnh:** Cost bị khoá khi đã có trong request / đơn COMPLETED / hóa đơn MH (theo `editable` từ API). Cần cho NCC biết lý do & cách xử lý.

**Ảnh hưởng fullstack:** Không. Dùng lại field `editable` (đã có) từ `GET /api/supplier/transactions`.

---

## [2026-06-14 22:30] — Nối export Excel Bảng kê chi phí với backend thật

**Yêu cầu:** Kết nối nút "Xuất Excel" màn Bảng kê chi phí với API export mới (mhvn qua MH-api).

**Các file đã thay đổi:**
- `src/services/supplier.services.ts` (`exportCostStatement`): cập nhật chú thích — backend đã hiện thực `GET /api/supplier/cost-statement/export` (proxy sang mhvn `/api/mhcom/supplier/transactions/export/`), `from`/`to` → `start_date`/`end_date`. Không đổi code gọi (đã `responseType: 'blob'`, params from/to/q).

**Lý do / bối cảnh:** Trước đó là TODO chưa có backend; nay đã có endpoint thật.

**Ảnh hưởng fullstack:** Phụ thuộc endpoint mới `GET /api/supplier/cost-statement/export?from=&to=` trả `.xlsx`. `q` chưa dùng ở export.

---

## [2026-06-14 23:10] — Bảng kê chi phí: mặc định khoảng thời gian + không cho clear; báo lỗi theo mhvn

**Yêu cầu:** Mặc định date từ ngày đầu tháng hiện tại → hôm nay, không thể clear date range. API lỗi từ mhvn thông báo theo lỗi mhvn.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/index.tsx`: thêm `getDefaultDateRange()` (đầu tháng → nay); khởi tạo `dateRange` + `queryParams` (`start_date`/`end_date`) theo khoảng mặc định; `clearAllFilters` reset date về mặc định (không về rỗng); `DateRangePicker` truyền `allowClear={false}` + `onChange` bỏ qua range rỗng.
- `src/components/DateRangePicker/index.tsx`: thêm prop `allowClear` (mặc định true) — ẩn nút "Xóa" khi `false`.

**Lý do / bối cảnh:** Màn luôn cần lọc theo khoảng thời gian, mặc định tháng hiện tại; tránh trạng thái không có khoảng.

**Ảnh hưởng fullstack:** Lỗi từ mhvn nay hiển thị đúng nhờ MH-api propagate `detail`/`error` (xem MH-api change-log). Các `notification.error` đọc `e.response.data.message` không đổi.

---

## [2026-06-15 09:30] — Nút "Xuất báo cáo kê cước & chi hộ" (màn Bảng kê chi phí)

**Yêu cầu:** Thêm tính năng xuất báo cáo kê cước & chi hộ (Excel) ở mhcom.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: thêm `exportKeCuocChiHoReport(params)` gọi `GET /supplier/cost-statement/ke-cuoc-chi-ho/export` (responseType blob).
- `src/container/CostStatementContainer/index.tsx`: thêm state `isExportingKeCuoc` + `handleExportKeCuoc` (tải file theo `dateRange`); thêm nút "Xuất báo cáo kê cước & chi hộ" cạnh nút export bảng kê (đổi nhãn nút cũ thành "Xuất bảng kê").

**Ảnh hưởng fullstack:** Phụ thuộc endpoint mới `GET /api/supplier/cost-statement/ke-cuoc-chi-ho/export?from=&to=` (proxy → mhvn `/api/mhcom/supplier/bao-cao-ke-cuoc-chi-ho/export/`). PNL lọc theo ngày container.

---

## [2026-06-15 10:30] — Filter search realtime theo từng cột (Thiết lập giá vận chuyển)

**Yêu cầu:** Thêm filter search trên các cột ở bảng thiết lập giá vận chuyển (mhcom), search realtime.

**Các file đã thay đổi:**
- `src/container/ShippingRateContainer/index.tsx`:
  - Thêm `getFilteredRowModel` + state `columnFilters` (`ColumnFiltersState`) vào `useReactTable`.
  - Hàm filter dùng chung `textIncludes` (so khớp chuỗi, không phân biệt hoa thường) gắn `filterFn` cho các cột: Dịch vụ, Loại cont, Loại hàng, Tuyến (thêm `accessorFn` = routeLabel), Đơn giá, VAT, Tiền tệ. Cột STT `enableColumnFilter: false`.
  - Thêm hàng `<th>` filter dưới header: mỗi cột có ô `Input` (placeholder "Tìm..."), gõ tới đâu lọc realtime tới đó qua `column.setFilterValue`.

**Lý do / bối cảnh:** Bảng giá dài, cần lọc nhanh theo từng cột.

**Ảnh hưởng fullstack:** Không. Lọc thuần client trên dữ liệu đã tải (`getSupplierPrices`).

---

## [2026-06-15 11:00] — Đồng bộ thiết kế bảng: Thiết lập giá ↔ Bảng kê chi phí

**Yêu cầu:** Đồng bộ thiết kế bảng giữa màn quản lý bảng kê (CostStatement) và màn thiết lập giá (ShippingRate).

**Các file đã thay đổi:**
- `src/container/ShippingRateContainer/index.tsx`: chỉnh table theo đúng style của `CostStatementContainer`:
  - Thêm component `FilterableHeader` (label + ô filter inline có icon search, placeholder "Lọc...", optional sort) giống màn Bảng kê chi phí; thay các header cũ bằng `FilterableHeader` cho mọi cột dữ liệu (Dịch vụ/Loại cont/Loại hàng/Tuyến/Đơn giá/VAT/Tiền tệ).
  - Bỏ hàng filter riêng dưới header (bản trước) — filter giờ nằm trong từng header như CostStatement; vẫn realtime qua `column.setFilterValue` + `getFilteredRowModel`.
  - `<th>` đổi `px-3 py-2 align-middle` → `px-3 align-top font-normal` cho khớp layout 2 dòng (label + ô lọc). Phần body (zebra, hover, dirty, `px-3 py-0.5`) vốn đã giống nhau.

**Lý do / bối cảnh:** Thống nhất trải nghiệm bảng trong khu vực supplier (header có ô lọc inline + sọc dòng + hover giống nhau).

**Ảnh hưởng fullstack:** Không. Thuần FE.
