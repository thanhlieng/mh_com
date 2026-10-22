import { associationItems } from './about.content';
import { serviceSummaries } from './services.content';
import { HomeContent } from './types';

/**
 * Nội dung trang chủ — bám theo spec chính thức
 * `Demo_noi_dung_website_MHGS_261015.pdf`, mục 1 (1.1 → 1.6).
 *
 * Toàn bộ câu chữ giới thiệu, danh sách hãng tàu / hãng hàng không / hiệp hội
 * và các con số năng lực đều lấy từ spec, KHÔNG còn là số minh hoạ như bản
 * trước. Bản tiếng Anh là bản dịch từ tiếng Việt trong spec.
 */
export const homeContent: HomeContent = {
  hero: {
    eyebrow: { vi: 'Vận tải tối ưu — Chi phí tối thiểu', en: 'Optimal transport — Minimal cost' },
    headline: {
      vi: 'Giải pháp logistics & vận chuyển quốc tế cho doanh nghiệp',
      en: 'Logistics and international freight solutions for business',
    },
    sub: {
      vi: 'MH Great Sun cung cấp các giải pháp vận tải và logistics hiệu quả, linh hoạt, đáp ứng nhu cầu đa dạng của khách hàng — từ đường biển, hàng không đến đường bộ nội địa, xuyên biên giới và đại lý hải quan.',
      en: 'MH Great Sun delivers efficient, flexible transport and logistics solutions for a wide range of customer needs — sea, air, domestic and cross-border road freight, and customs brokerage.',
    },
    image: '/images/hero/hero-cargo.jpg',
  },

  // Mục 1.1
  intro: {
    heading: { vi: 'Giới thiệu', en: 'About us' },
    paragraphs: [
      {
        vi: 'Công ty Cổ phần Tiếp vận Quốc tế MH Great Sun được thành lập từ tâm huyết và khát vọng đóng góp vào sự phát triển của ngành logistics tại Việt Nam.',
        en: 'MH Great Sun International Logistics Joint Stock Company was founded out of a commitment to contribute to the growth of Vietnam’s logistics industry.',
      },
      {
        vi: 'MH Great Sun hướng đến việc cung cấp các giải pháp vận tải và logistics hiệu quả, linh hoạt, đáp ứng nhu cầu đa dạng của khách hàng. Chúng tôi không ngừng kết nối, xây dựng mạng lưới hợp tác nhằm tối ưu nguồn lực, nâng cao hiệu quả khai thác và hạn chế những bất cập của mô hình vận tải truyền thống.',
        en: 'MH Great Sun aims to provide efficient, flexible transport and logistics solutions for a diverse range of customer needs. We continuously build partnership networks to optimise resources, improve operating efficiency and overcome the limitations of traditional transport models.',
      },
    ],
    moreLabel: { vi: 'Xem thêm', en: 'Read more' },
    moreHref: '/about',
  },

  // Mục 1.2
  services: serviceSummaries,

  /**
   * Số liệu năng lực lấy nguyên văn từ spec (mục 3.2 và 3.3).
   * ⚠️ "Thị trường chính" đếm theo danh sách ở mục 3.1: Hoa Kỳ, Trung Quốc,
   * Nhật Bản, Hàn Quốc, Thái Lan, Ấn Độ, Châu Âu.
   */
  stats: [
    { value: '4000', label: { vi: 'Container mỗi tháng', en: 'Containers per month' } },
    { value: '100', suffix: '+', label: { vi: 'Tấn air cargo mỗi tháng', en: 'Tons of air cargo per month' } },
    { value: '120', label: { vi: 'Đầu kéo và xe tải', en: 'Tractors and trucks' } },
    { value: '7', label: { vi: 'Thị trường trọng điểm', en: 'Core markets' } },
  ],

  process: [
    { step: 1, icon: 'clipboard-list', title: { vi: 'Nhận yêu cầu', en: 'Request' }, detail: { vi: 'Gửi thông tin lô hàng, nhận phản hồi trong ngày', en: 'Send shipment details, get a response same day' } },
    { step: 2, icon: 'calculator', title: { vi: 'Báo giá', en: 'Quote' }, detail: { vi: 'Báo giá theo tuyến, loại hình, khối lượng cụ thể', en: 'Quote tailored to route, mode, and volume' } },
    { step: 3, icon: 'package-check', title: { vi: 'Nhận hàng', en: 'Pickup' }, detail: { vi: 'Kiểm đếm, niêm phong tại kho hoặc điểm hẹn', en: 'Cargo counted and sealed at warehouse or pickup point' } },
    { step: 4, icon: 'truck', title: { vi: 'Vận chuyển & thông quan', en: 'Transit & clearance' }, detail: { vi: 'Theo dõi realtime, xử lý chứng từ song song', en: 'Real-time tracking, documentation processed in parallel' } },
    { step: 5, icon: 'badge-check', title: { vi: 'Giao & POD', en: 'Delivery & POD' }, detail: { vi: 'Giao tận nơi, xác nhận điện tử', en: 'Door delivery with e-signature confirmation' } },
  ],

  // Mục 1.3 — danh sách lấy từ spec mục 2.3.
  associations: {
    eyebrow: { vi: 'Thành viên & liên kết', en: 'Memberships & affiliations' },
    heading: {
      vi: 'Các hiệp hội và tổ chức Logistics toàn cầu',
      en: 'Global logistics associations and organisations',
    },
    items: associationItems,
  },

  /**
   * Mục 1.4 — danh sách hãng tàu lấy nguyên văn từ spec mục 3.1, danh sách
   * hãng hàng không từ mục 3.2. Mỗi thẻ chỉ gồm logo + tên.
   *
   * Logo tải từ Wikimedia Commons (Public domain); Yang Ming lấy từ website
   * chính thức. Wan Hai và KMTC chưa có logo dùng được (site Wan Hai chặn
   * CAPTCHA, KMTC chỉ có bản trắng trên nền tối) nên hiển thị bằng chữ.
   */
  partners: {
    eyebrow: { vi: 'Mạng lưới đối tác', en: 'Partner network' },
    heading: {
      vi: 'Hợp tác cùng các hãng tàu và hãng hàng không quốc tế',
      en: 'Working with international shipping lines and airlines',
    },
    description: {
      vi: 'Thông qua việc ký kết các hợp đồng dài hạn với nhiều hãng tàu, chúng tôi đảm bảo năng lực cung ứng dịch vụ ổn định, chất lượng cao với mức giá cạnh tranh.',
      en: 'Through long-term contracts with multiple carriers, we maintain stable service capacity and high quality at competitive rates.',
    },
    carriers: {
      title: { vi: 'Hãng tàu', en: 'Shipping lines' },
      note: {
        vi: 'Đối tác vận chuyển đường biển quốc tế',
        en: 'International ocean freight partners',
      },
      items: [
        { name: 'Maersk', logo: '/images/partners/maersk.svg' },
        { name: 'ONE', logo: '/images/partners/one.svg' },
        { name: 'Yang Ming', logo: '/images/partners/yangming.png' },
        { name: 'Evergreen', logo: '/images/partners/evergreen.svg' },
        { name: 'COSCO', logo: '/images/partners/cosco.svg' },
        { name: 'CMA CGM', logo: '/images/partners/cma-cgm.svg' },
        { name: 'OOCL', logo: '/images/partners/oocl.svg' },
        { name: 'Wan Hai' },
        { name: 'KMTC' },
        { name: 'SITC', logo: '/images/partners/sitc.svg' },
        { name: 'MSC', logo: '/images/partners/msc.svg' },
      ],
    },
    airlines: {
      title: { vi: 'Hãng hàng không', en: 'Airlines' },
      note: {
        vi: 'Đối tác vận tải hàng không tại Việt Nam và Đông Dương',
        en: 'Air freight partners across Vietnam and Indochina',
      },
      items: [
        { name: 'Vietnam Airlines', logo: '/images/partners/vietnam-airlines.svg' },
        { name: 'China Airlines', logo: '/images/partners/china-airlines.svg' },
        { name: 'Cathay Pacific', logo: '/images/partners/cathay-pacific.svg' },
        { name: 'Qatar Airways', logo: '/images/partners/qatar-airways.svg' },
      ],
    },
  },

  /**
   * Mục 1.5 — thị trường chính lấy từ spec mục 3.1: Hoa Kỳ, Trung Quốc,
   * Nhật Bản, Hàn Quốc, Thái Lan, Ấn Độ, Châu Âu. Toạ độ là kinh/vĩ độ thật
   * của một điểm đại diện (thủ đô hoặc cảng chính), được chiếu lên bản đồ thế
   * giới trong `MarketsSection`.
   */
  markets: {
    eyebrow: { vi: 'Thị trường', en: 'Markets' },
    heading: {
      vi: 'Từ Việt Nam, toả đi các thị trường trọng điểm',
      en: 'From Vietnam, reaching the core markets',
    },
    description: {
      vi: 'Thị trường chính của MH Great Sun lần lượt là Hoa Kỳ, Trung Quốc, Nhật Bản, Hàn Quốc, Thái Lan, Ấn Độ và Châu Âu.',
      en: 'MH Great Sun’s core markets are the USA, China, Japan, South Korea, Thailand, India and Europe.',
    },
    origin: { vi: 'Việt Nam', en: 'Vietnam' },
    items: [
      { name: { vi: 'Hoa Kỳ', en: 'USA' }, lon: -118.2, lat: 34.0 }, // Los Angeles / Long Beach
      { name: { vi: 'Châu Âu', en: 'Europe' }, lon: 4.5, lat: 51.9 }, // Rotterdam
      { name: { vi: 'Trung Quốc', en: 'China' }, lon: 121.5, lat: 31.2, labelSide: 'left' }, // Thượng Hải
      { name: { vi: 'Hàn Quốc', en: 'South Korea' }, lon: 129.0, lat: 35.1 }, // Busan
      { name: { vi: 'Nhật Bản', en: 'Japan' }, lon: 139.7, lat: 35.6, labelSide: 'right' }, // Tokyo
      { name: { vi: 'Ấn Độ', en: 'India' }, lon: 72.9, lat: 19.0 }, // Mumbai / Nhava Sheva
      { name: { vi: 'Thái Lan', en: 'Thailand' }, lon: 100.9, lat: 13.1, labelSide: 'left' }, // Laem Chabang
    ],
  },

  // Mục 1.6
  news: {
    heading: { vi: 'Tin tức', en: 'News' },
    items: [],
  },

  quoteCta: {
    heading: { vi: 'Nhận tư vấn và báo giá cho lô hàng của bạn', en: 'Get advice and a quote for your shipment' },
    sub: {
      vi: 'Để lại thông tin, đội ngũ chuyên gia của chúng tôi sẽ sớm liên hệ để tư vấn và gửi báo giá phù hợp với nhu cầu của bạn.',
      en: 'Leave your details and our specialists will get in touch with advice and a quote that fits your needs.',
    },
  },
};
