# Change Log — Dự án MH

File này ghi lại toàn bộ các thay đổi code do Claude thực hiện theo yêu cầu.
Mục đích: giúp team hiểu được những gì đang được làm mà không cần đọc từng diff.

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

