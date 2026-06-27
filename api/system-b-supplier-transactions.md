# API: Danh sách giao dịch của Supplier (PNL + Chi hộ)

> **Tài liệu tích hợp dành cho hệ thống B.** Mô tả endpoint phía hệ thống A (Django)
> trả về danh sách hợp nhất các bản ghi **PNL** (`OrderContainerPnl`) và **Chi hộ**
> (`OrderChiHo`) thuộc về supplier được xác định qua token của hệ thống B.
>
> Xem thêm bối cảnh xác thực: [SPEC-ket-noi-A-B.md](../../SPEC-ket-noi-A-B.md),
> [RSA_KEY_SETUP.md](../../RSA_KEY_SETUP.md).

---

## 1. Tổng quan

| Thuộc tính | Giá trị |
|---|---|
| Method | `GET` |
| Path | `/api/system-b/supplier/transactions/` |
| Auth | Bearer **supplier token** (RS256, do hệ thống B ký) |
| Loại token chấp nhận | `type = "supplier"` **duy nhất** |
| Loại token bị từ chối | `service`, `customer`, web-user A → `403` |
| Định danh supplier | Lấy từ claim `sub` của token (`request.supplier_id`) — **KHÔNG** nhận qua query param |
| Source code | [mhcom/supplier_statement_views.py](../../mhcom/supplier_statement_views.py) |

**Nguyên tắc bảo mật then chốt:** supplier_id chỉ đến từ token. Client không thể
truyền `supplier_id` để xem dữ liệu của supplier khác. Mọi query đều
`filter(supplier_id=<từ token>)`.

---

## 2. Xác thực

Gửi token supplier (RS256) trong header:

```
Authorization: Bearer <supplier_token>
```

Token phải có các claim (do hệ thống B sinh — xem `issueSupplierToken` trong
[RSA_KEY_SETUP.md](../../RSA_KEY_SETUP.md)):

```json
{
  "iss": "system-b",
  "aud": "system-a",
  "type": "supplier",
  "sub": "<a_supplier_id>",
  "exp": 1717329600
}
```

Hệ thống A verify chữ ký bằng public key của B, bắt buộc `aud=system-a`,
`iss=system-b`, `exp` chưa hết hạn.

---

## 3. Query parameters

| Param | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|
| `start_date` | `YYYY-MM-DD` | Không | — | Lọc `invoice_date >= start_date` |
| `end_date` | `YYYY-MM-DD` | Không | — | Lọc `invoice_date <= end_date` |
| `q` | string | Không | `""` | Tìm kiếm tự do (alias: `queryString`) |
| `page` | int | Không | `1` | Trang (bắt đầu từ 1) |
| `page_size` | int | Không | `50` | Số bản ghi/trang (tối đa `200`) |

**Phạm vi tìm kiếm của `q` (icontains, không phân biệt hoa thường):**
- Chung: `contract_number`, `supplier_name`, `invoice_exporter`, `order_code`
  (`order.order_code`), `booking_bill_number` (`order.booking_bill_number`),
  `customer_name`.
- Riêng PNL: thêm `service_name`.

> Lọc theo ngày áp dụng trên trường `invoice_date` (ngày hoá đơn). Bản ghi có
> `invoice_date = null` sẽ **không** xuất hiện khi truyền `start_date`/`end_date`.

---

## 4. Response

`200 OK`:

```json
{
  "supplier_id": "66",
  "start_date": "2026-01-01",
  "end_date": "2026-06-30",
  "query": "",
  "page": 1,
  "page_size": 50,
  "total": 2,
  "results": [
    { "type": "pnl", "id": 5, "...": "..." },
    { "type": "chi_ho", "id": 1100, "...": "..." }
  ]
}
```

- `total`: tổng số bản ghi (PNL + Chi hộ) khớp điều kiện, **trước** phân trang.
- `results`: danh sách đã phân trang, sắp xếp **mới nhất trước** theo
  `invoice_date` rồi `created_at` (giảm dần).
- Mỗi phần tử có trường `type` = `"pnl"` hoặc `"chi_ho"` để phân biệt loại.

