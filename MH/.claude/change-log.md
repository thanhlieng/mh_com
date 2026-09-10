# Change Log — Dự án MH

File này ghi lại toàn bộ các thay đổi code do Claude thực hiện theo yêu cầu.
Mục đích: giúp team hiểu được những gì đang được làm mà không cần đọc từng diff.

---

## [2026-06-25 00:00] — Chuyển hệ thống (TargetSwitcher) tự tải lại API màn hiện tại

**Yêu cầu:** Khi NCC đổi hệ thống (mhvn ↔ gp), API của màn đang xem không tự tải lại.

**Các file đã thay đổi:**
- `MH/src/components/TargetSwitcher/index.tsx` (`handleChange`): thay `queryClient.clear()` bằng `queryClient.resetQueries()`.

**Lý do / bối cảnh:** Các màn NCC cấu hình `staleTime: Infinity` + `refetchOnMount: false`. `queryClient.clear()` chỉ xoá cache chứ KHÔNG refetch các query đang active → màn hiện tại không tự tải lại sau khi đổi hệ. `resetQueries()` vừa reset dữ liệu (màn khác sẽ fetch mới khi mount) vừa refetch ngay các query đang active (màn hiện tại), bỏ qua `staleTime`. Refetch chạy sau khi đã `dispatch(setActiveTarget)` nên request mang header `X-A-Target` mới (axiosClient2 đọc target từ store lúc gửi).

**Ảnh hưởng fullstack:** Không đổi API contract.

**Yêu cầu:** Sidebar NCC đổi màu tùy hệ thống: giữ tông hiện tại cho `gp`, đổi sang tông `#1DA553` cho `mhvn`; đổi luôn các nút nhấn mạnh ở khu vực đăng nhập NCC. Đồng thời rà soát/sửa logic chọn hệ thống khi NCC chỉ liên kết 1 hệ (mhvn hoặc gp).

**Các file đã thay đổi:**
- `MH/src/container/SupplierSidebar/index.tsx`: thêm `MHVN_SIDEBAR_VARS` (override các CSS var `--sidebar-*` sang tông xanh, hsl `144 70% 38%` = `#1DA553`); gắn `style` lên `<aside>` khi `currentSystem === 'mhvn'`. `gp`/null giữ token mặc định (navy).
- `MH/src/layout/SupplierLayout.tsx`: đọc `activeTarget.current`; khi `mhvn` override `--primary`/`--ring` (`144 70% 38%`) trên vùng nội dung → các nút/nhấn mạnh (kể cả top bar mobile) đổi sang xanh. `gp` giữ nguyên.
- `MH/src/store/slices/activeTargetSlice.ts` (`hydrateFromAccountTargets`): khi account chỉ liên kết **1 hệ** → LUÔN ép `current` về đúng hệ đó (bỏ qua giá trị cũ trong localStorage). Nhiều hệ vẫn giữ lựa chọn cũ nếu còn hợp lệ.
- `MH/src/routes/withPrivateRouteSupplier.tsx`: re-hydrate danh sách hệ A (chạy nền, không chặn render) khi vào khu vực NCC mà `availableTargets` rỗng (vd sau refresh) → khôi phục `TargetSwitcher` đa hệ + re-validate `current` (single-link bị ép đúng hệ; multi-link đổi liên kết phía admin cũng được cập nhật).

**Lý do / bối cảnh:** Phân biệt trực quan 2 hệ thống mhvn/gp cho NCC; đảm bảo hệ thống đang chọn luôn đúng kể cả sau refresh hoặc khi admin đổi liên kết.

**Ảnh hưởng fullstack:** Không đổi API contract. Có gọi lại sẵn endpoint `GET /api/account/a-targets` (qua `fetchAccountTargets`) khi vào khu vực NCC sau refresh.

**Yêu cầu:** Bảng Kê cước & Chi hộ rất rộng theo chiều ngang. Cần giữ cố định (không cuộn ngang) nhóm cột từ cột đầu tiên đến "Tháng công nợ". (Đã thử cố định header khi cuộn dọc nhưng bỏ theo yêu cầu — gây rối.)

**Các file đã thay đổi:**
- `MH/src/container/CostStatementContainer/KeCuocChiHoTable.tsx`:
  - Thêm `FROZEN_COL_IDS` (12 cột thông tin luôn hiển thị: `tt`→`thang_cong_no`) + `INFO_COL_COUNT`.
  - Tính `frozenLeft` (offset `left` lũy kế từ `colWidths`, cập nhật khi resize cột) để đặt `position: sticky; left` cho từng cột đóng băng (`frozenBody` z-10 cho ô body; `FROZEN_HEADER_CLASS='sticky z-20'` + `frozenHeaderStyle` chỉ set `left` cho header).
  - Áp sticky-left cho 12 ô header + 12 ô body của nhóm cột đóng băng và ô nhãn "Tổng" của tfoot (`sticky left-0`).
  - ⚠️ Lưu ý quan trọng: tailwind config bật `important: true` → class `relative` trong `LeafTh` là `position: relative !important`, ĐÈ lên inline `position: sticky` khiến header bị trôi khi cuộn ngang (ô body `<td>` không có class position nên vẫn dính). Khắc phục: header dùng class `sticky` (cũng !important, và twMerge loại bỏ `relative`), chỉ để `left` ở inline style.
  - `LeafTh` nhận thêm prop `style`/`className`.
  - Nền header đổi `bg-muted/50` → `bg-muted` (đục) và ô đóng băng body dùng `bg-background` để khi cuộn ngang không lộ nội dung phía sau.
  - Sửa luôn lỗi cũ: `colSpan` ô "Tổng" và `totalVisibleCols` đang hardcode `15` (từ thời còn 3 cột đã bị comment) → dùng `INFO_COL_COUNT` (12) cho khớp số cột thực tế, tránh lệch các cột tổng tiền.

**Lý do / bối cảnh:** Bảng nhiều cột khó đọc khi cuộn ngang; đóng băng cột định danh giúp đối chiếu số liệu dễ hơn.

**Ảnh hưởng fullstack:** Không (chỉ thay đổi trình bày phía FE, không đụng API/DTO).

## [2026-06-16 00:00] — Nút "Tải template" dùng file Excel thật thay vì sinh CSV ở client

**Yêu cầu:** Modal Upload Excel giá ở màn Thiết lập giá vận chuyển cần tải về file mẫu thật (đã có file `de-nghi-bao-gia.xlsx`), thay cho CSV sinh runtime.

**Các file đã thay đổi:**
- `MH/public/assets/de-nghi-bao-gia.xlsx`: thêm file mẫu tĩnh (Next.js serve tại `/assets/de-nghi-bao-gia.xlsx`).
- `MH/src/container/ShippingRateContainer/UploadRateModal.tsx`: xoá hằng `TEMPLATE_HEADERS`/`TEMPLATE_SAMPLE` và logic sinh CSV bằng Blob; `handleDownloadTemplate` giờ trỏ thẳng tới file static qua thẻ `<a download>`.

**Lý do / bối cảnh:** File mẫu chính thức là `.xlsx` có định dạng sẵn, nên phục vụ dưới dạng static asset thay vì dựng CSV thô ở client.

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

## [2026-06-18 22:30] — Tab "Kê cước & chi hộ" (bảng pivot theo container) ở màn cost-statement

