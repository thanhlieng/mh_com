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

/**
 * Năm dịch vụ theo spec nội dung chính thức (Demo_noi_dung_website_MHGS, mục 1.2 & 3).
 * Mỗi dịch vụ có màu thương hiệu riêng chạy xuyên suốt UI.
 */
export type ServiceSlug =
  | 'van-chuyen-duong-bien-quoc-te'
  | 'van-tai-hang-khong-quoc-te'
  | 'van-chuyen-duong-bo-noi-dia'
  | 'van-tai-duong-bo-xuyen-bien-gioi'
  | 'dai-ly-hai-quan';

export type ServiceAccent =
  | 'brand-green'
  | 'brand-blue'
  | 'brand-teal'
  | 'navy'
  | 'amber';

export interface ServiceSummary {
  slug: ServiceSlug;
  accent: ServiceAccent;
  /** Tên icon trong bộ lucide-react, xem src/components/ui/ServiceIcon.tsx */
  icon: 'truck' | 'ship' | 'file-check-2' | 'plane' | 'truck-cross-border';
  title: Bilingual;
  tagline: Bilingual;
  /** Ảnh thẻ dịch vụ ở trang chủ — 800×600, xem manifest ảnh trong change-log. */
  cardImage: string;
}

/** Hiệp hội / tổ chức logistics MH là thành viên hoặc liên kết (spec mục 1.3 & 2.3). */
export interface AssociationItem {
  abbr: string;
  name: Bilingual;
  logo?: string;
}

/** Thị trường chính MH khai thác (spec mục 1.5 & 3.1). */
export interface MarketItem {
  name: Bilingual;
  /** Toạ độ % trên khung bản đồ SVG (0–100), không phải toạ độ địa lý thật. */
  x: number;
  y: number;
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
  /** Mục 1.1 — giới thiệu ngắn trên trang chủ, có link "Xem thêm" sang /about. */
  intro: {
    heading: Bilingual;
    paragraphs: Bilingual[];
    moreLabel: Bilingual;
    moreHref: string;
  };
  /** Mục 1.3 — các hiệp hội và tổ chức logistics toàn cầu. */
  associations: {
    eyebrow: Bilingual;
    heading: Bilingual;
    items: AssociationItem[];
  };
  /** Mục 1.4 — mạng lưới đối tác: hãng tàu và hãng hàng không. */
  partners: {
    eyebrow: Bilingual;
    heading: Bilingual;
    description: Bilingual;
    carriers: {
      title: Bilingual;
      note: Bilingual;
      items: PartnerItem[];
    };
    airlines: {
      title: Bilingual;
      note: Bilingual;
      items: PartnerItem[];
    };
  };
  /** Mục 1.5 — bản đồ thị trường, từ Việt Nam toả ra các thị trường chính. */
  markets: {
    eyebrow: Bilingual;
    heading: Bilingual;
    description: Bilingual;
    origin: Bilingual;
    items: MarketItem[];
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
