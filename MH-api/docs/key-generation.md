# Hướng dẫn sinh cặp khóa RS256 (System B ↔ A)

## 1. Sinh cặp khóa

Chạy một lần tại thư mục gốc của repo:

```bash
mkdir -p keys

# Sinh private key (2048-bit RSA)
openssl genrsa -out keys/private.pem 2048

# Xuất public key tương ứng
openssl rsa -in keys/private.pem -pubout -out keys/b_public.pem
```

## 2. Phân phối khóa

| File | Nơi giữ | Ghi chú |
|---|---|---|
| `keys/private.pem` | **Chỉ BE B** | KHÔNG commit, KHÔNG chia sẻ |
| `keys/b_public.pem` | Copy sang repo A | Đặt vào `keys/b_public.pem` phía A |

## 3. Biến môi trường

Thêm vào `.env` của BE B:

```
SYSTEM_B_PRIVATE_KEY_PATH=./keys/private.pem
```

Thêm vào `.env` (hoặc settings) của BE A:

```
SYSTEM_B_PUBLIC_KEY_PATH=./keys/b_public.pem
```

## 4. Lưu ý bảo mật

- `keys/private.pem` đã được thêm vào `.gitignore` — không bao giờ commit file này.
- Khi rotate khóa: sinh cặp mới, cập nhật `b_public.pem` ở A trước, deploy A, rồi mới deploy B với private key mới.
