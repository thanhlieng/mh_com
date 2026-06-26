# Tính năng "Báo cáo chất lượng" (NCC ↔ MHVN/GP) — Tài liệu triển khai

> Triển khai theo file `mhgs_log_be/docs/excel_123_structure.md` (Bảng 1: NCC, Bảng 2: MH/GP).
> Tạo trong phiên ngày **2026-06-26**.
> Branch hoạt động: `connect_v2` (đồng bộ trên cả `mhcom` + `mhgs_log_be`).

---

## 1. Tóm tắt nghiệp vụ

| Bên                    | Có thể tạo bản ghi? | Sửa/Xóa khi…                            | Đổi trạng thái cho…                                    |
| ---------------------- | ------------------- | --------------------------------------- | ------------------------------------------------------ |
| **NCC** (mhcom)        | Có                  | bản ghi do NCC tạo & đang `Đã gửi báo cáo` | bản ghi MHVN tạo (đang `Đã thông báo NCC`)           |
| **MHVN/GP** (nội bộ)   | Có                  | bản ghi do MHVN tạo & đang `Đã thông báo NCC` | bản ghi NCC tạo (đang `Đã gửi báo cáo`)        |

### Trạng thái

| value       | hiển thị             | Khi xuất hiện                                                           |
| ----------- | -------------------- | ----------------------------------------------------------------------- |
| `sent`      | Đã gửi báo cáo       | mặc định khi NCC tạo                                                    |
| `notified`  | Đã thông báo NCC     | mặc định khi MHVN tạo                                                   |
| `received`  | Đã tiếp nhận         | bên đối tác chuyển sang khi tiếp nhận (bổ sung theo yêu cầu)            |
| `processed` | Đã xử lý             | bên đối tác chuyển khi hoàn thành xử lý                                 |
| `rejected`  | Từ chối xử lý        | bên đối tác từ chối                                                     |

### Mức độ (3 mức)

| value    | hiển thị         |
| -------- | ---------------- |
| `low`    | Ảnh hưởng thấp   |
| `high`   | Ảnh hưởng cao    |
| `urgent` | Yêu cầu gấp      |

### Thông báo

Khi NCC (mhcom) gửi một báo cáo mới ⇒ tạo bản ghi `SupplierRequestNotification` (loại `QUALITY_REPORT`) cho **mọi user nội bộ** có `role.desc` chứa `"GD"` **HOẶC** `is_superuser=True`. Lỗi tạo notification là best-effort — không làm rớt request.

Các thông báo "yêu cầu thay đổi" (cost / price / chi-hộ) đã có sẵn — **không thay đổi**.

---

## 2. Kiến trúc dữ liệu

### Bảng `quality_reports` (Django, db postgres của mhgs_log_be)

Một bảng dùng chung cho 2 chiều, discriminator `source = 'ncc' | 'mhvn'`.

| Cột                    | Kiểu                         | Ghi chú                                              |
| ---------------------- | ---------------------------- | ---------------------------------------------------- |
| `id`                   | BigInt                       | PK                                                   |
| `source`               | 'ncc' / 'mhvn'               | bên tạo                                              |
| `system_target`        | 'mhvn' / 'gp'                | hệ A báo cáo thuộc về                                |
| `supplier_id`          | int                          | luôn set                                             |
| `supplier_name`        | varchar(500)                 | denormalized                                         |
| `created_by_user_id`   | FK users (null nếu source=ncc) | user nội bộ MHVN khi MHVN tạo                       |
| `created_by_label`     | varchar(255)                 | hiển thị: `mhcom:supplier:<id>` hoặc username       |
| `ngay_phat_sinh`       | datetime                     | NCC/MHVN bắt buộc                                    |
| `khach_hang`           | varchar(500)                 | text                                                 |
| `mo_ta_loi`            | text                         | bắt buộc khi tạo                                     |
| `anh_huong_cu_the`     | text                         | text                                                 |
| `muc_do`               | 'low'/'high'/'urgent'        | bắt buộc                                             |
| `nguyen_nhan_goc_re`   | text                         |                                                      |
| `bien_phap_khac_phuc`  | text                         |                                                      |
| `bien_phap_phong_ngua` | text                         |                                                      |
| `deadline_xu_ly`       | datetime                     |                                                      |
| `trang_thai`           | enum 5 trạng thái             | xem bảng trên                                        |
| `ngay_hoan_thanh`      | datetime                     | auto-set khi chuyển `processed`/`rejected` nếu null |
| `ghi_chu`              | text                         |                                                      |
| `created_at`, `updated_at` | datetime                  | audit                                                |
| `last_action_by_user`, `last_action_by_label` | …          | ai chuyển trạng thái lần cuối                       |

