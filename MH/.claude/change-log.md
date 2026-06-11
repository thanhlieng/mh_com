# Change Log — Dự án MH

File này ghi lại toàn bộ các thay đổi code do Claude thực hiện theo yêu cầu.
Mục đích: giúp team hiểu được những gì đang được làm mà không cần đọc từng diff.

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
