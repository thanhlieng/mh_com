# Multi-target A integration — Manual E2E Checklist

> Feature: mh_com cho phép 1 account liên kết đồng thời 2 hệ A (`mhvn` + `gp`),
> switch runtime qua header `X-A-Target` không cần re-login.

## Pre-requisite
- [ ] DB đã chạy migration `1772000000000-AddATargetAndAccountType`.
- [ ] Env BE: `MHVN_API_BASE_URL_MHVN`, `MHVN_API_BASE_URL_GP` set khác nhau (hoặc legacy `MHVN_API_BASE_URL`).
- [ ] Env BE: `MHCOM_PRIVATE_KEY_PATH_MHVN`, `MHCOM_PRIVATE_KEY_PATH_GP` (hoặc fallback `MHCOM_PRIVATE_KEY_PATH`).
- [ ] FE build với env trỏ đúng BE.
- [ ] Seed test data: 1 supplier account link cả mhvn=[12,18] và gp=[7]; 1 supplier account chỉ link mhvn; 1 customer account link cả 2 target; 1 account không link.

## UI — Supplier portal

- [ ] **Login supplier có 2 target** → sidebar hiển thị `<TargetSwitcher>` với 2 option.
- [ ] **Default target = `targets[0].a_target`** trong response `/api/account/a-targets` (hoặc giá trị từ localStorage nếu còn hợp lệ).
- [ ] **Label option đúng dạng `MHVN (2 NCC)` / `GP (1 NCC)`** — số entity_ids đúng.
- [ ] **Click switcher → đổi target** → bảng dữ liệu refetch:
  - [ ] DevTools Network: request gửi `X-A-Target` mới.
  - [ ] Request đi đúng baseUrl A tương ứng (mhvn → MHVN host, gp → GP host).
  - [ ] Notification "Đã chuyển sang hệ <TARGET>" hiển thị top.
  - [ ] React Query cache đã clear (xem state DevTools Query Inspector).
- [ ] **Account chỉ có 1 target** → switcher không hiển thị, nhưng request vẫn gửi `X-A-Target: <target duy nhất>`.
- [ ] **Account không có target nào** → login bị reject, modal error hiển thị, user bị logout.

## UI — Customer portal (chưa gắn TargetSwitcher)

- [ ] **Login customer có 2 target** → slice `activeTarget.current = targets[0].a_target` (auto pick).
- [ ] Request /api/* vẫn gửi `X-A-Target` đúng dù không có UI switcher.

## Persistence

- [ ] **Reload trang giữa chừng** → target giữ nguyên qua localStorage `mhcom_active_target`.
- [ ] **Logout** → localStorage `mhcom_active_target` và `mhcom_account_type` bị xóa.
- [ ] **Login lại** với account khác → state hydrate đúng theo response mới (target cũ trong localStorage được override nếu không còn hợp lệ).

## Auth & guards

- [ ] **Request thiếu `X-A-Target`** vào route có `ActiveTargetGuard` → 400 (verify message: "Header 'X-A-Target' bắt buộc...").
- [ ] **Request `X-A-Target: invalid`** → 400.
- [ ] **Request `X-A-Target: gp`** từ account không link gp → 409 (verify message: "chưa liên kết với hệ gp...").
- [ ] **Admin login** → các route admin (`/api/admin/*`, `/api/directory/*`) KHÔNG bị `ActiveTargetGuard` chặn; service token được mint theo `?target=` query.
- [ ] **Request `/api/account/a-targets`** chỉ cần JWT, không cần `X-A-Target` (whitelist trong axios interceptor).
- [ ] **Request `/auth/login`** không gửi `X-A-Target` (whitelist).

## Token correctness

- [ ] **Decode JWT outbound mhcom→A (target=mhvn, supplier link [12,18])**: claim `supplier_ids: ["12","18"]`, `sub: "12"`, `iss: "mhcom"`, `aud: "mhvn"`, `type: "supplier"`.
- [ ] **Decode JWT outbound (target=gp, supplier link [7])**: `supplier_ids: ["7"]`, `sub: "7"`.
- [ ] Khi config 2 private key khác nhau cho mhvn/gp: A side verify được bằng public key tương ứng.
- [ ] Khi chỉ có legacy `MHCOM_PRIVATE_KEY_PATH`: cả 2 target dùng cùng key, không lỗi.

## Admin link management

- [ ] **GET `/api/admin/account-links/:userId`** trả về `account_type` + `targets[]` đúng.
- [ ] **PUT `/api/admin/account-links/:userId`** với body `{ linkType: 'supplier', targets: [...] }` → replace toàn bộ link cho user; `users.account_type` được sync.
- [ ] PUT với `linkType: null` và `targets: []` → xóa toàn bộ link và set `account_type=null`.
- [ ] PUT với `a_target` không hợp lệ → 400.

## Edge cases

- [ ] User có 2 link cùng `(target, link_type, entity_id)` → UNIQUE constraint đảm bảo không bị duplicate.
- [ ] User có row supplier + row customer cho cùng target (data lệch) → guard chỉ trả entityIds đúng `accountType` từ `users.account_type`.
- [ ] Token service cho mhvn và gp cache độc lập — không bị share.
