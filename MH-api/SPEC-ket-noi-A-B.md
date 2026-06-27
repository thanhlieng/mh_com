# SPEC: Kết nối xác thực hệ thống B ↔ A

> **Đây là tài liệu ngữ cảnh dành cho AI assistant.** Đọc toàn bộ trước khi viết code. Mục tiêu: triển khai luồng để supplier đăng nhập ở hệ thống B và truy cập dữ liệu từ API của hệ thống A một cách an toàn. Phần "Yêu cầu triển khai" (mục 6) và "Tiêu chí hoàn thành" (mục 8) là phần bắt buộc bám sát.

---

## 1. Tổng quan hệ thống

Có hai hệ thống độc lập, do cùng một team kiểm soát (sửa được code cả hai):

| Hệ thống | Frontend | Backend | Vai trò |
|---|---|---|---|
| **A** | React | Django + Django REST Framework, dùng `djangorestframework-simplejwt` | Giữ **toàn bộ dữ liệu nghiệp vụ**. Có website + user riêng. |
| **B** | React | Node.js (Express) | Nơi **supplier đăng nhập** và sử dụng. |

## 2. Mô hình dữ liệu & đối tượng

- Hệ thống A có model `User` kế thừa `django.contrib.auth.models.AbstractUser` — dùng cho người đăng nhập **website A**.
- Hệ thống A có bảng riêng `Supplier` (khóa chính `id`).
- **Đối tượng đăng nhập vào B là `supplier` của A.** Supplier **KHÔNG bao giờ** đăng nhập vào A, không có tài khoản trong bảng `User` của A.
- Mỗi tài khoản trên B lưu sẵn trường `a_supplier_id` = `id` của supplier tương ứng bên A. Trường này do hệ thống gán khi tạo/liên kết tài khoản, **người dùng không được phép sửa**.
- Dữ liệu nghiệp vụ ở A liên kết với supplier qua cột `supplier_id` (ví dụ model `Shipment` có `supplier_id`).

## 3. Mục tiêu cần đạt

1. Supplier đăng nhập ở B (bằng cơ chế auth sẵn có của B — KHÔNG thay đổi).
2. Khi supplier cần dữ liệu của mình, B gọi API của A thay mặt supplier; A định danh đúng supplier và chỉ trả dữ liệu thuộc supplier đó.
3. B cũng cần gọi một số API "thường" của A không gắn với supplier cụ thể (master data: danh mục dịch vụ, cấu hình...). A chỉ cần xác nhận request đến từ B hợp lệ.
4. Website + user hiện tại của A phải tiếp tục hoạt động bình thường, không bị ảnh hưởng.

## 4. Ràng buộc & nguyên tắc bắt buộc

Đây là các quyết định kiến trúc đã chốt — **không tự thay đổi**:

1. **Frontend B KHÔNG gọi thẳng A.** Luồng bắt buộc: `FE B → BE B (Node) → API A (Django)`. Mọi khóa/credential liên quan tới A nằm sau BE B, không lộ ra browser.
2. **Tin tưởng bằng chữ ký số RS256, không bằng dữ liệu user.** B ký token bằng **private key của B**; A verify bằng **public key của B**. A KHÔNG cần có bản ghi user/supplier của B để tin — A tin vì verify được chữ ký.
3. **Hai hệ thống KHÔNG chia sẻ bí mật.** Không đưa `SIGNING_KEY` của A cho B; không đưa private key của B cho A. A chỉ giữ public key của B.
4. **Supplier KHÔNG phải User.** Token từ B ánh xạ tới bảng `Supplier`. **TUYỆT ĐỐI KHÔNG** tạo bản ghi `User` cho supplier, không ánh xạ supplier vào bảng `User`. Hai namespace tách biệt hoàn toàn.
5. **A luôn tự authorize.** Token chỉ chứng minh "đối tượng nào". Mọi query dữ liệu theo supplier phải `filter(supplier_id=...)` ở tầng view — không bao giờ trả dữ liệu của supplier khác.
6. **Token web A (HS256, SimpleJWT) và token từ B (RS256) chạy song song**, phân biệt qua claim `iss`. Không trộn chung khóa, không phá pipeline SimpleJWT hiện có.

## 5. Thiết kế token

3 loại token trong hệ thống, phân biệt qua `iss` + `type`:

| Nguồn | `iss` | `type` | Thuật toán | Đại diện | Dùng cho |
|---|---|---|---|---|---|
| Web A (sẵn có) | (SimpleJWT mặc định) | — | HS256 | user của A | Website A |
| B — supplier | `mhcom` | `supplier` | RS256 | một supplier | API dữ liệu theo supplier |
| B — service | `mhcom` | `service` | RS256 | hệ thống B | API thường (master data) |

**Claim token supplier (B → A):**
```json
{ "iss": "mhcom", "aud": "mhvn", "type": "supplier", "sub": "<a_supplier_id>", "exp": "10m" }
```

**Claim token service (B → A):**
```json
{ "iss": "mhcom", "aud": "mhvn", "type": "service", "exp": "10m" }
```

> `sub` của token supplier chính là `a_supplier_id` → A query thẳng `Supplier` theo id này, không cần bảng mapping.

## 6. Yêu cầu triển khai