**Yêu cầu:** Đổi UI bảng màn /supplier/cost-statement giống file Excel "Báo cáo kê cước và chi hộ" — pivot theo container, nhiều cột tiền nhóm Cước / Chi hộ MH / Chi hộ KH; cho sửa các ô nhóm Cước qua luồng đề nghị thay đổi. Thêm dạng tab mới (giữ bảng phẳng cũ).

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: thêm type `KeCuocChiHoRow`/`KeCuocChiHoResponse` + hàm `getSupplierKeCuocChiHo({from,to})` gọi `GET /api/supplier/transactions/ke-cuoc-chi-ho`.
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx` (mới): bảng header gộp 2 dòng (Cước / CHI HỘ về MH / CHI HỘ về KH), ô nhóm Cước sửa được (chỉ khi đơn chưa hoàn tất & ô có đúng 1 pnl), gửi đề nghị thay đổi qua `createChangeRequest`; dòng tổng cuối bảng; nút xuất Excel + lọc theo khoảng ngày (ngày container).
- `src/container/CostStatementContainer/index.tsx`: thêm tab thứ ba `kecuoc`, render `<KeCuocChiHoTable />`; ẩn nút "Tải lại" ở header khi ở tab này (tab tự có nút tải lại).

**Lý do / bối cảnh:** Người dùng muốn bảng trên màn khớp layout Excel; mỗi cột có số là tiền. Logic cột tiền giữ giống API Excel, chỉ khác bộ lọc thời gian dùng container.date.

**Ảnh hưởng fullstack:** Phụ thuộc endpoint mới `GET /api/supplier/transactions/ke-cuoc-chi-ho?from=&to=` (MH-api) → proxy `GET /api/mhcom/supplier/ke-cuoc-chi-ho/` (hệ thống A). Sửa ô Cước dùng lại `POST /api/supplier/change-requests`.

## [2026-06-18 23:10] — Tinh chỉnh bảng "Kê cước & chi hộ"

**Yêu cầu:** Ẩn cột Khách hàng (và API không trả), thu nhỏ cột Số tờ khai, mở rộng cột Tuyến, cột Phát sinh không cho sửa, thêm tìm kiếm real-time ở cột Mã ĐH/Số book-Bill/Số cont/Tuyến, format cột Ngày dạng ngày/tháng.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: bỏ cột Khách hàng; `SearchHeader` lọc real-time (client) cho Mã ĐH/Số book-Bill/Số cont/Tuyến (`filteredRows`); cột Phát sinh chuyển read-only (loại khỏi `CUOC_FIELDS`, render `Money`); width Tuyến lớn hơn / Số tờ khai nhỏ hơn; `formatNgay` → `dd/MM/yyyy`; tổng & đếm theo `filteredRows`.
- `src/services/supplier.services.ts`: bỏ field `khach_hang` khỏi `KeCuocChiHoRow`.

**Ảnh hưởng fullstack:** API A không còn trả `khach_hang` ở `GET /api/mhcom/supplier/ke-cuoc-chi-ho/`.

## [2026-06-18 23:40] — Bảng "Kê cước & chi hộ": cột co giãn + Ngày dạng ngày/tháng

**Yêu cầu:** Format cột Ngày dạng ngày/tháng (không năm); cho phép kéo giãn độ rộng các cột.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: `formatNgay` → `dd/MM`; thêm `LEAF_COLS` (id + width mặc định), state `colWidths` + `onResize`, component `Resizer` (kéo cạnh phải) và `LeafTh`; bảng dùng `<colgroup>` + `table-layout:fixed` (width = tổng cột) để cột resizable độc lập header gộp; ô `Text`/`Money` thêm `truncate`.

**Ảnh hưởng fullstack:** Không. Thuần FE.

## [2026-06-18 23:55] — Bảng "Kê cước & chi hộ": chọn phần hiển thị (Cả hai / Cước / Chi hộ)

**Yêu cầu:** Có cách để hiển thị chỉ phần Chi hộ, hoặc chỉ phần Cước, hoặc cả hai.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: thêm state `section` ('both'|'cuoc'|'chiho') + segmented control 3 nút ở thanh lọc; suy ra `showCuoc`/`showChiHo`; lọc `visibleLeafCols` (colgroup), `visibleMoneyCols` (dòng tổng), `totalVisibleCols` (empty state); header ẩn nhóm Cước/Chi hộ theo lựa chọn và `headerRowSpan` co về 1 dòng khi chỉ hiện Cước (không còn header gộp 2 tầng); body ẩn các ô tương ứng. Cột thông tin luôn hiển thị.

**Ảnh hưởng fullstack:** Không. Thuần FE.

## [2026-06-19 00:15] — Bảng "Kê cước & chi hộ": cột "Tải file chi hộ" + modal upload

**Yêu cầu:** Thêm cột cuối (thuộc phần Chi hộ), mỗi dòng có nút mở modal upload file chi hộ (giống modal ở /supplier/payment-management) nhưng CHỈ hiển thị file user muốn tải lên (không hiện file đã upload trước đó). Khi đóng modal, nếu còn ở màn này thì hiển thị số file vừa upload.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/ChiHoUploadModal.tsx` (mới): slide-over upload (dropzone + chọn file/thư mục + danh sách staged + xác nhận tải lên) dùng `uploadChiHoFiles(orderId, files)`. KHÔNG fetch/hiển thị file đã upload. Báo `onUploaded(total)` số file đã tải (cộng dồn trong phiên) + dòng "Đã tải lên N file".
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: thêm leaf col `upload` (cuối, thuộc nhóm Chi hộ → chỉ hiện khi `showChiHo`); header "Tải file chi hộ"; mỗi dòng có nút "Tải lên" mở `ChiHoUploadModal` (disable khi thiếu `order_id`), kèm Badge số file đã upload theo đơn (`uploadedCounts`); cập nhật `visibleLeafCols`/`totalVisibleCols`/footer (thêm 1 cột khi hiện Chi hộ); state `uploadRow` + `uploadedCounts`.

**Ảnh hưởng fullstack:** Dùng lại endpoint sẵn có `POST /api/supplier/chiho-files` (qua `uploadChiHoFiles`). Không thêm endpoint mới.

## [2026-06-19 00:45] — File chi hộ gắn theo container (không theo đơn)

**Yêu cầu:** Mỗi file tải lên ứng theo container (order_container) + mã đơn, không phải theo đơn hàng.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: `uploadChiHoFiles(orderId, files, orderContainerId?)` thêm `order_container_id` vào form; type `KeCuocChiHoRow` thêm `order_container_id`.
- `src/container/CostStatementContainer/ChiHoUploadModal.tsx`: nhận `orderContainerId`/`containerNo`, upload gắn container; header hiển thị số container.
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: nút "Tải lên" + badge số file đếm theo `order_container_id` (không theo `order_id`); disable khi thiếu container; truyền container vào modal.

**Ảnh hưởng fullstack:** Upload `POST /api/supplier/chiho-files` nay nhận thêm field `order_container_id`. API A `GET /api/mhcom/supplier/ke-cuoc-chi-ho/` trả thêm `order_container_id` mỗi dòng.

## [2026-06-19 01:00] — Bảng "Kê cước & chi hộ": loading rõ ràng hơn

**Yêu cầu:** Thêm loading dễ thấy cho bảng mới vì API có thể tải lâu.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: lần tải đầu (`apiQuery.isLoading`) hiển thị panel loading lớn (spinner 9x9 + chú thích) thay cho bảng; khi tải lại (đã có dữ liệu) hiển thị overlay spinner mờ phủ lên bảng (`apiQuery.isFetching`).

**Ảnh hưởng fullstack:** Không. Thuần FE.

## [2026-06-19 01:30] — Quản lý chi hộ: dòng con container + upload theo container

**Yêu cầu:** Khi tra cứu đơn ở /supplier/payment-management, API trả thêm danh sách container của đơn (chỉ container mà supplier có PNL). Hiển thị container làm dòng con (mặc định mở). Bấm container → modal upload file chi hộ theo container, giữ số file đã upload khi còn ở màn.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: type `OrderContainerRow` + `OrderByCodeResponse.containers?`.
- `src/container/PaymentManagementContainer/index.tsx`: dòng con container (desktop: child rows có chevron mở/đóng mặc định mở; mobile: list trong card); nút "Tải file" mỗi container mở `ChiHoUploadModal` (dùng lại từ CostStatementContainer), badge số file đã upload theo `container.id` (`containerUploadedCounts`); giữ panel upload theo đơn cũ.

**Ảnh hưởng fullstack:** `GET /api/supplier/order-by-booking` (proxy A `GET /api/mhcom/supplier/order-by-booking/`) nay trả thêm `containers[]`. Upload dùng `POST /api/supplier/chiho-files` với `order_container_id` (đã có).

## [2026-06-19 02:00] — Hủy upload theo container (giữ upload theo đơn); container chỉ là UI

**Yêu cầu:** Không thêm cột DB; upload giữ nguyên logic theo đơn. Container chỉ để NCC biết đang upload cho container nào; bấm container mở modal upload (không hiển thị file đã upload trước).

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: `uploadChiHoFiles(orderId, files)` bỏ tham số `orderContainerId` (upload theo đơn như cũ).
- `src/container/CostStatementContainer/ChiHoUploadModal.tsx`: bỏ prop `orderContainerId`; upload chỉ theo `orderId`; `containerNo` chỉ để hiển thị.
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: bỏ truyền `orderContainerId` vào modal; nút "Tải lên" disable theo `order_id`; badge số file vẫn đếm cục bộ theo `order_container_id`.
- `src/container/PaymentManagementContainer/index.tsx`: bỏ truyền `orderContainerId`; badge đếm cục bộ theo `container.id`.

**Ảnh hưởng fullstack:** `POST /api/supplier/chiho-files` không còn gửi `order_container_id` (quay lại chỉ `order_id`).

## [2026-06-19 02:40] — Kê cước & chi hộ: hiển thị số file theo trạng thái duyệt (cột tải lên + modal)

**Yêu cầu:** Cột upload OrderChiHo (tab "Kê cước & chi hộ") hiển thị số file Đã duyệt / Chờ duyệt / Từ chối; modal upload cũng hiển thị 3 con số này.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: `KeCuocChiHoRow` thêm `file_counts {approved,pending,rejected}`.
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: cột "Tải lên" thêm 3 chip trạng thái (xanh/vàng/đỏ) từ `file_counts`; thay `uploadedCounts` (theo container) bằng `pendingDelta` theo **order_id** (file vừa upload là Chờ duyệt → cộng vào pending hiển thị mà không cần refetch); truyền `counts` vào modal; `onUploaded(added)` cộng dồn pending.
- `src/container/CostStatementContainer/ChiHoUploadModal.tsx`: prop `counts` (hiển thị 3 ô trạng thái) + `onUploaded(addedCount)`; bỏ `initialUploadedCount`; dòng "vừa tải lên N file (đang chờ duyệt)".
- `src/container/PaymentManagementContainer/index.tsx`: cập nhật theo chữ ký `onUploaded(added)` mới.

**Ảnh hưởng fullstack:** `GET /api/supplier/transactions/ke-cuoc-chi-ho` (proxy A `GET /api/mhcom/supplier/ke-cuoc-chi-ho/`) nay trả thêm `file_counts` mỗi dòng.

## [2026-06-19 03:10] — Modal upload: liệt kê file theo từng trạng thái + thanh cuộn ngang trên bảng

**Yêu cầu:** Modal upload hiển thị danh sách file trong từng trạng thái (không chỉ con số); đặt thêm thanh cuộn ngang phía trên bảng "Kê cước & chi hộ" cho dễ cuộn.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/ChiHoUploadModal.tsx`: fetch `listChiHoFiles(orderId)`, nhóm theo `approval_status` (Đã duyệt/Chờ duyệt/Từ chối) và liệt kê từng file (tên + thời gian + link Xem); refetch sau khi upload; bỏ prop `counts` (tự lấy từ list).
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: thêm thanh cuộn ngang phía trên bảng (`topScrollRef`) đồng bộ `scrollLeft` 2 chiều với vùng bảng (`bodyScrollRef`); bỏ truyền prop `counts` cho modal; reset `pendingDelta` khi dữ liệu refetch (tránh đếm trùng file vừa upload).

**Ảnh hưởng fullstack:** Không (dùng lại `GET /api/supplier/chiho-files?order_id=`). Thuần FE.

## [2026-06-19 03:25] — Kê cước & chi hộ: không tự tải lại khi chuyển/focus lại tab

**Yêu cầu:** Mỗi lần chuyển tab rồi quay lại tab "Kê cước & chi hộ" thì list bị tải lại — tắt việc tự tải lại đó.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`: query `supplier-ke-cuoc-chi-ho` thêm `refetchOnWindowFocus: false`, `refetchOnMount: false`, `staleTime: Infinity` → dùng cache khi quay lại tab; làm mới chỉ qua nút "Tải lại" hoặc đổi bộ lọc.

