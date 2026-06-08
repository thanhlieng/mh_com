# API: Upload & liệt kê file Chi hộ từ hệ thống B

> **Tài liệu tích hợp dành cho hệ thống B.** Cho phép hệ thống B upload file vào
> bảng `order_chiho_files` thay mặt supplier (xác định qua token B), liệt kê lại
> các file đã upload, đồng thời **lưu vết** file được upload từ hệ thống nào và
> với id nào.
>
> Bối cảnh xác thực: [SPEC-ket-noi-A-B.md](../../SPEC-ket-noi-A-B.md),
> [RSA_KEY_SETUP.md](../../RSA_KEY_SETUP.md).

---

## 1. Tổng quan

| Thuộc tính | Giá trị |
|---|---|
| Method | `POST` (upload), `GET` (liệt kê) |
| Path | `/api/system-b/supplier/chiho-files/` |
| Content-Type | `multipart/form-data` (POST) |
| Auth | Bearer **supplier token** (RS256, do hệ thống B ký) |
| Loại token chấp nhận | `type = "supplier"` **duy nhất** |
| Loại token bị từ chối | `service`, `customer`, web-user A → `403` |
| Định danh supplier | Lấy từ claim `sub` của token (`request.supplier_id`) — **KHÔNG** nhận qua param |
| Source code | [mhcom/supplier_chiho_files_views.py](../../mhcom/supplier_chiho_files_views.py) |

---

## 2. Lưu vết nguồn upload (provenance)

Mỗi file tạo qua endpoint này được ghi vào `order_chiho_files` với:

| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| `source_system` | `'system-b'` | File upload từ hệ thống B |
| `source_id` | `<supplier_id>` (string) | Id của supplier (lấy từ token) |
| `created_by` | `system-b:supplier:<supplier_id>` | Người/đối tượng tạo |

> File upload qua web hệ thống A (endpoint cũ `/api/chiho_file_upload/`) mặc định
> `source_system = 'system-a'`.

---

## 3. Xác thực

```
Authorization: Bearer <supplier_token>
```

Token supplier RS256 với các claim `iss=system-b`, `aud=system-a`,
`type=supplier`, `sub=<a_supplier_id>`, `exp`. Xem `issueSupplierToken` trong
[RSA_KEY_SETUP.md](../../RSA_KEY_SETUP.md).

---

## 4. Request (multipart/form-data)

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `order_id` | int | Có | Id đơn hàng cần đính file |
| (file parts) | file | Có | Một hoặc nhiều file. Tên field tuỳ ý (vd `file`, `file1`, `invoice`...). Mỗi part = 1 file. |

**Ràng buộc bảo mật:** supplier chỉ được upload vào order mà supplier có tham
gia — tức tồn tại ít nhất một bản ghi `OrderChiHo` với `order_id` đó và
`supplier_id` = supplier trong token. Nếu không → `403`.

---

## 5. Response

`201 Created`:

```json
{
  "message": "Files uploaded successfully",
  "count": 2,
  "data": [
    {
      "id": 1234,
      "order_id": 88,
      "file_url": "/media/order_chiho_files/2026/06/invoice.pdf",
      "file_name": "invoice.pdf",
      "is_active": true,
      "source_system": "system-b",
      "source_id": "66",
      "created_at": "2026-06-08T10:11:12Z",
      "created_by": "system-b:supplier:66"
    }
  ]
}
```

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `id` | int | Khóa chính `order_chiho_files` |
| `order_id` | int | Đơn hàng |
| `file_url` | string / null | URL file (dưới `MEDIA_URL`) |
| `file_name` | string / null | Tên file |
| `is_active` | bool | Luôn `true` khi vừa tạo |
| `source_system` | string | `"system-b"` |
| `source_id` | string | Id supplier |
| `created_at` | datetime | |
| `created_by` | string | `system-b:supplier:<id>` |

---

## 6. GET — Liệt kê file đã upload

`GET /api/system-b/supplier/chiho-files/`

Trả về danh sách file Chi hộ của một order **do chính supplier này upload từ hệ
thống B**. Lọc theo `order_id` + `source_system='system-b'` + `source_id` =
supplier trong token → supplier chỉ thấy đúng file của mình.

### Query params

