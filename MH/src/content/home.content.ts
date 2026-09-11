import { serviceSummaries } from './services.content';
import { HomeContent } from './types';

/**
 * Nội dung trang chủ. Hardcode đợt này — shape khớp CMS tương lai, xem ghi
 * chú ở `src/content/types.ts`. Số liệu ở `stats` là số minh hoạ, cần thay
 * bằng số thật trước khi lên production (đánh dấu trong change-log).
 */
export const homeContent: HomeContent = {
  hero: {
    eyebrow: { vi: 'Vận chuyển & thông quan trọn gói', en: 'Freight & customs, end to end' },
    headline: {
      vi: 'Đưa hàng của bạn từ cảng Hải Phòng đi khắp thế giới',
      en: 'Moving your cargo from Hai Phong Port to the world',
    },
    sub: {
      vi: 'Đường bộ, đường biển và khai báo hải quan trong một đầu mối — kết nối hàng quốc tế qua cảng Hải Phòng và phân phối sâu vào nội địa, theo dõi hành trình theo thời gian thực.',
      en: 'Road, sea, and customs clearance under one roof — connecting international cargo through Hai Phong Port and distributing it deep inland, tracked in real time.',
    },
    image: '/images/hero/hero-cargo.jpg',
  },
  services: serviceSummaries,
  stats: [
    { value: '3000', suffix: '+', label: { vi: 'Lô hàng mỗi năm', en: 'Shipments per year' } },
    { value: '50', suffix: '+', label: { vi: 'Tuyến tàu quốc tế', en: 'International shipping lines' } },
    { value: '252', suffix: '+', label: { vi: 'Khách hàng doanh nghiệp', en: 'Corporate clients' } },
    { value: '98', suffix: '%', label: { vi: 'Giao đúng hạn', en: 'On-time delivery' } },
  ],
  process: [
    { step: 1, icon: 'clipboard-list', title: { vi: 'Nhận yêu cầu', en: 'Request' }, detail: { vi: 'Gửi thông tin lô hàng, nhận phản hồi trong ngày', en: 'Send shipment details, get a response same day' } },
    { step: 2, icon: 'calculator', title: { vi: 'Báo giá', en: 'Quote' }, detail: { vi: 'Báo giá theo tuyến, loại hình, khối lượng cụ thể', en: 'Quote tailored to route, mode, and volume' } },
    { step: 3, icon: 'package-check', title: { vi: 'Nhận hàng', en: 'Pickup' }, detail: { vi: 'Kiểm đếm, niêm phong tại kho hoặc điểm hẹn', en: 'Cargo counted and sealed at warehouse or pickup point' } },
    { step: 4, icon: 'truck', title: { vi: 'Vận chuyển & thông quan', en: 'Transit & clearance' }, detail: { vi: 'Theo dõi realtime, xử lý chứng từ song song', en: 'Real-time tracking, documentation processed in parallel' } },
    { step: 5, icon: 'badge-check', title: { vi: 'Giao & POD', en: 'Delivery & POD' }, detail: { vi: 'Giao tận nơi, xác nhận điện tử', en: 'Door delivery with e-signature confirmation' } },
  ],
  /**
   * ⚠️ DỮ LIỆU CẦN XÁC NHẬN TRƯỚC KHI LÊN PRODUCTION.
   *
   * `carriers`: các hãng tàu dưới đây đều CÓ tuyến chạy đến cảng Việt Nam
   * (thông tin ngành, đúng trên thực tế), nhưng việc gọi họ là "đối tác" của
   * MH thì chỉ MH mới xác nhận được — phải rà lại danh sách này theo hợp đồng
   * / quan hệ booking thực tế trước khi công bố, tránh tuyên bố quan hệ chưa có.
   *
   * `domestic`: cố ý ghi theo NGÀNH HÀNG + khu vực thay vì bịa tên doanh nghiệp
   * cụ thể. Thay bằng tên khách hàng thật (kèm sự đồng ý của họ) khi có.
   */
  partners: {
    eyebrow: { vi: 'Mạng lưới đối tác', en: 'Partner network' },
    heading: {
      vi: 'Làm việc cùng hãng tàu quốc tế và nhà máy trong nước',
      en: 'Working with global carriers and domestic manufacturers',
    },
    description: {
      vi: 'Hai đầu của mỗi lô hàng: hãng tàu đưa hàng cập cảng Việt Nam, và nhà máy nội địa nhận hàng hoặc gửi hàng đi.',
      en: 'Both ends of every shipment: carriers bringing cargo into Vietnamese ports, and domestic factories sending or receiving it.',
    },
    carriers: {
      title: { vi: 'Đối tác cảng biển', en: 'Ocean carriers' },
      note: {
        vi: 'Hãng tàu có tuyến khai thác đến cảng Việt Nam',
        en: 'Shipping lines calling at Vietnamese ports',
      },
      items: [
        { name: 'Maersk', logo: '/images/partners/maersk.svg', note: { vi: 'Á – Âu, Á – Mỹ', en: 'Asia–Europe, Asia–Americas' } },
        { name: 'MSC', logo: '/images/partners/msc.svg', note: { vi: 'Mạng lưới toàn cầu', en: 'Global network' } },
        { name: 'CMA CGM', logo: '/images/partners/cma-cgm.svg', note: { vi: 'Á – Âu, nội Á', en: 'Asia–Europe, intra-Asia' } },
        { name: 'COSCO', logo: '/images/partners/cosco.svg', note: { vi: 'Nội Á, xuyên Thái Bình Dương', en: 'Intra-Asia, transpacific' } },
        { name: 'Evergreen', logo: '/images/partners/evergreen.svg', note: { vi: 'Nội Á, Á – Mỹ', en: 'Intra-Asia, Asia–US' } },
        { name: 'ONE', logo: '/images/partners/one.svg', note: { vi: 'Á – Âu, Á – Mỹ', en: 'Asia–Europe, Asia–US' } },
        { name: 'HMM', logo: '/images/partners/hmm.svg', note: { vi: 'Nội Á, Á – Âu', en: 'Intra-Asia, Asia–Europe' } },
        { name: 'SITC', logo: '/images/partners/sitc.svg', note: { vi: 'Chuyên tuyến nội Á', en: 'Intra-Asia specialist' } },
      ],
    },
    domestic: {
      title: { vi: 'Đối tác nội địa', en: 'Domestic partners' },
      note: {
        vi: 'Doanh nghiệp sản xuất trong nước xuất – nhập hàng qua cảng',
        en: 'Vietnamese manufacturers shipping through the port',
      },
      items: [
        { name: 'Điện tử & linh kiện', note: { vi: 'KCN Bắc Ninh, Thái Nguyên', en: 'Bac Ninh, Thai Nguyen industrial zones' } },
        { name: 'Dệt may & da giày', note: { vi: 'Hải Dương, Hưng Yên, Nam Định', en: 'Hai Duong, Hung Yen, Nam Dinh' } },
        { name: 'Cơ khí & thiết bị', note: { vi: 'Hải Phòng, Quảng Ninh', en: 'Hai Phong, Quang Ninh' } },
        { name: 'Nhựa & bao bì', note: { vi: 'Hà Nội, Vĩnh Phúc', en: 'Hanoi, Vinh Phuc' } },
        { name: 'Nông sản & thực phẩm', note: { vi: 'Đồng bằng sông Hồng', en: 'Red River Delta' } },
        { name: 'Vật liệu xây dựng', note: { vi: 'Hải Dương, Ninh Bình', en: 'Hai Duong, Ninh Binh' } },
      ],
    },
  },
  news: {
    heading: { vi: 'Kiến thức xuất nhập khẩu', en: 'Trade & logistics insights' },
    items: [],
  },
  quoteCta: {
    heading: { vi: 'Nhận báo giá cho lô hàng của bạn', en: 'Get a quote for your shipment' },
    sub: {
      vi: 'Điền thông tin tuyến hàng, đội kinh doanh phản hồi trong ngày làm việc.',
      en: 'Share your route details — our team replies within one business day.',
    },
  },
};
