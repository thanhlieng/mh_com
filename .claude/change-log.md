# Change Log — MH Project

> File này được ghi tự động bởi các agent (frontend, backend, qa) sau mỗi thay đổi code.
> Không xóa hay sửa các entry cũ.

## Format

```
## [YYYY-MM-DD HH:MM] — <tiêu đề>

**Yêu cầu:** ...
**Agent thực hiện:** design | frontend | backend | qa | orchestrator
**Các file đã thay đổi:**
- `path/file.ts` (dòng X–Y): mô tả
**Lý do / bối cảnh:** ...
**Ảnh hưởng fullstack:** (nếu có)
```

---

## [2026-06-07 00:04] — Nút Xuất Excel gọi API backend

**Yêu cầu:** Thêm nút xuất dữ liệu ra Excel, nút này request API chứ không lấy trực tiếp từ bảng.
**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/services/supplier.services.ts` (mới): service `exportCostStatement(params)` gọi `GET /supplier/cost-statement/export` với query params (from, to, billCode, customer, route), `responseType: 'blob'`, trả về `Promise<Blob>`. Kèm comment TODO cho backend.
- `MH/src/container/CostStatementContainer/index.tsx`: import service + `format` từ date-fns + icon `FileSpreadsheetIcon`, `Loader2Icon`; thêm state `isExporting`; thêm hàm `handleExport` — build params từ filter hiện tại → gọi service → tạo anchor download blob → trigger download → cleanup URL; thêm nút "Xuất Excel" ở góc phải filter bar, hiển thị spinner + text "Đang xuất..." khi đang gọi API, disabled khi `isExporting=true`.

**Lý do / bối cảnh:** Export phải do server tạo file (có thể cần join nhiều bảng, định dạng đặc biệt) chứ không nên serialize từ data đã load trên client.

**Ảnh hưởng fullstack:** Backend cần implement `GET /supplier/cost-statement/export` — nhận query params `from`, `to`, `billCode`, `customer`, `route`; trả về file `.xlsx` với header `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

## [2026-06-07 00:03] — Dirty cell tracking + nút Hoàn tác / Xác nhận

**Yêu cầu:** Đánh dấu các ô đã chỉnh sửa, đếm số thay đổi, thêm nút Hoàn tác và Xác nhận. Trạng thái dirty reset khi gọi API (hiện stub).
**Agent thực hiện:** frontend

**Các file đã thay đổi:**
- `MH/src/container/CostStatementContainer/index.tsx`: thêm `dirtyMap` state + `originalDataRef`; cập nhật `handleUpdate` để mark dirty; thêm prop `isDirty` vào `EditableTextCell` và `EditableNumericCell` (highlight amber); cập nhật `buildColumns` nhận `dirtyMap`; thêm action bar amber với nút Hoàn tác (revert) + Xác nhận (stub API); badge đếm thay đổi trên page header; row dirty tô nền amber nhạt.

**Lý do / bối cảnh:** UX cần phân biệt data đã sửa vs chưa sửa trước khi gửi lên server. Dirty state sẽ tự clear sau khi API trả về thành công.

---

## [2026-06-07 00:00] — Khởi tạo harness phát triển fullstack

**Yêu cầu:** Xây dựng harness fullstack với pipeline từ wireframe đến deployment.
**Agent thực hiện:** orchestrator

**Các file đã tạo:**
- `CLAUDE.md` (root): tổng quan dự án + pipeline overview
- `.claude/agents/orchestrator.md`: agent điều phối pipeline
- `.claude/agents/design.md`: agent thiết kế wireframe và UI spec
- `.claude/agents/frontend.md`: agent implement Next.js/React
- `.claude/agents/backend.md`: agent implement NestJS API
- `.claude/agents/qa.md`: agent viết và chạy tests
- `.claude/change-log.md`: file này
- `.claude/specs/` (thư mục): chứa spec của từng tính năng

**Lý do / bối cảnh:** Thiết lập harness chuẩn để team phát triển fullstack theo pipeline có tổ chức từ wireframe → design spec → backend API → frontend impl → QA test → deploy.