**Ảnh hưởng fullstack:** Không. Thuần FE.

## [2026-06-19 04:10] — Nút "Hủy đề nghị" gọi API xóa (tab Đề nghị thay đổi)

**Yêu cầu:** Nút xóa đề nghị PENDING ở tab "Đề nghị thay đổi" (màn /cost-statement) cần gọi API thật.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`: thêm `deleteChangeRequest(id)` → `DELETE /supplier/change-requests/:id`.
- `src/container/CostStatementContainer/index.tsx`: `handleCancelRequest` nay dùng mutation `deleteChangeRequest` (trước đây là TODO no-op), invalidate `supplier-change-requests` + thông báo thành công/lỗi. Nút "Hủy đề nghị" trong `ChangeRequestList` (chỉ hiện khi trạng thái "Chờ duyệt") đã có sẵn.

**Ảnh hưởng fullstack:** Dùng `DELETE /api/supplier/change-requests/:id` (proxy sang A). Chỉ xóa được đề nghị PENDING của chính supplier.

## [2026-06-23 23:44] — Thêm cột "Chi hộ về" cuối nhóm Chi hộ ở màn /supplier/cost-statement (tab Kê cước & Chi hộ)

**Yêu cầu:** Hiển thị thêm cột "Chi hộ về" ở cuối phần chi hộ. Nếu `order.chi_ho_for === 'kh'` thì show `customer.company_name - customer.tax_number - customer.address`.

**Các file đã thay đổi:**
- `MH/src/services/supplier.services.ts` (interface `KeCuocChiHoRow`): thêm field `chi_ho_ve: string`.
- `MH/src/container/CostStatementContainer/KeCuocChiHoTable.tsx`:
  - `LEAF_COLS`: thêm `{ id: 'chi_ho_ve', w: 240 }` ngay trước `upload`.
  - `visibleLeafCols` filter: thêm điều kiện `c.id === 'chi_ho_ve'` để cột này chỉ hiện khi `showChiHo`.
  - `totalVisibleCols`: cộng thêm 1 cột phi-tiền khi `showChiHo` (từ `+1` → `+2`).
  - `<thead>`: thêm `LeafTh id='chi_ho_ve'` rowSpan=2, label "Chi hộ về", đặt giữa "Tổng chi hộ về KH" và cột "Tải file chi hộ".
  - `<tbody>`: thêm `<td>` render `row.chi_ho_ve` (wrap text, tooltip = full string, fallback "—").
  - `<tfoot>`: thêm 1 `<td>` trống nữa cho cột "Chi hộ về" trong dòng tổng.

**Lý do / bối cảnh:** NCC cần biết khoản chi hộ này là chi hộ cho đối tượng nào (KH/MH) ngay trên bảng kê. Hiện tại mới hiển thị cho `chi_ho_for === 'kh'` (KH = khách hàng) — show thông tin định danh khách hàng. Các giá trị khác để rỗng.

**Ảnh hưởng fullstack:** Endpoint `GET /api/supplier/transactions/ke-cuoc-chi-ho` (proxy → A: `/api/mhcom/supplier/ke-cuoc-chi-ho/`) bổ sung field `chi_ho_ve: string` trong mỗi item của `results[]`. Backend A đã cập nhật ở `mhcom/supplier_kecuoc_chiho_views.py` (build_kecuoc_chiho_rows). Backend B (NestJS) chỉ proxy nên không cần đổi.

## [2026-06-24 01:43] — Tab "Danh sách yêu cầu tải lên": cho phép xoá yêu cầu PENDING

**Yêu cầu:** Trên màn `/supplier/payment-management` tab "Danh sách yêu cầu tải lên" cần thêm action xoá các yêu cầu có `approval_status === 'PENDING'`.

**Các file đã thay đổi:**
- `MH/src/services/supplier.services.ts`: thêm hàm `deleteChiHoUpload(fileId)` gọi `DELETE /supplier/chiho-files/uploads/:id` (proxy sang mhvn).
- `MH/src/container/PaymentManagementContainer/UploadRequestsTab.tsx`:
  - Import thêm `Popconfirm`, `notification` (antd), `useMutation`/`useQueryClient` (react-query), `Trash2Icon`.
  - Thêm `useMutation(deleteChiHoUpload)`: thành công → toast + invalidate `chiho-uploads` và `supplier-ke-cuoc-chi-ho` (để counters Chờ duyệt ở bảng kê tự cập nhật); lỗi → toast `detail`/`message` từ A.
  - Thêm cột "Hành động" cuối bảng. Chỉ hàng `PENDING` mới hiện nút xoá (dấu thùng rác đỏ) bọc trong `Popconfirm` xác nhận; các trạng thái khác hiển thị `—`.

**Lý do / bối cảnh:** NCC cần huỷ yêu cầu vừa upload nhầm khi chưa được mhgs duyệt. Sau khi duyệt (APPROVED/REJECTED) không được xoá để giữ audit trail — backend enforce điều này.

**Ảnh hưởng fullstack:** Phụ thuộc endpoint mới `DELETE /api/supplier/chiho-files/uploads/:id` ở MH-api (proxy → mhvn `DELETE /api/mhcom/supplier/chiho-files/<id>/`). Response 204 No Content; lỗi 400 nếu đã APPROVED/REJECTED, 404 nếu file không thuộc supplier.

## [2026-06-24 02:13] — Xem/tải file Chi hộ qua proxy MH-api (axios + JWT mhcom)

**Yêu cầu:** Sửa lỗi không xem/tải được file Chi hộ ở mhcom (do `file_url` trả về là path `/media/...` của hệ thống A).

**Các file đã thay đổi:**
- `MH/src/services/supplier.services.ts`: thêm `downloadChiHoUpload(fileId, disposition)` — gọi `GET /supplier/chiho-files/uploads/:id/download` với `responseType: 'blob'`, trả `Blob` để caller tự `URL.createObjectURL`.
- `MH/src/container/PaymentManagementContainer/UploadRequestsTab.tsx`:
  - Thêm 2 helper `openChiHoBlob(fileId)` (mở tab mới — `disposition=inline`) và `downloadChiHoBlob(fileId, fileName)` (ép tải — `disposition=attachment`); revoke object URL sau 60s/ngay sau click để khỏi rò RAM.
  - Bỏ `openFile(url)` và `<a download href={r.file_url}>` cũ.
  - Thêm state `busyIds` để disable nút trong lúc fetch (tránh double-click) và spinner cho nút xem.
  - Wrap action qua `runFileAction` (try/catch + toast lỗi từ A: `detail`/`message`).
- `MH/src/container/PaymentManagementContainer/FileUploadPanel.tsx`: `handleDownload` nay dùng `downloadChiHoUpload` (xoá TODO cũ); giữ điều kiện `disabled={!file.url}` để chỉ tải file đã upload thực sự (không tải file đang chờ upload).

**Lý do / bối cảnh:** FE mhcom và A là 2 host khác nhau, FE cũng không gắn được supplier token vào `window.open`/`<a download>` → bắt buộc fetch blob qua axios (MH-api proxy sang A). Đồng thời tuân thủ nguyên tắc kiến trúc "FE B không gọi thẳng A".

**Ảnh hưởng fullstack:** Phụ thuộc endpoint mới ở MH-api: `GET /api/supplier/chiho-files/uploads/:id/download?disposition=inline|attachment` (proxy → `/api/mhcom/supplier/chiho-files/<id>/download/` ở A). Response = binary stream. Lỗi sẽ trả JSON `{ detail }` từ A — interceptor đã xử lý.

## [2026-06-24 02:38] — Xem/tải file Chi hộ: prefix host mhvn vào file_url (bỏ proxy blob)

**Yêu cầu:** Đơn giản hoá — `/media/` ở mhvn public, chỉ cần prepend host FE của mhvn (mhgs_log_be) vào `file_url`, không cần fetch blob qua axios.

**Các file đã thay đổi:**
- `MH/src/services/supplier.services.ts`:
  - Bỏ hàm `downloadChiHoUpload` (blob qua proxy).
  - Thêm constant `MHGS_HOST = process.env.NEXT_PUBLIC_MHGS_HOST ?? ''`.
  - Thêm helper `resolveChiHoFileUrl(fileUrl)`: nếu absolute (http/https) → giữ nguyên; nếu relative → prepend `MHGS_HOST`; null/empty → trả null.
- `MH/src/container/PaymentManagementContainer/UploadRequestsTab.tsx`:
  - Bỏ `openChiHoBlob`, `downloadChiHoBlob`, state `busyIds`, helper `runFileAction`, spinner.
  - Thay bằng `openFile(url)` dùng `resolveChiHoFileUrl` rồi `window.open`.
  - Nút tải dùng `<a download href={resolveChiHoFileUrl(r.file_url)}>` như cũ.
- `MH/src/container/PaymentManagementContainer/FileUploadPanel.tsx`: `handleDownload` dùng `resolveChiHoFileUrl(file.url)` rồi tạo `<a download>`; bỏ async/blob.

**Lý do / bối cảnh:** mhvn phục vụ `/media/...` public không cần auth, FE có thể request thẳng. Cấu hình host qua env `NEXT_PUBLIC_MHGS_HOST` (vd `https://mhvn.example.com`); thiếu env → dùng path tương đối (hợp khi mhvn và mhcom cùng domain qua reverse-proxy).

**Ảnh hưởng fullstack:** Bỏ phụ thuộc endpoint `GET /api/supplier/chiho-files/uploads/:id/download` ở MH-api (đã revert ở MH-api). Cần set env `NEXT_PUBLIC_MHGS_HOST` ở môi trường staging/prod (Dockerfile/docker-compose) để FE biết gọi host nào.

## [2026-06-26 03:24] — Trang mới: /supplier/quality-reports (Báo cáo chất lượng)