### 6.1. Sinh & quản lý khóa
- Hướng dẫn sinh cặp khóa RS256 (`openssl`).
- Private key (`private.pem`) chỉ ở BE B, không commit vào git, đọc từ đường dẫn cấu hình được.
- Public key của B (`b_public.pem`) copy sang A.

### 6.2. Phía B (Node.js / Express)
- Module phát token: `issueSupplierToken(supplier)` và `issueServiceToken()`.
- Token sống ngắn (~10 phút). Token service nên **cache** lại (vì nội dung cố định, không gắn đối tượng) để không sinh mới mỗi request; token supplier sinh riêng từng request.
- Middleware/helper **proxy** tái dùng cho mọi route cần gọi A, để không lặp code gắn token ở từng endpoint. Phân biệt route cần token supplier vs token service.
- Trước khi phát token supplier: kiểm tra tài khoản đã có `a_supplier_id` chưa; nếu chưa, trả lỗi `409` rõ ràng, KHÔNG gọi A.
- Auth của user phía B (`authB`) là cơ chế sẵn có — giả định đã tồn tại, chỉ cần dùng `req.user` (chứa `a_supplier_id`).

### 6.3. Phía A (Django / DRF)
- Một `BaseAuthentication` class duy nhất (`MultiSourceJWTAuthentication`) xử lý cả 3 loại token:
  - Đọc `iss` (chưa verify) để chọn nhánh.
  - Nhánh `iss == 'mhcom'`: verify bằng public key của B, RS256, **bắt buộc kiểm `aud='mhvn'` và `iss='mhcom'` và `exp`**. Phân biệt `type`:
    - `supplier`: gắn `request.supplier_id = sub`, trả về một principal nhẹ (KHÔNG phải `User` DB).
    - `service`: `request.supplier_id = None`.
  - Nhánh còn lại (token web A): dùng `JWTAuthentication` của SimpleJWT như cũ; gắn `request.supplier_id = None`. **Không** ép `aud`/`iss` lên nhánh này (token A hiện không có các claim đó).
- Principal cho supplier: một class nhẹ với `is_authenticated = True` và `supplier_id`, KHÔNG đụng bảng `User`.
- View mẫu:
  - API theo supplier (`ShipmentList`): chốt `request.token_type == 'supplier'` và có `supplier_id`, nếu không → `PermissionDenied`. Query `filter(supplier_id=request.supplier_id)`.
  - API thường (`ServiceCatalog`): chấp nhận token service (và token supplier), từ chối loại không hợp lệ.
- (Tùy chọn nhưng khuyến khích) kiểm tra `Supplier` còn tồn tại/active trước khi trả data.

## 7. Lưu ý quan trọng (đừng bỏ qua)

- **API gắn supplier phải từ chối token service** — nếu không, token service (không có `sub`) có thể lách qua lớp định danh supplier. Đây là chốt chặn bảo mật then chốt.
- **Không dùng chung một biến cho user A và supplier.** Dùng `request.supplier_id` riêng; nhánh user A set nó `= None`. Lý do: `User#5` và `Supplier#5` là hai thực thể khác hẳn, lẫn lộn = lỗ hổng phân quyền.
- **`a_supplier_id` ở B là nguồn tin tuyệt đối** cho A. Đảm bảo nó được gán đúng và user không sửa được.

## 8. Tiêu chí hoàn thành (Definition of Done)

- [ ] Có hướng dẫn sinh cặp khóa RS256.
- [ ] BE B: 2 hàm phát token + cache token service + 1 helper proxy tái dùng + ví dụ 2 route (1 theo supplier, 1 master data) + xử lý lỗi 409 khi chưa liên kết supplier.
- [ ] BE A: `MultiSourceJWTAuthentication` xử lý đủ 3 loại token, verify đúng `aud/iss/exp` cho token B, giữ nguyên SimpleJWT cho token A.
- [ ] BE A: `SupplierPrincipal` không đụng bảng `User`.
- [ ] BE A: 2 view mẫu với chốt chặn `token_type` đúng như mục 6.3.
- [ ] Website + user A vẫn đăng nhập và hoạt động bình thường (không regression).
- [ ] Token supplier chỉ trả dữ liệu đúng supplier đó (test: supplier X không đọc được data supplier Y).
- [ ] Token service không lọt vào API gắn supplier.

## 9. Việc cần xử lý riêng cho A (ngoài phạm vi tích hợp nhưng nên làm)

Cấu hình SimpleJWT hiện tại của A có 2 vấn đề bảo mật cần sửa độc lập:

1. **`SIGNING_KEY` quá yếu** (hiện là chuỗi 4 ký tự). Thay bằng chuỗi ngẫu nhiên ≥ 32 byte lấy từ biến môi trường:
   ```python
   # python -c "import secrets; print(secrets.token_urlsafe(64))"
   'SIGNING_KEY': os.environ['A_JWT_SIGNING_KEY'],
   ```
2. **`ACCESS_TOKEN_LIFETIME = 100 ngày` quá dài.** Hạ xuống ~15–60 phút, dùng refresh token để gia hạn.

## 10. Stack & phiên bản tham khảo

- **A**: Python 3.x, Django, `djangorestframework`, `djangorestframework-simplejwt`, `PyJWT` (verify token B).
- **B**: Node.js, Express, `jsonwebtoken`.
- Thuật toán token nội bộ A: **HS256** (giữ nguyên). Thuật toán token liên hệ thống B→A: **RS256**.
