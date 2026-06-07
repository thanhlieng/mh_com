# CLAUDE.md — MH Project Root

## Tổng quan

Dự án **MH** là hệ thống quản lý vận chuyển fullstack gồm hai thành phần chính:

| Thành phần | Công nghệ | Thư mục |
|---|---|---|
| Frontend | Next.js 12 · React 18 · TypeScript · Tailwind CSS · Ant Design · Redux Toolkit · React Query | `MH/` |
| Backend | NestJS 8 · TypeORM · PostgreSQL · JWT · Swagger | `MH-api/` |

Chi tiết stack đầy đủ: xem [`techstack-and-project-info.md`](techstack-and-project-info.md).

---

## Pipeline phát triển fullstack

Mọi tính năng mới đi qua pipeline sau, do các agent chuyên trách xử lý từng giai đoạn:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   DESIGN    │────▶│  FRONTEND   │────▶│   BACKEND    │────▶│     QA      │────▶│   DEPLOY    │
│  Wireframe  │     │ Next.js/    │     │  NestJS API  │     │ Jest +      │     │ Vercel +    │
│  UI Spec    │     │ React impl  │     │  DTO + DB    │     │ Supertest   │     │ PM2         │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
       ▲                   │                   │                    │
       └───────────────────┴───────────────────┘ ← ORCHESTRATOR điều phối
```

### Agents chuyên trách

| Agent | File | Mô tả |
|---|---|---|
| `orchestrator` | `.claude/agents/orchestrator.md` | Nhận yêu cầu tính năng, phân việc, theo dõi tiến độ pipeline |
| `design` | `.claude/agents/design.md` | Tạo wireframe text, UI spec, component list, API contract draft |
| `frontend` | `.claude/agents/frontend.md` | Implement Next.js pages, containers, components, services |
| `backend` | `.claude/agents/backend.md` | Implement NestJS module, controller, service, DTO, entity, migration |
| `qa` | `.claude/agents/qa.md` | Viết và chạy test Jest (unit, integration) + Supertest (E2E API) |

### Cách khởi động pipeline

Để triển khai một tính năng mới:

```
/agent:orchestrator Mô tả tính năng cần làm
```

Hoặc vào thẳng từng agent nếu đã có spec:

```
/agent:design      Thiết kế màn hình [tên tính năng]
/agent:frontend    Implement [tên component/page]
/agent:backend     Implement module [tên module]
/agent:qa          Viết test cho [tên tính năng]
```

---

## Quy ước toàn dự án

### Change-log (bắt buộc)
Sau mỗi thay đổi code, ghi vào `.claude/change-log.md` theo format:

```
## [YYYY-MM-DD HH:MM] — <tiêu đề>

**Yêu cầu:** ...
**Agent thực hiện:** design | frontend | backend | qa
**Các file đã thay đổi:**
- `path/file.ts` (dòng X–Y): mô tả
**Lý do / bối cảnh:** ...
**Ảnh hưởng fullstack:** (nếu có — endpoint/DTO/component bị ảnh hưởng)
```

### API Contract
- Khi backend thay đổi endpoint/DTO, **phải cập nhật** `MH-api/CLAUDE.md` và thông báo cho frontend agent.
- Khi frontend thêm service call mới, **phải kiểm tra** với backend agent trước.

### Ngôn ngữ
- Code: **tiếng Anh** (biến, function, comment kỹ thuật)
- Log, commit message, spec: **tiếng Việt**