| Param | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|
| `order_id` | int | Có | — | Id đơn hàng |
| `include_inactive` | bool | Không | `false` | `true`/`1`/`yes` để bao gồm cả file đã xoá mềm (`is_active=false`) |

### Response `200 OK`

```json
{
  "order_id": 88,
  "source_system": "system-b",
  "source_id": "66",
  "count": 1,
  "data": [
    {
      "id": 1234,
      "order_id": 88,
      "file_url": "/media/order_chiho_files/2026/06/invoice.pdf",
      "file_name": "invoice.pdf",
      "is_active": true,
      "source_system": "system-b",
      "source_id": "66",
      "created_at": "2026-06-08T10:11:12Z",
      "created_by": "system-b:supplier:66"
    }
  ]
}
```

Mỗi phần tử trong `data` có cấu trúc giống response của POST (mục 5). Danh sách
sắp xếp mới nhất trước theo `created_at`.

### Ví dụ cURL

```bash
curl -G 'https://<host-A>/api/system-b/supplier/chiho-files/' \
  -H "Authorization: Bearer $SUPPLIER_TOKEN" \
  --data-urlencode 'order_id=88'
```

---

## 7. Mã lỗi

| HTTP | Khi nào | Body |
|---|---|---|
| `400` | Thiếu `order_id` (POST & GET) | `{ "detail": "order_id is required." }` |
| `400` | Không có file (POST) | `{ "detail": "At least one file is required." }` |
| `401` | Token thiếu / không verify được / hết hạn | `{ "detail": "..." }` |
| `403` | Token không phải loại `supplier` | `{ "detail": "This endpoint requires a supplier token..." }` |
| `403` | Token supplier nhưng thiếu `sub` | `{ "detail": "Supplier id is missing in the token." }` |
| `403` | Order không thuộc supplier (POST) | `{ "detail": "This order does not belong to the supplier." }` |
| `404` | Không tìm thấy order (POST) | `{ "detail": "Order not found." }` |

---

## 8. Ví dụ (POST upload)

### cURL

```bash
curl -X POST 'https://<host-A>/api/system-b/supplier/chiho-files/' \
  -H "Authorization: Bearer $SUPPLIER_TOKEN" \
  -F 'order_id=88' \
  -F 'file1=@/path/to/invoice.pdf' \
  -F 'file2=@/path/to/receipt.jpg'
```

### Node.js (phía hệ thống B — qua proxy, KHÔNG gọi từ browser)

```javascript
import FormData from 'form-data';
import fs from 'fs';

async function uploadChiHoFiles(supplier, orderId, filePaths) {
  const token = issueSupplierToken(supplier.a_supplier_id); // ném 409 nếu chưa liên kết
  const form = new FormData();
  form.append('order_id', String(orderId));
  filePaths.forEach((p, i) => form.append(`file${i}`, fs.createReadStream(p)));

  const res = await fetch(`${SYSTEM_A_BASE_URL}/api/system-b/supplier/chiho-files/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, ...form.getHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error(`System A error ${res.status}`);
  return res.json();
}
```

---

## 9. Thay đổi model / schema DB

Thêm 2 cột vào model `OrderChiHoFiles` ([orders/models.py](../../orders/models.py)):

```python
source_system = models.CharField(
    max_length=50, choices=SourceSystemChoices.choices,
    default=SourceSystemChoices.SYSTEM_A, null=True, blank=True
)
source_id = models.CharField(max_length=100, null=True, blank=True)
```

> ⚠️ **Schema DB chưa được áp dụng** (theo yêu cầu tạm bỏ qua bước update DB).
> Trước khi endpoint này hoạt động trên môi trường thật, cần thêm 2 cột vào bảng
> `order_chiho_files`. SQL tương ứng (PostgreSQL):

```sql
ALTER TABLE order_chiho_files
    ADD COLUMN IF NOT EXISTS source_system varchar(50) NULL DEFAULT 'system-a',
    ADD COLUMN IF NOT EXISTS source_id     varchar(100) NULL;
```

Hoặc tạo Django migration cho app `orders` (lưu ý repo hiện **gitignore** thư mục
`migrations/` và app `orders` chưa có lịch sử migration — cần thống nhất quy trình
áp schema với team trước khi `migrate`).
