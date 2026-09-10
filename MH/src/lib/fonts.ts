/**
 * Font cho trang public redesign (trang chủ + 3 trang dịch vụ). Chọn vì có bộ
 * dấu tiếng Việt thiết kế riêng (cân đối ở mọi cỡ) thay vì fallback dấu ghép
 * của Inter. Tự host qua @fontsource — cùng cách project đã dùng cho
 * @fontsource/roboto, không phụ thuộc version Next.js (project đang ở Next 12,
 * `@next/font` yêu cầu Next 13+ nên không dùng được).
 *
 * Import file CSS này một lần trong `_app.tsx`. Áp dụng qua utility
 * `font-display` (khai báo `--font-be-vietnam-pro` trong tailwind.config.js) —
 * không đổi font mặc định của body nên admin/manager/supplier không bị ảnh
 * hưởng.
 */
import '@fontsource/be-vietnam-pro/300.css';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/800.css';