**Indexes:** `(source, supplier_id)`, `(trang_thai)`, `(ngay_phat_sinh)`, `(system_target)`.

### Migration

Tệp: `mhgs_log_be/notifications/migrations/0002_qualityreport.py` — chạy bằng:

```bash
cd F:/work/compose/mhgs_log_be
python manage.py migrate notifications
```

---

## 3. API

### 3.1. Django (mhgs_log_be) — root urls `prj/urls.py`

#### Cho NCC (token supplier RS256 do mhcom mint)

| Method | URL                                                          | Mô tả                                            |
| ------ | ------------------------------------------------------------ | ------------------------------------------------ |
| GET    | `/api/mhcom/supplier/quality-reports/?tab=sent|received&page=&page_size=&from=&to=&status=&severity=` | list                                |
| POST   | `/api/mhcom/supplier/quality-reports/`                       | NCC tạo → `trang_thai='sent'`, kích hoạt notify  |
| GET    | `/api/mhcom/supplier/quality-reports/<id>/`                  | chi tiết                                         |
| PATCH  | `/api/mhcom/supplier/quality-reports/<id>/`                  | NCC sửa (chỉ source=ncc & status=sent)           |
| DELETE | `/api/mhcom/supplier/quality-reports/<id>/`                  | NCC xoá (chỉ source=ncc & status=sent)           |
| POST   | `/api/mhcom/supplier/quality-reports/<id>/status/`           | NCC chuyển trạng thái cho báo cáo MHVN tạo       |
| GET    | `/api/mhcom/supplier/quality-reports/options/`               | severities / statuses / actions                  |

Permission: `SupplierTokenOnly` (token type='supplier').

#### Cho user nội bộ MHVN/GP (token web-user)

| Method | URL                                                                                              | Mô tả                                         |
| ------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| GET    | `/api/quality-reports/?tab=sent|received&supplier_id=&from=&to=&status=&severity=&page=&page_size=` | list (mhvn thêm `supplier_id`)                |
| POST   | `/api/quality-reports/`                                                                          | MHVN tạo về NCC → `trang_thai='notified'`     |
| GET    | `/api/quality-reports/<id>/`                                                                     | chi tiết                                      |
| PATCH  | `/api/quality-reports/<id>/`                                                                     | MHVN sửa (chỉ source=mhvn & status=notified)  |
| DELETE | `/api/quality-reports/<id>/`                                                                     | MHVN xoá (chỉ source=mhvn & status=notified)  |
| POST   | `/api/quality-reports/<id>/status/`                                                              | MHVN chuyển trạng thái cho báo cáo NCC gửi    |
| GET    | `/api/quality-reports/options/`                                                                  | severities / statuses / actions / suppliers   |

Permission: `IsAuthenticated` + check `token_type='web-user'`.

### 3.2. NestJS proxy (MH-api) — module `supplier-quality-reports`

Tất cả endpoint yêu cầu header **`X-A-Target: mhvn | gp`** + JWT của tài khoản NCC.

| Method | URL                                                | Proxy đến                                          |
| ------ | -------------------------------------------------- | -------------------------------------------------- |
| GET    | `/api/supplier/quality-reports?tab=&page=&…`       | Django `/api/mhcom/supplier/quality-reports/`      |
| POST   | `/api/supplier/quality-reports`                    | Django POST                                        |
| GET    | `/api/supplier/quality-reports/:id`                | Django GET detail                                  |
| PATCH  | `/api/supplier/quality-reports/:id`                | Django PATCH                                       |
| DELETE | `/api/supplier/quality-reports/:id`                | Django DELETE                                      |
| POST   | `/api/supplier/quality-reports/:id/status`         | Django POST status                                 |
| GET    | `/api/supplier/quality-reports/options`            | Django options                                     |