**Yêu cầu:** Theo file `mhgs_log_be/docs/excel_123_structure.md`. NCC (mhcom) có thể gửi báo cáo chất lượng tới MHVN/GP, đồng thời tiếp nhận yêu cầu MHVN/GP gửi về NCC. 2 tab (gửi/nhận); pagination + filter (thời gian, trạng thái, mức độ).

**Các file đã thay đổi:**
- `src/pages/supplier/quality-reports.tsx` (mới): page sử dụng `SupplierLayout`, dynamic-import container.
- `src/container/QualityReportsContainer/index.tsx` (mới): UI 2 tab, wrap bằng `withPrivateRouteSupplier`.
- `src/container/QualityReportsContainer/QualityReportsTable.tsx` (mới): Ant Design Table + filter (DatePicker range, Select trạng thái/mức độ), pagination 10/20/50/100; nút tạo (tab gửi); thao tác Sửa/Xóa (chỉ khi `can_edit`); thao tác Tiếp nhận/Đã xử lý/Từ chối (tab nhận, chỉ khi `trang_thai='notified'`).
- `src/container/QualityReportsContainer/QualityReportFormModal.tsx` (mới): Ant Design Form Modal có DatePicker cho ngày, Input/TextArea cho text, Select cho mức độ.
- `src/container/QualityReportsContainer/types.ts` (mới): SEVERITY_OPTIONS, STATUS_OPTIONS, helpers.
- `src/services/supplier.services.ts` (cuối file): thêm types + service functions `listQualityReports`/`getQualityReport`/`createQualityReport`/`updateQualityReport`/`deleteQualityReport`/`changeQualityReportStatus`/`getQualityReportOptions`. Gọi backend MH-api `/api/supplier/quality-reports/*`.
- `src/routes/routes.tsx` (line 190): thêm `SUPPLIER_QUALITY_REPORTS = '/supplier/quality-reports'`.
- `src/container/SupplierSidebar/index.tsx`: thêm icon `ClipboardListIcon` + menu item "Báo cáo chất lượng".

**Lý do / bối cảnh:** Spec yêu cầu UI nằm trên cả phía mhcom (NCC) và mhvn/gp (MH-logistic). Phía mhcom: NCC tự gửi → mặc định `Đã gửi báo cáo`; có thể sửa/xóa khi vẫn đang gửi. NCC tiếp nhận báo cáo MHVN tạo (mặc định `Đã thông báo NCC`) → chuyển sang `Đã tiếp nhận` / `Đã xử lý` / `Từ chối xử lý`.

**Ảnh hưởng fullstack:**
- Yêu cầu MH-api có module `supplier-quality-reports` (đã thêm cùng phiên).
- Cần header `X-A-Target` (mhvn|gp) — đã được Redux/Sidebar quản lý sẵn qua `activeTargetSlice` + axios interceptor như các module supplier khác.


## [2026-06-26 11:30] — Redesign bảng /supplier/quality-reports cho giống các bảng supplier khác

**Yêu cầu:** Bảng tại /supplier/quality-reports đang dùng Ant Design Table — thiết kế lại cho giống các bảng supplier khác (PriceChangeList, ChangeRequestList) cho đẹp hơn.

**Các file đã thay đổi:**
- `src/container/QualityReportsContainer/types.ts` (toàn file): đổi `SEVERITY_OPTIONS` / `STATUS_OPTIONS` từ `color: string` (kiểu antd) sang `variant: BadgeVariant` (kiểu shadcn `@/components/ui/badge`); export `severityVariant` / `statusVariant` thay cho `severityColor` / `statusColor`.
- `src/container/QualityReportsContainer/QualityReportsTable.tsx` (rewrite): bỏ `<Table>` của antd, dùng native HTML `<table>` + Tailwind theo pattern của `SupplierPriceChangeContainer/PriceChangeList`. Filter bar đổi sang filter pills (rounded-full) cho status + severity, giữ `DatePicker.RangePicker` antd cho ngày, thêm nút "Tải lại" + nút primary "Gửi báo cáo" với icon lucide. Pagination antd (size small) đặt cuối table. Badge dùng `@/components/ui/badge` với variant; Button dùng `@/components/ui/button`. Cell mô tả/nguyên nhân/biện pháp dùng line-clamp 2 dòng với `title` tooltip. Hover row, zebra rows, tabular-nums cho ngày.

**Lý do / bối cảnh:** Pattern UI hiện tại của các bảng supplier (PriceChangeList, ChangeRequestList, KeCuocChiHoTable) đã chuyển sang native table + shadcn components để đồng bộ trải nghiệm và giảm phụ thuộc antd. QualityReports vẫn còn dùng antd Table cũ → không nhất quán visual + filter UI rườm rà với multi-select dropdown. Sau đổi: cùng style với các trang khác, filter trực quan hơn, hover/zebra rõ hơn.

**Ảnh hưởng fullstack:** Không. Chỉ thay đổi tầng UI; logic gọi `listQualityReports` / `deleteQualityReport` / `changeQualityReportStatus` giữ nguyên, contract API không đổi.


## [2026-06-26 12:10] — Bổ sung nút "Xem chi tiết" + cho phép chuyển trạng thái từ "Đã tiếp nhận"

**Yêu cầu:** Bảng /supplier/quality-reports thêm nút xem chi tiết báo cáo (modal read-only), đảm bảo bảng horizontal scroll mượt, và cho phép NCC chuyển trạng thái từ "Đã tiếp nhận" sang "Đã xử lý" hoặc "Từ chối" (trước đó chỉ làm được từ "Đã thông báo NCC").

**Các file đã thay đổi:**
- `src/container/QualityReportsContainer/QualityReportDetailModal.tsx` (mới): modal antd hiển thị toàn bộ field của báo cáo (ngày phát sinh, mức độ, khách hàng, trạng thái, deadline, ngày hoàn thành, mô tả lỗi, ảnh hưởng, nguyên nhân, biện pháp khắc phục/phòng ngừa, ghi chú, người tạo, ngày tạo). Dùng shadcn `Badge` cho mức độ/trạng thái, layout grid 2 cột cho meta + text block cho các trường dài.
- `src/container/QualityReportsContainer/QualityReportsTable.tsx`:
  - Import `EyeIcon` + `QualityReportDetailModal`, thêm state `viewing`.
  - Rewrite `renderActions`: nút "Xem" luôn render cho mọi row (cả tab `sent` lẫn `received`). Tab `sent`: thêm Xem cạnh Sửa/Xóa khi `can_edit`. Tab `received`: bỏ guard cứng `row.trang_thai !== 'notified'`, thay bằng (a) `notified` → Tiếp nhận + Đã xử lý + Từ chối, (b) `received` → Đã xử lý + Từ chối, (c) `processed`/`rejected` → chỉ Xem.
  - Wrapper bảng đổi sang `max-w-full overflow-x-auto` để đảm bảo scroll ngang xảy ra trong khung table, không tràn page (bảng có `min-w-[1600px]`).
  - Mount `<QualityReportDetailModal>` cuối container.

**Lý do / bối cảnh:** (1) BE đã cho phép NCC chuyển từ bất kỳ status nào trong `{received, processed, rejected}` (`mhcom/supplier_quality_report_views.py` — `ALLOWED_NCC_STATUS_FOR_MHVN_REPORT`), nhưng FE đang chặn ở client. (2) Bảng có nhiều cột nhưng các action chính (Sửa/Xóa/đổi trạng thái) chỉ phụ trợ — user cần một modal đọc rõ toàn bộ nội dung báo cáo, đặc biệt các trường textarea dài bị ellipsis 2 dòng trong cell. (3) Bảng dùng `min-w-[1600px]` đôi khi tràn ra ngoài container do thiếu `max-w-full` ở wrapper ngoài.

**Ảnh hưởng fullstack:** Không thay đổi contract. Endpoint `POST /api/mhcom/supplier/quality-reports/<id>/status/` đã hỗ trợ sẵn `received → processed/rejected`.


## [2026-06-26 12:35] — Tăng vùng cuộn ngang cho bảng /supplier/quality-reports

**Yêu cầu:** Bảng tại /supplier/quality-reports cần cuộn ngang được nhiều hơn để xem dữ liệu thoải mái.

**Các file đã thay đổi:**
- `src/container/QualityReportsContainer/QualityReportsTable.tsx`:
  - `table.min-w-[1600px]` → `min-w-[2400px]` để bảng luôn rộng hơn viewport thông dụng → wrapper `overflow-x-auto` luôn kích hoạt scroll ngang.
  - Tăng max-width line-clamp cho cell text dài: mô tả lỗi 260 → 360, ảnh hưởng/nguyên nhân/biện pháp 220 → 320, ghi chú 200 → 280 (text dễ đọc trong cell, không bị bóp chật).
- `src/container/QualityReportsContainer/index.tsx`:
  - Outer container đổi `space-y-4 p-4 md:p-6` → `flex min-w-0 max-w-full flex-col gap-4 p-4 md:p-6` để đảm bảo flex child có thể shrink (cần `min-w-0` để overflow-x-auto của bảng hoạt động đúng trong flex layout).
  - Wrap `<Tabs>` trong `<div className='min-w-0 max-w-full'>` để Tabs panel không bị table bên trong đẩy rộng.

**Lý do / bối cảnh:** SupplierLayout dùng `flex flex-col overflow-hidden` + `<main overflow-y-auto>` (chỉ scroll Y) → nếu container con không có `min-w-0` thì children với `min-w-[2400px]` có thể đẩy main expand thay vì để wrapper inner overflow-x-auto cuộn. Thêm `min-w-0` + `max-w-full` ở các tầng container đảm bảo chỉ có wrapper bảng được phép scroll ngang.

**Ảnh hưởng fullstack:** Không. Chỉ thay đổi layout/CSS.


## [2026-06-26 12:55] — Sticky cột "Thao tác" cuối bảng /supplier/quality-reports

**Yêu cầu:** Khi cuộn ngang bảng, cột thao tác cuối cùng phải luôn hiển thị để thao tác được ở bất kỳ vị trí scroll nào.

