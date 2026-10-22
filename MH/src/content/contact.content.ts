import { Bilingual } from './types';

/**
 * Thông tin liên hệ — NGUỒN DUY NHẤT cho cả trang Liên hệ, Footer và tầng
 * tiện ích trên Header.
 *
 * Hotline và email lấy từ spec chính thức
 * `Demo_noi_dung_website_MHGS_261015.pdf` (mục 5).
 *
 * ⚠️ ĐỊA CHỈ TRỤ SỞ CHƯA ĐẦY ĐỦ: spec chỉ ghi "SH14" — thiếu tên toà nhà,
 * đường, phường và thành phố. Cần bổ sung địa chỉ đầy đủ trước khi lên
 * production; hiện tạm hiển thị đúng những gì spec cung cấp.
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
      vi: 'Vui lòng để lại thông tin theo biểu mẫu bên dưới. Đội ngũ chuyên gia của chúng tôi sẽ sớm liên hệ để tư vấn và gửi báo giá phù hợp với nhu cầu của bạn.',
      en: 'Please leave your details in the form below. Our specialists will contact you shortly with advice and a quote that fits your needs.',
    },
  },
  channels: [
    {
      kind: 'phone',
      label: { vi: 'Hotline', en: 'Hotline' },
      value: '024 3822 3355',
      href: 'tel:02438223355',
      note: { vi: 'Giờ hành chính', en: 'Business hours' },
    },
    {
      kind: 'email',
      label: { vi: 'Email', en: 'Email' },
      value: 'mh@mhgreatsun.vn',
      href: 'mailto:mh@mhgreatsun.vn',
      note: { vi: 'Phản hồi trong ngày làm việc', en: 'Answered within the business day' },
    },
    {
      kind: 'address',
      label: { vi: 'Trụ sở chính', en: 'Head office' },
      // ⚠️ Spec chỉ ghi "SH14" — chờ địa chỉ đầy đủ.
      value: 'SH14',
      note: {
        vi: 'Đang cập nhật địa chỉ đầy đủ',
        en: 'Full address to be confirmed',
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