---

## 4. UI

### 4.1. MH (Next.js, mhcom) — `/supplier/quality-reports`

- Layout: `SupplierLayout` (đã có sidebar — đã thêm menu mới **"Báo cáo chất lượng"** với icon `ClipboardListIcon`).
- 2 Tabs: **"Báo cáo đã gửi"** (NCC tạo) / **"Báo cáo đã nhận"** (MHVN tạo về NCC).
- Filter bar: `DatePicker.RangePicker` (ngày phát sinh), `Select multiple` trạng thái, `Select multiple` mức độ.
- Table Ant Design size=small, scroll-x, pagination 10/20/50/100, hiển thị toàn bộ cột theo file Excel.
- Hành động:
  - Tab "gửi": chỉ hiện **Sửa / Xóa** khi `can_edit=true` (status='sent').
  - Tab "nhận": chỉ hiện **Tiếp nhận / Đã xử lý / Từ chối** khi status='notified'.
- Modal Form: dùng `Form` + `DatePicker (showTime)` cho cột ngày, `Input.TextArea` cho text dài, `Input` cho text ngắn, `Select` cho mức độ.

### 4.2. MH-logistic (React + Vite, mhvn/gp) — `/quality-report`

- Menu nav: top-level item **"Báo cáo chất lượng"** (icon `ListIcon`).
- 2 Tabs giống nhưng ngược vai trò: **"Báo cáo đã nhận (từ NCC)"** mặc định / **"Báo cáo đã gửi (MHVN tạo về NCC)"**.
- Filter bar có thêm `Select` **Lọc theo NCC** (loaded từ `/api/quality-reports/options/`).
- Cùng hành động tương tự nhưng đảo vai:
  - Tab "đã gửi" (MHVN): chỉ Sửa/Xóa khi `can_edit=true`.
  - Tab "đã nhận" (từ NCC): chỉ chuyển trạng thái khi report đang `sent`.
- Modal: thêm field bắt buộc **Nhà cung cấp** (Select từ danh sách Supplier).

---

## 5. Files thêm / sửa

### 5.1. mhgs_log_be (Django)

- **MỚI** `notifications/migrations/0002_qualityreport.py`
- **SỬA** `notifications/models.py` — thêm class `QualityReport`; thêm `Type.QUALITY_REPORT` vào `SupplierRequestNotification`.
- **SỬA** `notifications/mhcom_notify.py` — thêm hằng `_GD_MARK`; hàm `notify_quality_report_from_ncc(supplier, report)`.
- **MỚI** `notifications/quality_report_views.py` — 4 view cho web-user.
- **MỚI** `mhcom/supplier_quality_report_views.py` — 4 view cho supplier-token.
- **SỬA** `prj/urls.py` — import + register 8 URL patterns.

### 5.2. mhcom MH-api (NestJS)

- **MỚI** `src/modules/supplier-quality-reports/supplier-quality-reports.module.ts`
- **MỚI** `src/modules/supplier-quality-reports/supplier-quality-reports.service.ts`
- **MỚI** `src/modules/supplier-quality-reports/supplier-quality-reports.controller.ts`
- **SỬA** `src/app.module.ts` — import + register module.

### 5.3. mhcom MH (Next.js)

- **MỚI** `src/pages/supplier/quality-reports.tsx`
- **MỚI** `src/container/QualityReportsContainer/index.tsx`
- **MỚI** `src/container/QualityReportsContainer/QualityReportsTable.tsx`
- **MỚI** `src/container/QualityReportsContainer/QualityReportFormModal.tsx`
- **MỚI** `src/container/QualityReportsContainer/types.ts`
- **SỬA** `src/services/supplier.services.ts` — thêm 7 service function + types.
- **SỬA** `src/routes/routes.tsx` — thêm const `SUPPLIER_QUALITY_REPORTS`.
- **SỬA** `src/container/SupplierSidebar/index.tsx` — menu item mới.

### 5.4. MH-logistic (React + Vite)

- **MỚI** `src/apis/quality_reports/qualityReports.api.ts`
- **MỚI** `src/apis/quality_reports/qualityReports.hook.ts`
- **MỚI** `src/pages/QualityReport/index.tsx`
- **MỚI** `src/pages/QualityReport/components/QualityReportsTable.tsx`
- **MỚI** `src/pages/QualityReport/components/QualityReportFormModal.tsx`
- **SỬA** `src/constants/index.tsx` — import screen, register route + navItem.