**Các file đã thay đổi:**
- `src/container/QualityReportsContainer/QualityReportsTable.tsx`:
  - `<th>` Thao tác: thêm `sticky right-0 z-20 min-w-[260px] border-l border-border bg-muted/40` + shadow trái nhẹ (`shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]`) tạo visual separator với vùng scroll.
  - `<tr>` body: thêm class `group` để hover propagate vào sticky cell.
  - `<td>` Thao tác: thêm `sticky right-0 z-10 border-l border-border shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]` + bg explicit theo zebra (`bg-background` chẵn / `bg-muted/10` lẻ) + `group-hover:bg-accent/40` để hover row vẫn áp dụng được trên cell sticky.

**Lý do / bối cảnh:** Bảng có `min-w-[2400px]` → khi cuộn ngang xa thì cột thao tác (cuối cùng) bị khuất, không click được nếu không cuộn về cuối. Sticky-right giải quyết bằng cách pin cột thao tác. Phải set bg explicit cho cell sticky (bằng zebra của row) vì sticky element transparent sẽ thấy các cell phía sau khi scroll. Shadow trái tạo cảm giác cột "nổi" tách khỏi vùng cuộn.

**Ảnh hưởng fullstack:** Không. Chỉ CSS.


## [2026-06-26 13:05] — Fix nền cột "Thao tác" sticky không bị xuyên thấu

**Yêu cầu:** Cột thao tác sticky vẫn nhìn xuyên thấy nội dung cột phía sau khi cuộn ngang.

**Các file đã thay đổi:**
- `src/container/QualityReportsContainer/QualityReportsTable.tsx`:
  - `<th>` Thao tác: `bg-muted/40` → `bg-muted` (solid).
  - `<td>` Thao tác: bỏ zebra `bg-background` / `bg-muted/10` (cái `/10` là alpha → xuyên thấu), luôn dùng `bg-background` (solid). Hover state đổi `group-hover:bg-accent/40` → `group-hover:bg-accent` (solid).

**Lý do / bối cảnh:** Sticky cell cần nền đục hoàn toàn — bất kỳ class màu có alpha (`/40`, `/10`, …) đều xuyên thấu thấy nội dung cell scroll phía sau. Pattern này đã có ghi chú rõ trong `KeCuocChiHoTable.tsx` ("Nền header phải đục bg-muted, không phải /50").

**Ảnh hưởng fullstack:** Không. Chỉ CSS.


## [2026-06-26 13:30] — Sticky header bảng "Kê cước & Chi hộ" khi cuộn dọc

**Yêu cầu:** Bảng kê cước & chi hộ (`/supplier/bang-ke-chi-phi` → tab "Bảng kê") header phải luôn hiển thị khi cuộn dọc xuống dưới.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`:
  - `TH` constant: thêm `sticky top-0 z-20` → mọi `<th>` cells pin đỉnh wrapper scroll Y.
  - `LeafTh`: bỏ class `relative` (sticky đã đóng vai trò containing block cho Resizer absolute, lại tránh conflict với `sticky` vì tailwind `important: true`).
  - `FROZEN_HEADER_CLASS`: `'sticky z-20'` → `'z-30'` (sticky đã có từ TH; chỉ cần raise z để corner cell top-left đè lên header thường khi cả 2 cùng sticky).
  - Outer table area: `flex-1 overflow-auto` → `flex min-h-0 flex-1 flex-col overflow-hidden` để biến wrapper bodyScrollRef thành viewport scroll Y nội bộ (cha là flex column).
  - `bodyScrollRef` wrapper: `overflow-x-auto` → `min-h-0 flex-1 overflow-auto` để scroll cả 2 trục trong khung wrapper (sticky thead pin chỉ kick in khi nearest scrolling ancestor là wrapper, không phải outer parent).
  - `topScrollRef` wrapper: thêm `shrink-0` để không bị flex bóp khi wrapper bodyScrollRef chiếm flex-1.

**Lý do / bối cảnh:** Layout cũ outer = scroll Y, wrapper inner = scroll X. `position: sticky` của thead pin theo nearest scrolling ancestor. Theo CSS spec, `overflow-x: auto` + `overflow-y: visible` được browser computed thành cả hai = auto → wrapper inner đã là scroll ancestor — NHƯNG nội dung wrapper fit chiều cao nên không scroll Y nội bộ, mà thực sự outer mới scroll Y → khi user cuộn outer, wrapper di chuyển theo, thead di chuyển theo wrapper → thead không sticky. Fix: chuyển scroll Y xuống wrapper inner bằng flex chain (outer flex column overflow-hidden, wrapper flex-1 min-h-0 overflow-auto). Sau đó wrapper là scroll viewport thật → sticky thead top-0 pin đúng.

**Ảnh hưởng fullstack:** Không. Chỉ CSS/layout.


## [2026-06-26 13:50] — Fix: 2 dòng group header bị đè khi sticky top

**Yêu cầu:** Dòng "CHI HỘ MH (có VAT)" và "CHI HỘ XUẤT KHÁCH HÀNG (có VAT)" bị ẩn khi cuộn dọc — sticky trước đó chỉ thấy 1 dòng leaf header.

**Các file đã thay đổi:**
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`:
  - Chuyển sticky-top từ TỪNG `<th>` sang cả `<thead>` block: `<thead className='sticky top-0 z-20'>`.
  - `TH` constant: gỡ `sticky top-0 z-20` (chỉ giữ phần style nền/font).
  - `LeafTh`: khôi phục class `relative` làm containing block cho Resizer absolute (mặc định khi không sticky horizontal).
  - `FROZEN_HEADER_CLASS`: từ `'z-30'` → `'sticky z-30'` để cột frozen-left vẫn pin theo trục ngang qua inline `left` (sticky child trong sticky thead hoạt động độc lập với nearest scrolling ancestor là wrapper bodyScrollRef).

**Lý do / bối cảnh:** Header có 2 dòng (group + leaf). Khi đặt `sticky top-0` cho TỪNG cell, cells của cả 2 dòng đều pin về `top: 0` → dòng 2 (leaf) đè dòng 1 (group). Đặt sticky ở `<thead>` block thì cả 2 dòng pin cùng nhau như 1 khối → dòng group hiển thị bên trên, dòng leaf bên dưới (đúng natural layout). Trình duyệt hiện đại (Chrome 91+, Firefox 59+) hỗ trợ `position: sticky` trên `<thead>`.

**Ảnh hưởng fullstack:** Không. Chỉ CSS.


## [2026-06-27 09:30] — Fix flicker màu primary (MHVN xanh lá → mặc định xanh đậm) khi reload

**Yêu cầu:** Đang ở MHVN (UI xanh lá) → reload trang → các button đổi về xanh biển đậm (màu primary default), không phục hồi.

**Các file đã thay đổi:**
- `src/store/slices/activeTargetSlice.ts` — `hydrateFromAccountTargets`: gỡ persist nằm rải rác trong các nhánh if/else, luôn gọi `persistTarget(state.current)` ở cuối reducer. Đảm bảo localStorage `mhcom_active_target` LUÔN đồng bộ với state hiện tại sau mỗi lần hydrate, kể cả khi current không đổi.
- `src/layout/SupplierLayout.tsx` — thêm `readPersistedTarget()` đọc localStorage ngay khi component mount (qua `useState(initializer)`). `currentSystem = storeCurrent ?? persistedCurrent` → CSS vars `--primary` xanh lá áp dụng ngay lần render đầu, không phụ thuộc thời điểm useSelector trả giá trị mới sau hydrate.
- `src/container/SupplierSidebar/index.tsx` — pattern tương tự cho `MHVN_SIDEBAR_VARS`: import `ACTIVE_A_TARGET`, thêm `readPersistedTarget` + fallback `storeCurrent ?? persistedCurrent`.

**Lý do / bối cảnh:** Slice `initialState.current` đọc localStorage qua `readInitialTarget()` chỉ khi module load client-side. Vẫn có khe rất ngắn giữa SSR (Next.js render với `current=null`) → React hydrate → useSelector cập nhật. Trong khe đó React đã commit DOM với `style=undefined` (xanh đậm). Nếu thêm vào: user nào logged-in trước khi cơ chế persist được deploy thì localStorage rỗng, hydrate API hoàn tất mới set current → kẹt xanh đậm cho đến khi API trả về.

Fix kép: (a) cơ chế persist robust — hydrate luôn ghi localStorage; (b) layout đọc localStorage TRỰC TIẾP làm fallback khi store chưa hydrate → first paint đã có CSS vars đúng.

**Ảnh hưởng fullstack:** Không. Chỉ logic client-side state/persistence.


## [2026-06-27 09:55] — Fix tiếp: bug màu primary vẫn về default sau reload

**Yêu cầu:** Fix trước chưa hiệu quả, reload vẫn ra xanh đậm.

**Các file đã thay đổi:**
- `src/layout/SupplierLayout.tsx` — đổi từ `useState(readPersistedTarget)` sang `useState(null) + useEffect(setPersistedCurrent(readPersistedTarget()))`. Lý do: `useState` initializer chạy trên cả SSR + client; trên SSR trả null, trên client trả 'mhvn' → khác giá trị → React 18 hydration giữ tree server (style=undefined), KHÔNG patch CSS vars sau hydrate → kẹt xanh đậm. Set qua `useEffect` chỉ chạy client sau mount → tránh mismatch, chấp nhận 1 frame flash từ default → MHVN style.
- `src/container/SupplierSidebar/index.tsx` — pattern tương tự.
- `src/routes/withPrivateRouteSupplier.tsx` — sau khi verify token, dispatch `setActiveTarget(persisted)` từ localStorage. Đảm bảo store.activeTarget.current sync với localStorage ngay khi vào màn supplier, kể cả khi slice initialState không pickup được giá trị (vd: store module được evaluate trên server với window undefined).

