import { Bilingual } from './types';

/**
 * Thông tin liên hệ — NGUỒN DUY NHẤT cho cả trang Liên hệ, Footer và tầng
 * tiện ích trên Header.
 *
 * ⚠️⚠️ TOÀN BỘ SỐ LIỆU DƯỚI ĐÂY LÀ PLACEHOLDER, PHẢI THAY BẰNG THÔNG TIN THẬT
 * TRƯỚC KHI LÊN PRODUCTION.
 * Trang liên hệ cũ (`container/CustomerSupportForm`) ghi thông tin của **ACF**
 * (Vinhomes Thăng Long, Hoài Đức, Hà Nội · 19008972 · acf@gmail.com) — là
 * thương hiệu khác, cố ý không mang sang. Chưa có thông tin thật của MH nên
 * để placeholder nhất quán theo định vị cảng Hải Phòng.
 */

export interface ContactChannel {
  kind: 'phone' | 'email' | 'address';
  label: Bilingual;
  value: string;
  /** Đường dẫn khi bấm — tel:/mailto:/bản đồ. Để trống nếu không bấm được. */
  href?: string;
  note?: Bilingual;
}

export const contactContent = {
  hero: {
    eyebrow: { vi: 'Liên hệ', en: 'Contact' },
    title: {
      vi: 'Gửi thông tin lô hàng, nhận phương án trong ngày',
      en: 'Send us your shipment details, get a plan today',
    },
    description: {
      vi: 'Cho chúng tôi biết tuyến hàng, loại hàng và thời điểm dự kiến — đội kinh doanh sẽ phản hồi kèm báo giá cụ thể trong ngày làm việc.',
      en: 'Tell us your lane, cargo type and timing — our team replies with a concrete quote within the business day.',
    },
  },
  channels: [
    {
      kind: 'phone',
      label: { vi: 'Hotline', en: 'Hotline' },
      value: '+84 28 7300 1234',
      href: 'tel:+842873001234',
      note: { vi: 'Thứ 2 – Thứ 7, 8:00 – 17:30', en: 'Mon – Sat, 8:00 – 17:30' },
    },
    {
      kind: 'email',
      label: { vi: 'Email', en: 'Email' },
      value: 'contact@mhgreatsun.com',
      href: 'mailto:contact@mhgreatsun.com',
      note: { vi: 'Phản hồi trong ngày làm việc', en: 'Answered within the business day' },
    },
    {
      kind: 'address',
      label: { vi: 'Văn phòng', en: 'Office' },
      value: 'Hải Phòng, Việt Nam',
      note: {
        vi: 'Gần khu vực cảng Hải Phòng',
        en: 'Near the Hai Phong Port area',
      },
    },
  ] as ContactChannel[],
  /** Gợi ý nội dung cần gửi kèm để đội kinh doanh báo giá được ngay. */
  checklist: {
    heading: { vi: 'Gửi kèm những thông tin này để được báo giá nhanh', en: 'Include these details for a faster quote' },
    items: [
      { vi: 'Tuyến hàng: cảng/nước đi — điểm giao cuối', en: 'Lane: origin port/country — final delivery point' },
      { vi: 'Loại hàng và mã HS (nếu đã có)', en: 'Cargo type and HS code (if known)' },
      { vi: 'Khối lượng / số CBM / loại container', en: 'Weight / CBM / container type' },
      { vi: 'Thời điểm hàng sẵn sàng', en: 'When the cargo is ready' },
      { vi: 'Điều kiện Incoterm (nếu đã thống nhất)', en: 'Incoterm (if already agreed)' },
    ] as Bilingual[],
  },
};
