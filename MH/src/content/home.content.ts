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
    items: [
      { abbr: 'FIATA', name: { vi: 'Liên đoàn các Hiệp hội Giao nhận Quốc tế', en: 'International Federation of Freight Forwarders Associations' } },
      { abbr: 'IATA', name: { vi: 'Hiệp hội Vận tải Hàng không Quốc tế', en: 'International Air Transport Association' } },
      { abbr: 'WCA', name: { vi: 'Mạng lưới hợp tác logistics toàn cầu', en: 'Leading the World in Logistics Partnering' } },
      { abbr: 'FMC', name: { vi: 'Ủy ban Hàng hải Liên bang Hoa Kỳ', en: 'Federal Maritime Commission' } },
      { abbr: 'VLA', name: { vi: 'Hiệp hội Doanh nghiệp Dịch vụ Logistics Việt Nam', en: 'Vietnam Logistics Business Association' } },
      { abbr: 'VIETNAM CUSTOMS', name: { vi: 'Tổng cục Hải quan Việt Nam', en: 'Vietnam Customs' } },
    ],
  },

  /**
   * Mục 1.4 — danh sách hãng tàu lấy nguyên văn từ spec mục 3.1, danh sách
   * hãng hàng không từ mục 3.2.
   *
   * Logo tải từ Wikimedia Commons (đều Public domain). YangMing, Wanhai và
   * KMTC chưa tìm được logo tự do nên hiển thị bằng chữ — component tự xử lý.
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
        { name: 'Maersk', logo: '/images/partners/maersk.svg', note: { vi: 'Hãng tàu container', en: 'Container line' } },
        { name: 'ONE', logo: '/images/partners/one.svg', note: { vi: 'Ocean Network Express', en: 'Ocean Network Express' } },
        { name: 'YangMing', note: { vi: 'Hãng tàu container', en: 'Container line' } },
        { name: 'Evergreen', logo: '/images/partners/evergreen.svg', note: { vi: 'Hãng tàu container', en: 'Container line' } },
        { name: 'COSCO', logo: '/images/partners/cosco.svg', note: { vi: 'Hãng tàu container', en: 'Container line' } },
        { name: 'CMA CGM', logo: '/images/partners/cma-cgm.svg', note: { vi: 'Hãng tàu container', en: 'Container line' } },
        { name: 'OOCL', logo: '/images/partners/oocl.svg', note: { vi: 'Hãng tàu container', en: 'Container line' } },
        { name: 'Wanhai', note: { vi: 'Chuyên tuyến nội Á', en: 'Intra-Asia specialist' } },
        { name: 'KMTC', note: { vi: 'Chuyên tuyến nội Á', en: 'Intra-Asia specialist' } },
        { name: 'SITC', logo: '/images/partners/sitc.svg', note: { vi: 'Chuyên tuyến nội Á', en: 'Intra-Asia specialist' } },
        { name: 'MSC', logo: '/images/partners/msc.svg', note: { vi: 'Hãng tàu container', en: 'Container line' } },
      ],
    },
    airlines: {
      title: { vi: 'Hãng hàng không', en: 'Airlines' },
      note: {
        vi: 'Đối tác vận tải hàng không tại Việt Nam và Đông Dương',
        en: 'Air freight partners across Vietnam and Indochina',
      },
      items: [
        { name: 'Vietnam Airlines', logo: '/images/partners/vietnam-airlines.svg', note: { vi: 'Hãng hàng không quốc gia', en: 'National flag carrier' } },
        { name: 'China Airlines', logo: '/images/partners/china-airlines.svg', note: { vi: 'Tuyến Đông Á', en: 'East Asia routes' } },
        { name: 'Cathay Pacific', logo: '/images/partners/cathay-pacific.svg', note: { vi: 'Trung chuyển Hong Kong', en: 'Hong Kong hub' } },
        { name: 'Qatar Airways', logo: '/images/partners/qatar-airways.svg', note: { vi: 'Tuyến Trung Đông – Châu Âu', en: 'Middle East – Europe routes' } },
      ],
    },
  },

  /**
   * Mục 1.5 — thị trường chính lấy từ spec mục 3.1: Hoa Kỳ, Trung Quốc,
   * Nhật Bản, Hàn Quốc, Thái Lan, Ấn Độ, Châu Âu. Toạ độ là vị trí tương đối
   * trên khung bản đồ thế giới phẳng, không phải toạ độ địa lý chính xác.
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
    // Toạ độ đã giãn để nhãn không chồng nhau: các thị trường Đông Á xếp so le
    // theo trục dọc, Thái Lan tách khỏi điểm gốc Việt Nam.
    items: [
      { name: { vi: 'Hoa Kỳ', en: 'USA' }, x: 17, y: 36 },
      { name: { vi: 'Châu Âu', en: 'Europe' }, x: 45, y: 27 },
      { name: { vi: 'Trung Quốc', en: 'China' }, x: 74, y: 31 },
      { name: { vi: 'Hàn Quốc', en: 'South Korea' }, x: 88, y: 36 },
      { name: { vi: 'Nhật Bản', en: 'Japan' }, x: 90, y: 45 },
      { name: { vi: 'Ấn Độ', en: 'India' }, x: 60, y: 47 },
      { name: { vi: 'Thái Lan', en: 'Thailand' }, x: 67, y: 57 },
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