**Lý do / bối cảnh:** SSR Next.js render component server-side với `current=null`. Client hydrate cần khớp tree server để không bị React 18 cancel hydration. Trước đây dùng `useState(initializer)` thì initializer chạy trên cả SSR + client (Next.js Pages router) → giá trị khác nhau → React không phát hiện cần re-render style. Phải tách: state khởi tạo = null (khớp SSR), sau đó useEffect set giá trị thật → React commit re-render mới với style chính xác.

**Ảnh hưởng fullstack:** Không. Chỉ client-side.


## [2026-06-27 10:15] — Fix lần 3: áp CSS vars qua DOM API thay vì style prop

**Yêu cầu:** Sidebar màu đã chuyển đúng nhưng buttons trong content vẫn về xanh đậm sau reload. Sidebar dùng `dynamic ssr:false` nên client-only → style apply ngon. Layout content pane bị SSR → React-Redux + React 18 không patch style sau hydrate.

**Các file đã thay đổi:**
- `src/layout/SupplierLayout.tsx` — Bỏ pattern `style={... CSS_VARS : undefined}` trên React render. Thay bằng `ref` + `useEffect` set CSS custom properties trực tiếp lên DOM (`el.style.setProperty('--primary', ...)`) khi storeCurrent thay đổi. Bypass React render diff cho style → hydration mismatch không còn liên quan; CSS vars luôn được áp/gỡ đúng theo target hiện tại.

**Lý do / bối cảnh:** Sidebar (ssr:false) hoạt động đúng pattern react-state-driven style; nhưng Layout content pane là SSR. Trên server: storeCurrent=null (no window, slice initialState trả null). HTML render với style=undefined. Client hydrate: React-Redux v8 dùng `useSyncExternalStore` với serverSnapshot — trong hydration phase trả lại giá trị nullserver, render lại sau hydrate mới có giá trị client. Trong khoảng đó React đã commit DOM với style=undefined; sau khi store cập nhật, React quyết định không re-render attribute (chỗ này có vẻ là quirk specific React-Redux/Next.js Pages router). DOM API setProperty là cách tin cậy nhất — bỏ qua hoàn toàn React render path cho style.

**Ảnh hưởng fullstack:** Không.


## [2026-06-27 10:35] — Redesign TargetSwitcher: segmented pills thay vì antd Select

**Yêu cầu:** UI chọn hệ thống ở sidebar chỉnh đẹp hơn, bỏ dropdown.

**Các file đã thay đổi:**
- `src/components/TargetSwitcher/index.tsx` — rewrite: thay `<Select>` antd bằng segmented control 2 pills (MHVN | GP) trong container `rounded-lg border bg-sidebar-accent/40`. Pill active nền `bg-sidebar-primary`, text trắng + badge số NCC/KH (`bg-sidebar-primary-foreground/20`). Pill inactive text `sidebar-foreground/60`, hover `bg-sidebar-accent`. Gắn `role='radiogroup'` + `aria-checked` để giữ accessibility. Logic dispatch + `queryClient.resetQueries()` + `notification.success` giữ nguyên.
- `src/components/TargetSwitcher/index.spec.tsx` — cập nhật test theo UI pills: dùng `getByRole('radio', { checked: true/false })` thay cho query antd Select trigger. Mock `queryClient.resetQueries` thay vì `clear` (khớp với code thực tế).

**Lý do / bối cảnh:** Sidebar có không gian giới hạn nhưng chỉ có 2 hệ → dropdown overkill, click 2 lần (mở + chọn). Segmented pills 1-click switch, hiển thị cả 2 lựa chọn cùng lúc + visual chỉ rõ hệ nào active + count entity.

**Ảnh hưởng fullstack:** Không. Chỉ UI client.


## [2026-06-27 11:00] — Đánh dấu báo cáo chất lượng mới ở sidebar + list

**Yêu cầu:** Màn quality report của mhcom nhận diện báo cáo mới từ MHVN/GP. Hiển thị dot ở sidebar menu + dấu hiệu trên hàng mới trong list.

**Các file đã thay đổi:**
- `src/contants/Storage.ts` — thêm `QR_LAST_SEEN_PREFIX = 'mhcom_qr_last_seen:'` (key localStorage, append target để tách giữa mhvn/gp).
- `src/hook/useQualityReportNewMarker.ts` (mới):
  - `useQualityReportSeenBaseline()` — freeze baseline lastSeen tại thời điểm mount component, đồng thời write lastSeen=now + invalidate `quality-reports-new-count` để sidebar dot tắt ngay. Trả `isNew(row)` so sánh `row.source==='mhvn' && row.created_at > baseline`.
  - `useQualityReportNewCount()` — useQuery fetch tab `received` (page_size=50, refetch 60s + on focus). Trả số report có `source='mhvn'` và `created_at > readLastSeen(target)`. Chỉ enabled khi `accountType==='supplier'`.
- `src/container/SupplierSidebar/index.tsx` — gọi `useQualityReportNewCount()`. Menu item "Báo cáo chất lượng" hiển thị badge rose chứa số (clamp 99+) khi count > 0 và menu chưa active.
- `src/container/QualityReportsContainer/QualityReportsTable.tsx` — gọi `useQualityReportSeenBaseline()`. Mỗi hàng nếu `isNew(row)`: thêm dot rose nhỏ trước STT + Badge `destructive` "Mới" cạnh cột Ngày phát sinh.

**Lý do / bối cảnh:** Phía A (BE) hiện chưa có cơ chế track is_read cho từng NCC; gọn nhất là client-side dùng localStorage so sánh `created_at`. Baseline frozen ở component mount để badge "Mới" trên hàng không biến mất ngay khi user mở page (lastSeen vừa được ghi). Sidebar dot dùng lastSeen "live" → user mở page → write now → invalidate → dot tắt. 60s refetch + focus refetch cho sidebar đủ realtime nhẹ. Tách key per-target để switch hệ không thấy nhầm dữ liệu.

**Ảnh hưởng fullstack:** Không. BE đã có endpoint `GET /api/mhcom/supplier/quality-reports` với param `tab=received`; chỉ dùng thêm trả về cho sidebar count.


## [2026-06-27 11:25] — resolveChiHoFileUrl hỗ trợ host gp

**Yêu cầu:** `resolveChiHoFileUrl` hiện chỉ trỏ host MHVN, cần setup thêm GP để mở file chi hộ từ cả 2 instance.

**Các file đã thay đổi:**
- `src/services/supplier.services.ts`:
  - Thêm const `MHGS_HOST_MHVN` (env `NEXT_PUBLIC_MHGS_MHVN_HOST`) và `MHGS_HOST_GP` (env `NEXT_PUBLIC_MHGS_GP_HOST`); cả 2 fallback `NEXT_PUBLIC_MHGS_HOST` (legacy) → backward-compat khi deploy chưa set env mới.
  - `MHGS_HOST` cũ giữ làm alias `MHGS_HOST_MHVN` + đánh dấu @deprecated.
  - Helper internal `readActiveTargetHost()` đọc localStorage `mhcom_active_target`; mặc định mhvn nếu thiếu/không hợp lệ.
  - `resolveChiHoFileUrl(fileUrl, target?)` — thêm tham số `target` optional. Không truyền → tự đọc target active từ localStorage. Truyền `'mhvn'`/`'gp'` → override host theo target chỉ định.
- `src/container/PaymentManagementContainer/UploadRequestsTab.tsx`: cập nhật comment trỏ đúng env mới.

**Lý do / bối cảnh:** Mỗi instance A (mhvn vs gp) deploy độc lập trên domain riêng, mỗi domain serve `/media/` của DB tương ứng. File chi hộ từ supplier liên kết với gp phải load từ host gp, không phải mhvn. Tự đọc target từ localStorage giữ call sites không phải sửa (giảm scope). Tham số `target` optional cho case sau này cần override (vd render file của cross-target).

**Ảnh hưởng fullstack:** Không. Chỉ thêm env biến mới ở FE deploy. Production cần set `NEXT_PUBLIC_MHGS_MHVN_HOST` + `NEXT_PUBLIC_MHGS_GP_HOST` (hoặc giữ legacy `NEXT_PUBLIC_MHGS_HOST` nếu cả 2 cùng host).


## [2026-06-27 11:50] — NCC tự đổi mật khẩu ở sidebar supplier

**Yêu cầu:** Web mhcom thêm chức năng cho NCC tự đổi mật khẩu tài khoản.

**Các file đã thay đổi:**
- `src/container/SupplierSidebar/ChangePasswordModal.tsx` (mới): modal antd với Form 3 field (oldPassword/newPassword/confirmPassword), validate ≥6 ký tự + confirm khớp newPassword. Gọi mutation `changePassword({ data: values })` (service sẵn có ở `services/booking.services.ts:156` → `PATCH /api/users/change-password`). Success → notification + reset form + close; Error → notification từ response message.
- `src/container/SupplierSidebar/index.tsx`:
  - Import `KeyRoundIcon` + `ChangePasswordModal`, thêm state `changePasswordOpen`.
  - Thêm Button "Đổi mật khẩu" phía trên Button "Đăng xuất" trong khối user (cùng style ghost, icon trái).
  - Mount `<ChangePasswordModal>` sau `</aside>`.

**Lý do / bối cảnh:** BE đã có sẵn endpoint `PATCH /api/users/change-password` (`users.controller.ts:135`, DTO yêu cầu 3 field oldPassword/newPassword/confirmPassword min 6 ký tự, guard JWT) — chỉ cần UI ở phía NCC. Đặt entry point trong sidebar (chỗ user info + logout) là vị trí trực giác nhất, không cần thêm trang riêng.

**Ảnh hưởng fullstack:** Không (dùng endpoint sẵn có). Validation FE khớp DTO BE (min 6 + confirm match).


## [2026-06-27 12:05] — Fix ChangePasswordModal gửi body sai cấu trúc

**Yêu cầu:** BE trả "property data should not exist" + báo các field oldPassword/newPassword/confirmPassword không tồn tại khi submit form đổi mật khẩu ở NCC sidebar.

