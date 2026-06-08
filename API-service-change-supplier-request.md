# API: ServiceChangeSupplierRequest

## Tổng quan

Quản lý yêu cầu thay đổi chi phí dịch vụ do NCC (nhà cung cấp) đề nghị.

| API | Hệ thống | Auth | Mục đích |
|---|---|---|---|
| `POST /api/service-change-supplier-requests/` | **B → A** | Token supplier (RS256) | NCC tạo yêu cầu thay đổi cost |
| `GET /api/service-change-supplier-requests/` | **B → A** | Token supplier (RS256) | NCC xem danh sách yêu cầu của mình |
| `GET /api/service-change-supplier-requests/<id>/` | **B → A** | Token supplier (RS256) | NCC xem chi tiết yêu cầu |
| `GET /api/service-change-supplier-requests/admin-list/` | **A nội bộ** | Token web-user (HS256) | Admin/PT xem tất cả yêu cầu |

---

## 1. POST /api/service-change-supplier-requests/ — Tạo yêu cầu (Hệ thống B → A)

### Auth
Token `type=supplier` (RS256, `iss=system-b`). Supplier được xác định từ `sub` claim của token.

### Request body
```json
{
  "pnl": 123,
  "order": 456,
  "requested_cost": 1500000.00,
  "reason": "Giá xăng tăng 20%, đề nghị điều chỉnh phí vận chuyển"
}
```

### Validation
- `pnl` phải tồn tại và `pnl.supplier_id` phải trùng với `supplier_id` trong token
- `order` phải khớp với `pnl.order_id`
- Các trường bắt buộc: `pnl`, `order`, `requested_cost`
- Các trường tự động gán (không nhận từ request): `supplier`, `status=PENDING`, `created_by`

### Response 201
```json
{
  "id": 1,
  "pnl": 123,
  "order": 456,
  "supplier": 5,
  "requested_cost": "1500000.00",
  "reason": "Giá xăng tăng 20%, đề nghị điều chỉnh phí vận chuyển",
  "status": "PENDING",
  "approved_by": null,
  "approved_at": null,
  "created_by": "supplier:5",
  "created_at": "2026-06-08T10:00:00+07:00",
  "updated_by": null,
  "updated_at": null,
  "pnl_data": { ... },
  "order_data": { ... },
  "supplier_data": { ... }
}
```

### Lỗi
| Status | Ý nghĩa |
|---|---|
| 400 | `pnl` không thuộc supplier, hoặc `order` không khớp PNL, hoặc thiếu field |
| 401 | Token không hợp lệ hoặc hết hạn |
| 403 | Token không phải supplier |

---

## 2. GET /api/service-change-supplier-requests/ — Danh sách yêu cầu (Hệ thống B → A)

### Auth
Token `type=supplier` (RS256). Tự động filter `supplier_id = sub` từ token.

### Response 200
```json
[
  {
    "id": 1,
    "pnl": 123,
    "order": 456,
    "supplier": 5,
    "requested_cost": "1500000.00",
    "reason": "Giá xăng tăng 20%",
    "status": "PENDING",
    "approved_by": null,
    "approved_at": null,
    "created_by": "supplier:5",
    "created_at": "2026-06-08T10:00:00+07:00",
    "updated_by": null,
    "updated_at": null,
    "pnl_data": {
      "id": 123,
      "service_name": "Vận chuyển nội địa",
      "service_type": "Trucking",
      "supplier": 5,
      "supplier_name": "Công ty Vận tải XYZ",
      "cost": 1400000.00,
      "cost_after_vat": 1540000.00,
      "order_container": 456,
      ...
    },
    "order_data": {
      "id": 456,
      "order_code": "EXP-2026-0001",
      "booking_bill_number": "BB123456",
      "status": "IN_PROGRESS",
      "customer_name": "Công ty ABC",
      ...
    },
    "supplier_data": {
      "id": 5,
      "company_name": "Công ty Vận tải XYZ",
      "tax_number": "0123456789",
      "address": "Hà Nội",
      "is_active": true,
      ...
    }
  }
]
```

---

## 3. GET /api/service-change-supplier-requests/<id>/ — Chi tiết yêu cầu (Hệ thống B → A)

Tương tự response của list, nhưng chỉ trả về 1 object. Tự động chặn nếu `id` không thuộc supplier đó.

---

## 4. GET /api/service-change-supplier-requests/admin-list/ — Danh sách toàn bộ (Hệ thống A nội bộ)

### Auth
Token web-user HS256 (SimpleJWT). Dành cho user đăng nhập website A.

### Phân quyền theo role

| `role.desc` | Hành vi |
|---|---|
| `PT_TN` hoặc `PT_NV` | Filter: `pnl__order_container__kpi_cus = request.user.username` — chỉ thấy request liên quan đến CUS của mình |
| Còn lại (admin, PKD, ...) | Trả về tất cả request |

### Response 200
Giống response list ở mục 2, nhưng không bị filter theo supplier.

### Lỗi
| Status | Ý nghĩa |
|---|---|
| 403 | Token không phải web-user (VD: token supplier/service từ B) |

---

## Model fields reference

| Field | Type | Ghi chú |
|---|---|---|
| `id` | Integer | PK auto |
| `pnl` | FK → OrderContainerPnl | PNL cần thay đổi cost |
| `order` | FK → Order | Đơn hàng chứa PNL |
| `supplier` | FK → Supplier | NCC yêu cầu (tự gán từ token) |
| `requested_cost` | Decimal(15,2) | Cost mới trước VAT |
| `reason` | Text | Lý do thay đổi |
| `status` | CharField | PENDING / APPROVED / REJECTED |
| `approved_by` | CharField(100) | Người duyệt |
| `approved_at` | DateTime | Thời điểm duyệt |
| `created_by` | CharField(100) | Người tạo (tự gán) |
| `created_at` | DateTime | Thời điểm tạo |
| `updated_by` | CharField(100) | Người sửa |
| `updated_at` | DateTime | Thời điểm sửa |

---

## Triển khai phía Hệ thống B (Node.js)

### Token cần phát
```javascript
// Supplier token — cho API 1, 2, 3
issueSupplierToken(supplier) // sub = supplier.a_supplier_id

// Service token — không cần cho API này
```

### Proxy helper pattern
Mỗi request từ B đến A cần gắn header:
```
Authorization: Bearer <supplier_token>
```

Tài liệu tham khảo cơ chế xác thực: `SPEC-ket-noi-A-B.md`