### 4.1. Phần tử `type = "pnl"` (OrderContainerPnl)

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `type` | string | Luôn `"pnl"` |
| `id` | int | Khóa chính PNL |
| `created_at` | datetime | |
| `invoice_date` | date / null | Ngày hoá đơn |
| `contract_number` | string / null | Số hợp đồng |
| `supplier_id` | int | = supplier trong token |
| `supplier_name` | string | |
| `service_name` | string | |
| `service_type` | string | `Trucking` / `Thông quan` / `Cước biển` |
| `expense_type` | string | `normal` / `invoice_mh` |
| `cost` | decimal | Chi phí trước VAT |
| `revenue` | decimal | Doanh thu trước VAT |
| `cost_vat` | decimal | |
| `revenue_vat` | decimal | |
| `cost_after_vat` | decimal | Chi phí sau VAT |
| `revenue_after_vat` | decimal | Doanh thu sau VAT |
| `profit` | decimal | Lợi nhuận |
| `amount_after_vat` | decimal | **Trường tiền chuẩn hoá** = `revenue_after_vat` (để hiển thị thống nhất với chi hộ) |
| `currency_code` | string | = `revenue_currency_code` |
| `cost_currency_code` | string | |
| `invoice_exporter` | string / null | Đơn vị xuất hoá đơn |
| `invoice_export_type` | string / null | `terminal` / `supplier` |
| `order_id` | int / null | |
| `order_code` | string / null | |
| `booking_bill_number` | string / null | |
| `customer_name` | string / null | |

### 4.2. Phần tử `type = "chi_ho"` (OrderChiHo)

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `type` | string | Luôn `"chi_ho"` |
| `id` | int | Khóa chính Chi hộ |
| `created_at` | datetime | |
| `invoice_date` | date / null | Ngày hoá đơn |
| `contract_number` | string / null | Số hợp đồng |
| `supplier_id` | int | = supplier trong token |
| `supplier_name` | string | |
| `customer_name` | string / null | |
| `vat` | decimal | |
| `amount` | decimal | Số tiền trước VAT |
| `amount_after_vat` | decimal | **Trường tiền chuẩn hoá** = số tiền sau VAT |
| `services` | string[] | Danh sách `service_type` (quan hệ M2M) |
| `invoice_exporter` | string / null | |
| `invoice_export_type` | string / null | `terminal` / `supplier` |
| `order_id` | int / null | |
| `order_code` | string / null | |
| `booking_bill_number` | string / null | |

> **Mẹo tích hợp:** dùng `type` để render, dùng `amount_after_vat` làm cột tiền
> chung cho cả hai loại.

---

## 5. Mã lỗi

| HTTP | Khi nào | Body |
|---|---|---|
| `400` | `start_date`/`end_date` sai định dạng (không phải `YYYY-MM-DD`) | `{ "detail": "Invalid date format. Use YYYY-MM-DD." }` |
| `400` | `page`/`page_size` không phải số nguyên | `{ "detail": "page and page_size must be integers." }` |
| `401` | Token thiếu / không verify được / hết hạn | `{ "detail": "..." }` |
| `403` | Token không phải loại `supplier` (service/customer/web-user) | `{ "detail": "This endpoint requires a supplier token..." }` |
| `403` | Token supplier nhưng thiếu `sub` | `{ "detail": "Supplier id is missing in the token." }` |

---

## 6. Ví dụ

### cURL

```bash
curl -G 'https://<host-A>/api/system-b/supplier/transactions/' \
  -H "Authorization: Bearer $SUPPLIER_TOKEN" \
  --data-urlencode 'start_date=2026-01-01' \
  --data-urlencode 'end_date=2026-06-30' \
  --data-urlencode 'q=XK260119' \
  --data-urlencode 'page=1' \
  --data-urlencode 'page_size=50'
```

### Node.js (phía hệ thống B — qua proxy, KHÔNG gọi từ browser)

```javascript
// Giả định đã có issueSupplierToken() trả token RS256 cho supplier hiện tại.
async function fetchSupplierTransactions(supplier, { startDate, endDate, q, page = 1, pageSize = 50 }) {
  const token = issueSupplierToken(supplier.a_supplier_id); // ném 409 nếu chưa liên kết
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate)   params.set('end_date', endDate);
  if (q)         params.set('q', q);
  params.set('page', page);
  params.set('page_size', pageSize);

  const res = await fetch(`${SYSTEM_A_BASE_URL}/api/system-b/supplier/transactions/?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`System A error ${res.status}`);
  return res.json();
}
```

---

## 7. Ghi chú triển khai

- Endpoint dùng permission `SupplierTokenOnly`
  ([utils/permissions.py](../../utils/permissions.py)) → tự động chặn token
  service/customer/web-user.
- `supplier_id` lấy qua `get_supplier_id(request)` (= `request.supplier_id`),
  được `MultiSourceJWTAuthentication` gán từ claim `sub`.
- Phân trang thực hiện sau khi gộp 2 nguồn (in-memory). Với supplier có lượng
  bản ghi rất lớn, cân nhắc chuyển sang phân trang ở tầng DB nếu cần.
- `services` của Chi hộ lấy bằng 1 query phụ theo danh sách id (tránh N+1).
