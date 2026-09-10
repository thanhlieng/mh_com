/**
 * Kiểu dữ liệu nội dung cho trang chủ + trang dịch vụ (redesign web công khai).
 *
 * Đợt này nội dung được hardcode trong `src/content/*.content.ts`, nhưng mọi
 * trường song ngữ đi theo shape `{ vi, en }` — đúng convention `nameVi`/`nameEn`
 * của `homepage.entity.ts` (MH-api) và hàm `mappingOptionsHomepage()` sẵn có ở
 * `src/utils/common-function.ts`.
 *
 * Khi nối CMS thật (đợt sau), tầng page chỉ cần đổi
 * `import { homeContent } from '@/content/home.content'`
 * thành `useQuery(...)` trả về đúng các type này — không component nào phải sửa.
 */

/** Chuỗi song ngữ — field cơ bản nhất, lặp lại khắp nội dung. */
export interface Bilingual {
  vi: string;
  en: string;
}

/** Ba dịch vụ lõi — mỗi dịch vụ có màu thương hiệu riêng chạy xuyên suốt UI. */
export type ServiceSlug =
  | 'van-chuyen-duong-bo'
  | 'van-chuyen-duong-bien'
  | 'khai-bao-hai-quan';

export type ServiceAccent = 'brand-green' | 'brand-blue' | 'brand-teal';

export interface ServiceSummary {
  slug: ServiceSlug;
  accent: ServiceAccent;
  /** Tên icon trong bộ lucide-react, xem src/components/ui/ServiceIcon.tsx */
  icon: 'truck' | 'ship' | 'file-check-2';
  title: Bilingual;
  tagline: Bilingual;
  /** Ảnh thẻ dịch vụ ở trang chủ — 800×600, xem manifest ảnh trong change-log. */
  cardImage: string;
}

export interface SpecRow {
  label: Bilingual;
  value: Bilingual;
}

/** Tên icon minh hoạ cho từng bước quy trình — map sang lucide-react ở `ui/ProcessIcon.tsx`. */
export type ProcessIconName =
  | 'clipboard-list'
  | 'calculator'
  | 'package-check'
  | 'truck'
  | 'ship'
  | 'container'
  | 'file-text'
  | 'file-signature'
  | 'scan-line'
  | 'warehouse'
  | 'badge-check';

export interface ProcessStep {
  step: number;
  title: Bilingual;
  detail: Bilingual;
  icon: ProcessIconName;
  /** Bên thực hiện — hiển thị như nhãn nhỏ cạnh mốc, không bắt buộc. */
  actor?: Bilingual;
}

export interface FaqItem {
  question: Bilingual;
  answer: Bilingual;
}

export interface ServiceDetail extends ServiceSummary {
  /** Hero trang dịch vụ — 1600×700. */
  heroImage: string;
  heroHeadline: Bilingual;
  heroSub: Bilingual;
  specs: SpecRow[];
  process: ProcessStep[];
  faqs: FaqItem[];
}

export interface StatItem {
  value: string;
  suffix?: string;
  label: Bilingual;
}

/**
 * Một đối tác hiển thị ở mục "Đối tác". Hai nhóm:
 *  - `carrier`: hãng tàu có tuyến chạy đến cảng Việt Nam;
 *  - `domestic`: doanh nghiệp sản xuất trong nước.
 *
 * Hiện hiển thị bằng chữ (wordmark) chứ không dùng logo — tránh dùng nhãn hiệu
 * của bên thứ ba khi chưa có thoả thuận. Khi có logo được phép dùng, thêm
 * `logo` và render thay phần chữ.
 */
export interface PartnerItem {
  name: string;
  /** Dòng phụ: tuyến/khu vực khai thác (carrier) hoặc ngành hàng (domestic). */
  note: Bilingual;
  logo?: string;
}

export interface NewsTeaserItem {
  title: Bilingual;
  excerpt: Bilingual;
  date: string;
  href: string;
  image: string;
}

export interface HomeContent {
  hero: {
    eyebrow: Bilingual;
    headline: Bilingual;
    sub: Bilingual;
    /** Ảnh hero — 1920×1080, ưu tiên tối màu. */
    image: string;
  };
  services: ServiceSummary[];
  stats: StatItem[];
  process: ProcessStep[];
  partners: {
    eyebrow: Bilingual;
    heading: Bilingual;
    description: Bilingual;
    carriers: {
      title: Bilingual;
      note: Bilingual;
      items: PartnerItem[];
    };
    domestic: {
      title: Bilingual;
      note: Bilingual;
      items: PartnerItem[];
    };
  };
  news: {
    heading: Bilingual;
    items: NewsTeaserItem[];
  };
  quoteCta: {
    heading: Bilingual;
    sub: Bilingual;
  };
}
