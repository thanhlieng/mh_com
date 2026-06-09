# Change Log — Dự án MH

File này ghi lại toàn bộ các thay đổi code do Claude thực hiện theo yêu cầu.
Mục đích: giúp team hiểu được những gì đang được làm mà không cần đọc từng diff.

---

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