---

## 6. Các bước chạy thử trên máy

### 6.1. Migrate DB (Django)

```bash
cd F:/work/compose/mhgs_log_be
python manage.py migrate notifications
```

> Kiểm tra: bảng `quality_reports` xuất hiện trong DB `gp_clone` (hoặc DB đang dùng).

### 6.2. Restart 2 instance Django (scheduler + scalable)

Nếu chạy bằng docker-compose:

```bash
cd F:/work/compose/mhgs_log_be
docker-compose restart backend-scheduler backend
```

### 6.3. Build/Restart NestJS (MH-api)

```bash
cd F:/work/mhcom/MH-api
yarn start:dev
```

### 6.4. Build/Restart Next.js (MH)

```bash
cd F:/work/mhcom/MH
yarn dev
```

Truy cập: `http://localhost:<port>/supplier/quality-reports`
(login bằng tài khoản NCC, chọn target mhvn hoặc gp ở sidebar nếu có ≥2).

### 6.5. Build/Restart MH-logistic

```bash
cd F:/work/compose/MH-logistic
# build mh:
yarn build --mode mh
# hoặc dev:
yarn dev
```

Truy cập: `http://localhost:<port>/quality-report` (login bằng user web nội bộ).

---

## 7. Test path đề xuất

### NCC (mhcom) → MHVN
1. Login NCC, vào "Báo cáo chất lượng", tab "Báo cáo đã gửi" → bấm **+ Gửi báo cáo**.
2. Điền form, **Gửi**. Bản ghi xuất hiện trạng thái `Đã gửi báo cáo` — nút Sửa/Xóa hoạt động.
3. Login user web có role chứa "GD" hoặc admin → thấy thông báo `QUALITY_REPORT` mới.
4. Vào MH-logistic `/quality-report` tab "Báo cáo đã nhận (từ NCC)" → thấy bản ghi đó.
5. Bấm **Tiếp nhận** → status đổi `Đã tiếp nhận`. Quay lại NCC kiểm tra cập nhật.
6. Bấm **Đã xử lý** hoặc **Từ chối** → status + `ngay_hoan_thanh` được set.

### MHVN → NCC
1. Tại MH-logistic `/quality-report` tab "Báo cáo đã gửi" → **+ Tạo báo cáo về NCC**, chọn NCC, điền form, lưu.
2. Bản ghi tạo với trạng thái `Đã thông báo NCC` — Sửa/Xóa hoạt động.
3. NCC login mhcom → tab "Báo cáo đã nhận" thấy bản ghi. Bấm Tiếp nhận / Đã xử lý / Từ chối.
4. MHVN quan sát cập nhật ở tab "Báo cáo đã gửi" (Sửa/Xóa biến mất khi status khác `notified`).

### Filter / Pagination
- Đổi range ngày, chọn nhiều trạng thái, nhiều mức độ → URL backend nhận `from/to/status/severity` (CSV).
- Đổi `page_size` 10/20/50/100; navigate qua các trang.
- Tại MHVN, lọc theo NCC để xem chỉ báo cáo của một supplier.

---

## 8. Lưu ý kỹ thuật

- Cùng schema bảng cho 2 chiều ⇒ chuyển trạng thái phải kèm guard `source` ở server.
- `ngay_hoan_thanh` được auto-set khi chuyển sang `processed`/`rejected` nếu chưa có.
- Notification gửi cho user GD/admin là best-effort, không làm rớt request POST.
- Front-end mhcom dùng `axiosClient2` đã tự gắn header `X-A-Target` (từ `activeTargetSlice`).
- Front-end MH-logistic dùng `AxiosClient` đã có sẵn JWT của user web nội bộ.

---

## 9. Mở rộng có thể làm sau (không trong scope)

- Export Excel theo đúng format file 123.xlsx (2 bảng với 2 màu header).
- Đính kèm file (ảnh, PDF) khi tạo báo cáo.
- Lịch sử thay đổi trạng thái (audit log riêng).
- Email/Slack ngoài notification trong app.
