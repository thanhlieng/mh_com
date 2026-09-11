/**
 * Chế độ demo — bật bằng biến môi trường `NEXT_PUBLIC_DEMO_MODE=true` lúc build.
 *
 * Mục đích: deploy riêng phần web public để trình diễn, KHÔNG cần backend chạy
 * kèm. Khi bật, các phần phụ thuộc backend được xử lý như sau:
 *
 *  - Ẩn nút "Đăng nhập" (trỏ `/login-home` — cần API auth).
 *  - Ẩn link "Tuyển dụng" ở footer (trỏ `/recruitment` — trang cũ, cần API).
 *  - Trang Tin tức dùng bài viết MẪU tĩnh trong `content/news.demo.content.ts`
 *    thay vì gọi `GET /posts`, và trỏ sang trang chi tiết demo
 *    `/tin-tuc/[slug]` thay vì `/detail-post/[id]` (trang cũ, cần API).
 *
 * `NEXT_PUBLIC_*` được Next.js nội suy vào bundle lúc build, nên cờ này hoạt
 * động cả ở trang SSG. Không bật cờ thì toàn bộ hành vi giữ nguyên như cũ.
 */
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