**Các file đã thay đổi:**
- `src/container/SupplierSidebar/ChangePasswordModal.tsx` — đổi `changePassword({ data: values })` → `changePassword(values as any)`. Service `changePassword(data: { data: any })` thực chất spread thẳng vào body (`HttpRequest.patch(..., { ...data })`), nên caller phải truyền PHẲNG. Wrap thêm 1 lớp `{ data: ... }` làm body gửi BE là `{ data: { oldPassword, ... } }` → DTO `forbidNonWhitelisted` reject `data` + không bind được field con.

**Lý do / bối cảnh:** Signature TS của service `changePassword` gây nhầm lẫn (`data: { data: any }`). Caller hiện hữu (`InfoUser.tsx`) bypass type bằng `mutate({ ...res })` flatten. Comment trong file ghi rõ kèm tham chiếu để tránh lặp bug.

**Ảnh hưởng fullstack:** Không. BE contract không đổi; chỉ fix client gửi body đúng.


## [2026-06-27 13:30] — Tab "Chi phí đã chốt" tại /supplier/cost-statement

**Yêu cầu:** Thêm tab mới "Chi phí đã chốt" tại màn cost-statement của mhcom, hiển thị các chi phí đã thuộc request (PNL trucking đã nằm trong RequestItem), read-only. Hover ô tiền > 0 hiển thị "Đã chốt — không thể sửa".

**Các file đã thay đổi:**
- `src/services/supplier.services.ts` — `KeCuocChiHoParams` thêm field `locked?: boolean`.
- `src/container/CostStatementContainer/index.tsx`:
  - Type `View` mở rộng: `'kecuoc' | 'locked' | 'requests'`.
  - Thêm tab button "Chi phí đã chốt" (icon `LockIcon`) xen giữa "Kê cước & chi hộ" và "Đề nghị thay đổi".
  - Render `<KeCuocChiHoTable locked />` khi view='locked'.
- `src/container/CostStatementContainer/KeCuocChiHoTable.tsx`:
  - Component nhận prop `locked?: boolean` (mặc định false).
  - Query key + params include `locked` → React Query cache tách biệt giữa 2 tab.
  - `isCellEditable`: nếu `locked` → luôn false.
  - `EditableMoneyCell` thêm prop `lockedTooltip` (mặc định "Đã khoá — Liên hệ MH..."). Tab locked truyền "Đã chốt — không thể sửa.".
  - Action bar "Hoàn tác/Gửi đề nghị" tự ẩn vì `dirtyCount` luôn = 0 khi không có cell editable.

**Lý do / bối cảnh:** Tận dụng cùng component + cùng cấu trúc data, chỉ thay filter API và lock edit logic. Tránh duplicate code/table. Tab mới giúp NCC xem lại lịch sử các chi phí đã được tạo request (đã chốt).

**Ảnh hưởng fullstack:** Đã thêm param `?locked=true` ở `GET /api/supplier/transactions/ke-cuoc-chi-ho` (MH-api → mhvn). BE Django `build_kecuoc_chiho_rows` nhận thêm tham số `locked=False` mặc định, `True` → invert filter để CHỈ trả PNL trucking đang nằm trong request.

## [2026-09-10 14:29] — Redesign web công khai (Giai đoạn 1–3): trang chủ + 3 trang dịch vụ

**Yêu cầu:** Sửa giao diện web công khai cho đẹp và hiện đại hơn, dùng màu chủ đạo `#1769B3` + `#1AA851`, loại bỏ hoàn toàn thiết kế cũ, thêm nhiều animation/hình ảnh, tạo 3 trang dịch vụ lõi (đường bộ, đường biển, khai báo hải quan) — chưa nối CMS (đợt sau).

**Agent thực hiện:** claude (redesign one-shot, theo plan đã duyệt)

**Các file đã thêm mới:**
- Hệ thiết kế: `tailwind.config.js` (thang màu `brand-blue`/`brand-green`/`brand-teal`/`navy`/`amber`/`paper`, thang chữ `display-*`, keyframes `marquee`/`draw-line`/`pulse-dot`, breakpoint riêng `tab/lap/dsk/wide` — KHÔNG đổi `xs/sm/md` cũ vì 360+ chỗ code hiện có (admin/supplier) dùng ngữ nghĩa cũ).
- Font: `src/lib/fonts.ts` (Be Vietnam Pro qua `@fontsource`, KHÔNG đổi font mặc định body — Inter cũ của admin/manager/supplier không bị ảnh hưởng), import 1 dòng trong `src/pages/_app.tsx`.
- Content (hardcode, shape khớp CMS tương lai): `src/content/types.ts`, `src/content/home.content.ts`, `src/content/services.content.ts`, `src/utils/pickLang.ts`.
- UI kit: `src/components/ui/{Container,CtaButton,SectionHeading,Reveal,Counter,Accordion,ServiceIcon}.tsx`.
- Vỏ trang public: `src/components/public/{Header,MobileNav,Footer,TrackingBar}.tsx`, `src/layout/PublicLayout.tsx` (import thường — SSR bình thường, khác `HomeLayout` cũ bị `dynamic(ssr:false)`).
- Trang chủ: `src/components/home/{Hero,RouteArt,ServiceCard,ServiceGrid,StatBand,ProcessTimeline,ProcessSection,RouteMap,TrustBand,NewsTeaser,QuoteCta}.tsx`, viết lại hoàn toàn `src/pages/index.tsx`.
- Trang dịch vụ: `src/components/service/{ServiceHero,SpecTable,ServiceFAQ,RelatedServices}.tsx`, template `src/pages/dich-vu/[slug].tsx` (SSG qua `getStaticPaths`/`getStaticProps`, 3 slug: `van-chuyen-duong-bo`, `van-chuyen-duong-bien`, `khai-bao-hai-quan`).

**File đã sửa (không phải trang public cũ):**
- `src/pages/_app.tsx`: thêm `import '@/lib/fonts'`.
- `src/styles/globals.css`: thêm block `@media (prefers-reduced-motion: reduce)` tắt 3 animation CSS-keyframe mới.

**Lý do / bối cảnh:**
- Trang chủ cũ: hero là `banner.png` bị `object-fill` kéo méo + margin riêng từng breakpoint; 3 dịch vụ lõi không có trang; biến `dataFakeNew.dataFake` (số liệu giả) chạy production; toàn bộ trang public SSR tắt (`dynamic(..., {ssr:false})`) → mất SEO.
- Quyết định kỹ thuật quan trọng: KHÔNG sửa `sm`/`md` breakpoint cũ (dùng ngữ nghĩa range khác chuẩn Tailwind, 360+ chỗ dùng ngoài phạm vi) — thêm bộ breakpoint mới tên riêng cho code public mới. KHÔNG đổi font mặc định toàn site (Inter đang load qua link `cdnfonts.com` dùng chung mọi trang) — chỉ thêm font mới áp riêng qua utility `font-display`.
- `@next/font` yêu cầu Next.js ≥13 (dự án đang Next 12.3.7) → đổi sang `@fontsource/be-vietnam-pro` (cùng cách project đã dùng `@fontsource/roboto`).
- Next 12.3.7 `next/link` mặc định `legacyBehavior=true` (yêu cầu đúng 1 child) — mọi `<Link>` bọc nhiều children phải set `legacyBehavior={false}`.
- Nội dung 3 trang dịch vụ + số liệu trang chủ là dữ liệu minh hoạ/mẫu (số liệu StatBand, hero/thẻ dịch vụ chưa có ảnh thật — dựng bằng SVG/CSS route-art tạm thời), cần thay bằng dữ liệu thật và ảnh thật trước khi lên production.

**Ảnh hưởng fullstack:** Không có — toàn bộ nội dung hardcode phía frontend, không có endpoint mới, không đổi API contract nào. `QuoteCta` trỏ sang trang liên hệ có sẵn `/customer-supports` (endpoint `POST /api/public/quote-requests` riêng cho lead báo giá nằm ngoài phạm vi đợt này).

**Kết quả kiểm thử:**
- `yarn typecheck`: sạch.
- `yarn lint` trên toàn bộ file mới: 0 lỗi, 0 cảnh báo (đã autofix thứ tự import).
- `yarn build`: pass toàn bộ 120 trang, bao gồm 13 trang public cũ + admin/manager/supplier — không trang nào bị vỡ. `/` và `/dich-vu/[slug]` (3 trang) giờ là SSG (●) thay vì client-only.
- Kiểm tra qua dev server: desktop/tablet/mobile (375/768/1280px) không có thanh cuộn ngang; console sạch; cả 3 trang dịch vụ + `/en` trả 200 đúng nội dung song ngữ.
- Sửa 1 lỗi a11y: headline hero chia theo từ để animate thiếu khoảng trắng thật trong DOM text → thêm `aria-label` câu đầy đủ trên `<h1>`, ẩn phần chia từ khỏi accessibility tree.

**Chưa làm / đợt sau:** nối CMS ở admin để chỉnh nội dung trang public (theo yêu cầu ban đầu), 13 trang public cũ còn lại, ảnh thật (xem slot đã dựng theo đúng tỉ lệ), số liệu StatBand thật, endpoint nhận lead báo giá.

## [2026-09-10 15:04] — Tinh chỉnh redesign: bỏ Trung Quốc, gắn ảnh thật, sửa header/input đơn điệu

**Yêu cầu:** (1) Bỏ mọi nội dung liên quan Trung Quốc, thay bằng "toàn thế giới"; tuyến khai thác thực tế là quốc tế → cảng Hải Phòng, và cảng Hải Phòng → sâu nội địa. (2) Header quá trắng, các section quá đơn điệu toàn màu trắng. (3) Lấy ảnh thật trên mạng cho các chỗ đang là placeholder. (4) Input còn xấu.

**Agent thực hiện:** claude

**Các file đã thay đổi:**
- `src/content/home.content.ts`: headline/sub hero đổi hướng "cảng Hải Phòng đi khắp thế giới"; stat "2 quốc gia" → "50+ tuyến tàu quốc tế"; viết lại toàn bộ `route.points` — cảng Hải Phòng làm `hub` duy nhất (trước đây Hà Nội/TP.HCM là hub, có cả Thâm Quyến/Quảng Châu), các điểm còn lại là phân phối nội địa (Hà Nội, Bắc Ninh, Hải Dương, Đà Nẵng, TP.HCM, Cát Lái).
- `src/content/services.content.ts`: dịch vụ đường bộ đổi từ "cửa khẩu biên giới" (Lạng Sơn/Móng Cái/Lào Cai) sang "phân phối từ cảng Hải Phòng vào nội địa"; dịch vụ đường biển đổi từ "Việt Nam–Trung Quốc" sang "cảng Hải Phòng ↔ 50+ cảng quốc tế toàn cầu".
- `src/components/home/RouteMap.tsx`: nhãn `KIND_LABEL` đổi ngữ nghĩa (hub = "Cảng Hải Phòng — trung tâm"); thêm nhóm đường nét đứt + badge "Tuyến quốc tế" (vẽ tay bằng SVG, không gắn quốc gia cụ thể) toả ra từ hub, tượng trưng kết nối toàn cầu; thêm dải gradient màu ở đầu card thay viền trắng phẳng.
- `src/pages/index.tsx`, `src/components/public/Footer.tsx`: bỏ nốt câu SEO description và footer description còn nhắc "Việt Nam và Trung Quốc".
- **Ảnh thật** (tải từ Unsplash, giấy phép Unsplash License — miễn phí, không cần ghi nguồn): `public/images/hero/hero-cargo.jpg` (cảng đêm, cần cẩu container), `public/images/services/{road,sea,customs}-{card,hero}.jpg` (xe tải cao tốc; cảng container trên cao; con dấu trên tài liệu pháp lý — đổi ảnh customs ban đầu vì có tiền mặt trong khung hình, không phù hợp).
- `src/components/home/Hero.tsx`: gắn ảnh `hero.image` làm nền thật (trước đây chỉ có gradient + SVG); gradient overlay đổi từ 3 lớp chéo đậm (95/85/75%) sang ngang trái→phải (95/75/30%) để ảnh hiện rõ mà chữ vẫn đọc được.
- `src/components/service/ServiceHero.tsx`: gắn ảnh `service.heroImage` làm nền thật; cùng kiểu gradient ngang theo accent dịch vụ.
- `src/components/home/ServiceCard.tsx`: thêm ảnh `service.cardImage` ở đầu thẻ (trước đây thẻ chỉ có icon, không dùng field `cardImage` dù đã khai báo trong content) — icon nổi đè lên mép ảnh, overlay gradient màu theo accent.
- `src/components/ui/ServiceIcon.tsx`: thêm token `imageOverlay` vào `ACCENT_CLASSES` (gradient phủ ảnh theo accent).
- `src/components/ui/SectionGlow.tsx` (mới): quầng gradient mờ trang trí cho section nền trắng — gắn vào `ServiceGrid`, `ProcessSection`, phần thông số + FAQ ở trang dịch vụ.
- `src/components/service/SpecTable.tsx`: nhận thêm prop `accent`, thêm dải màu ở đầu bảng + hover row.
- `src/components/public/Header.tsx`: thêm dải gradient 3px (xanh lá→xanh dương→teal) ở đáy header khi cuộn, thay viền xám phẳng.
- `src/components/public/TrackingBar.tsx`: làm lại input — icon trong vòng tròn màu, `focus-within` ring rõ, nút có icon mũi tên + shadow nâng khi hover (cả 2 biến thể hero/compact).

**Lý do / bối cảnh:** Yêu cầu định hướng lại mô hình khai thác — không còn tuyến cố định sang Trung Quốc, mà là cảng Hải Phòng làm trung tâm nhận hàng quốc tế rồi phân phối nội địa. Phần thiết kế: gradient overlay quá đậm trước đó gần như che kín ảnh nền khiến trang "trắng/phẳng"; `ServiceCard`/`ServiceHero` khai báo `cardImage`/`heroImage` trong content nhưng chưa từng render — nay đã gắn đúng. Input tra cứu trước đó thiếu chiều sâu thị giác (chỉ viền + nền trắng phẳng).

**Kiểm thử:** `yarn typecheck` sạch, `yarn lint` trên toàn bộ file mới sạch (0 lỗi/0 cảnh báo), `yarn build` pass toàn bộ 120 trang. Xác nhận qua `curl` mọi ảnh trả `200` + `Content-Type: image/jpeg` đúng cả đường dẫn gốc và qua `/_next/image`. Không còn chuỗi "Trung Quốc"/"China"/"Thâm Quyến"/"Quảng Châu" nào trong nội dung hiển thị (grep xác nhận).

**Ảnh hưởng fullstack:** Không có — chỉ thay nội dung tĩnh + ảnh phía frontend.

**Lưu ý:** Ảnh Unsplash là ảnh minh hoạ tạm thời (đúng như yêu cầu), không phải ảnh thật của MH — cần thay bằng ảnh do công ty chụp trước khi lên production.

## [2026-09-10 15:34] — Sửa header, làm lại quy trình, bỏ bản đồ tuyến, thêm mục Đối tác

**Yêu cầu:** (1) Header vẫn xấu, nền trắng mờ che mất thông tin; các mục bấm được trong header dính liền nhau. (2) Phần quy trình trắng trơn, chỉ toàn chữ với số. (3) Bỏ phần tuyến đường khai thác. (4) Thêm mục đối tác: "đối tác cảng biển" là các hãng tàu có tuyến chạy đến cảng Việt Nam, "đối tác nội địa" là các công ty sản xuất ở Việt Nam.

**Agent thực hiện:** claude

**Các file đã thay đổi:**
- `src/components/public/Header.tsx`: bỏ `bg-white/90 + backdrop-blur-md` (nội dung cuộn phía dưới lộ qua làm chữ khó đọc) → khi cuộn dùng **nền navy đặc** `bg-navy-600` + `shadow-lift`; chữ luôn trắng ở cả 2 trạng thái nên không còn đổi màu giữa chừng. Giãn điều hướng: `gap-1`→`gap-2`, mục `py-2`→`py-2.5`, thêm mũi tên `ChevronDown` cho "Dịch vụ", thêm **vạch ngăn dọc** giữa nhóm điều hướng và nhóm hành động (`gap-4`), nút Đăng nhập đổi sang `variant='accent'` (vàng) cho nổi trên nền navy. Dropdown dịch vụ căn trái thay vì căn giữa.
- `src/components/home/ProcessTimeline.tsx`: viết lại hoàn toàn — mỗi bước giờ là một **thẻ** có icon minh hoạ riêng, số thứ tự cỡ lớn làm hoa văn nền, nhãn "bên thực hiện" dạng chip, vạch màu chạy ở đáy thẻ khi hover, vạch nối ngang giữa các thẻ. Trước đây chỉ có vòng tròn số + chữ trên nền trắng.
- `src/components/ui/ProcessIcon.tsx` (mới): map 11 tên icon sang lucide-react.
- `src/content/types.ts`: thêm `ProcessIconName` + trường `icon` bắt buộc cho `ProcessStep`; bỏ `RoutePoint`/`TrustLogo`; thêm `PartnerItem` và khối `partners` trong `HomeContent`.
- `src/content/home.content.ts`: bỏ `route` và `trust`; thêm `partners` (8 hãng tàu + 6 nhóm ngành nội địa); thêm icon cho 5 bước quy trình.
- `src/content/services.content.ts`: thêm icon cho 15 bước quy trình của 3 dịch vụ.
- `src/components/home/PartnersSection.tsx` (mới): 2 nhóm thẻ song song — "Đối tác cảng biển" (tone xanh dương, icon tàu) và "Đối tác nội địa" (tone xanh lá, icon nhà máy), mỗi đối tác là một chip có tên + dòng phụ (tuyến khai thác / ngành hàng + khu vực).
- `src/components/home/RouteMap.tsx`, `src/components/home/TrustBand.tsx`: **đã xoá**. `src/pages/index.tsx` thay 2 mục này bằng `PartnersSection`.
- `src/components/home/ProcessSection.tsx` + `src/pages/dich-vu/[slug].tsx`: nền mục quy trình `bg-white` → `bg-paper` + viền trên/dưới, để các thẻ trắng nổi lên thay vì chìm vào nền trắng.

**Lý do / bối cảnh:** Nền trắng mờ + backdrop-blur của header sticky khiến nội dung trang cuộn phía dưới lộ qua, chữ header mất tương phản — nền đặc xử lý triệt để. Quy trình trước đó thiếu tín hiệu thị giác (không icon, không thẻ, không màu) nên đọc như một danh sách đánh số.

**⚠️ Dữ liệu cần xác nhận trước khi lên production:** 8 hãng tàu trong `partners.carriers` (Maersk, MSC, CMA CGM, COSCO, Evergreen, ONE, HMM, SITC) đều thực sự có tuyến đến cảng Việt Nam, nhưng **việc gọi họ là "đối tác" của MH thì chỉ MH mới xác nhận được** — phải rà lại theo quan hệ booking/hợp đồng thật, tránh tuyên bố quan hệ chưa có. Nhóm `domestic` cố ý ghi theo **ngành hàng + khu vực** thay vì bịa tên doanh nghiệp cụ thể; thay bằng tên khách hàng thật (kèm sự đồng ý của họ) khi có. Hiển thị bằng chữ, không dùng logo hãng tàu để tránh dùng nhãn hiệu bên thứ ba khi chưa có thoả thuận.

**Kiểm thử:** `yarn typecheck` sạch, `yarn lint` trên toàn bộ file mới sạch, `yarn build` pass 120 trang. Kiểm tra HTML prerender của trang chủ: có "Đối tác cảng biển"/"Đối tác nội địa"/"Maersk", không còn "Phạm vi khai thác"; header khởi tạo đúng trạng thái `bg-transparent`, computed `backdrop-filter: none` (đã bỏ blur).

**Ảnh hưởng fullstack:** Không có — chỉ nội dung tĩnh và component phía frontend.
