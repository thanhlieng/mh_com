import { AssociationItem, Bilingual } from './types';

/**
 * Nội dung trang "Về chúng tôi" — lấy NGUYÊN VĂN từ spec chính thức
 * `Demo_noi_dung_website_MHGS_261015.pdf`, mục 2 (2.1 → 2.3).
 * Bản tiếng Anh là bản dịch từ tiếng Việt trong spec.
 */

export interface AboutValue {
  /** Cặp từ khoá hiển thị trong vòng tròn (spec: "Tận tâm - Hiệu quả"…). */
  pair: Bilingual;
  title: Bilingual;
  detail: Bilingual;
}

/**
 * Danh sách hiệp hội dùng chung cho trang chủ (mục 1.3) và trang Về chúng tôi
 * (mục 2.3). Logo lấy từ website chính thức của từng tổ chức; riêng FMC là con
 * dấu cơ quan liên bang Hoa Kỳ (Public domain, Wikimedia Commons).
 */
export const associationItems: AssociationItem[] = [
  { abbr: 'FIATA', logo: '/images/associations/fiata.svg', name: { vi: 'Liên đoàn các Hiệp hội Giao nhận Quốc tế', en: 'International Federation of Freight Forwarders Associations' } },
  { abbr: 'IATA', logo: '/images/associations/iata.svg', name: { vi: 'Hiệp hội Vận tải Hàng không Quốc tế', en: 'International Air Transport Association' } },
  { abbr: 'WCA', logo: '/images/associations/wca.png', name: { vi: 'Mạng lưới hợp tác logistics toàn cầu', en: 'Leading the World in Logistics Partnering' } },
  { abbr: 'FMC', logo: '/images/associations/fmc.svg', name: { vi: 'Ủy ban Hàng hải Liên bang Hoa Kỳ', en: 'Federal Maritime Commission' } },
  { abbr: 'VLA', logo: '/images/associations/vla.svg', name: { vi: 'Hiệp hội Doanh nghiệp Dịch vụ Logistics Việt Nam', en: 'Vietnam Logistics Business Association' } },
  { abbr: 'VIETNAM CUSTOMS', logo: '/images/associations/vietnam-customs.png', name: { vi: 'Tổng cục Hải quan Việt Nam', en: 'Vietnam Customs' } },
];

export const aboutContent = {
  hero: {
    eyebrow: { vi: 'Về chúng tôi', en: 'About us' },
    title: {
      vi: 'Vận tải tối ưu — Chi phí tối thiểu',
      en: 'Optimal transport — Minimal cost',
    },
    description: {
      vi: 'Công ty Cổ phần Tiếp vận Quốc tế MH Great Sun được thành lập từ tâm huyết và khát vọng đóng góp vào sự phát triển của ngành logistics tại Việt Nam.',
      en: 'MH Great Sun International Logistics Joint Stock Company was founded out of a commitment to contribute to the growth of Vietnam’s logistics industry.',
    },
    image: '/images/services/sea-hero.jpg',
  },

  /** Mục 2.1 — giới thiệu công ty. */
  intro: {
    heading: { vi: 'Giới thiệu công ty', en: 'Company profile' },
    slogan: { vi: 'VẬN TẢI TỐI ƯU - CHI PHÍ TỐI THIỂU', en: 'OPTIMAL TRANSPORT - MINIMAL COST' },
    paragraphs: [
      {
        vi: 'MH Great Sun hướng đến việc cung cấp các giải pháp vận tải và logistics hiệu quả, linh hoạt, đáp ứng nhu cầu đa dạng của khách hàng. Chúng tôi không ngừng kết nối, xây dựng mạng lưới hợp tác nhằm tối ưu nguồn lực, nâng cao hiệu quả khai thác và hạn chế những bất cập của mô hình vận tải truyền thống.',
        en: 'MH Great Sun aims to provide efficient, flexible transport and logistics solutions for a diverse range of customer needs. We continuously build partnership networks to optimise resources, improve operating efficiency and overcome the limitations of traditional transport models.',
      },
      {
        vi: 'MH Great Sun luôn lấy lợi ích của khách hàng làm trọng tâm, chú trọng tối ưu chi phí, nâng cao chất lượng dịch vụ và cải thiện hiệu quả vận hành trong từng giải pháp cung cấp. Với tinh thần hợp tác, trách nhiệm và không ngừng đổi mới, chúng tôi mong muốn trở thành đối tác logistics đáng tin cậy, đồng hành cùng khách hàng trên hành trình phát triển bền vững.',
        en: 'MH Great Sun puts customer interests at the centre, focusing on cost optimisation, service quality and operational efficiency in every solution we deliver. With a spirit of collaboration, accountability and continuous improvement, we aim to be a logistics partner our customers can rely on for the long term.',
      },
    ],
    image: '/images/services/road-card.jpg',
  },

  /** Mục 2.2 — tầm nhìn & sứ mệnh. */
  visionMission: {
    heading: { vi: 'Tầm nhìn - Sứ mệnh', en: 'Vision & Mission' },
    vision: {
      label: { vi: 'Tầm nhìn', en: 'Vision' },
      body: {
        vi: 'Trở thành một trong những doanh nghiệp logistics hàng đầu trong khu vực, là đối tác tin cậy của khách hàng trong việc cung cấp các giải pháp logistics toàn diện, linh hoạt và hiệu quả. Không ngừng đổi mới, nâng cao chất lượng dịch vụ và tối ưu hóa quy trình vận hành nhằm tạo dựng lợi thế cạnh tranh khác biệt và mang lại giá trị bền vững cho khách hàng.',
        en: 'To become one of the region’s leading logistics companies and a trusted partner in delivering comprehensive, flexible and efficient logistics solutions. We continuously innovate, raise service quality and optimise operations to build a distinctive competitive advantage and create lasting value for our customers.',
      },
    },
    mission: {
      label: { vi: 'Sứ mệnh', en: 'Mission' },
      body: {
        vi: 'Cung cấp các dịch vụ và giải pháp logistics tối ưu, đáp ứng linh hoạt nhu cầu của khách hàng, góp phần nâng cao hiệu quả hoạt động, tối ưu chi phí và gia tăng năng lực cạnh tranh cho doanh nghiệp. Thông qua chất lượng dịch vụ, tinh thần trách nhiệm và sự hợp tác bền vững, chúng tôi hướng đến việc tạo ra những giá trị thiết thực cho khách hàng, đối tác và cộng đồng.',
        en: 'To deliver optimal logistics services and solutions that respond flexibly to customer needs, improving their operations, reducing costs and strengthening their competitiveness. Through service quality, accountability and lasting partnership, we create practical value for customers, partners and the community.',
      },
    },
  },

  /** Mục 2.2 — ba giá trị cốt lõi, spec yêu cầu "tượng hình 3 vòng tròn liên kết với nhau". */
  values: {
    eyebrow: { vi: 'Giá trị cốt lõi', en: 'Core values' },
    heading: {
      vi: 'Ba giá trị gắn kết trong mọi việc chúng tôi làm',
      en: 'Three values that connect everything we do',
    },
    items: [
      {
        pair: { vi: 'Tận tâm - Hiệu quả', en: 'Dedicated - Effective' },
        title: { vi: 'Tận tâm và hiệu quả', en: 'Dedication and effectiveness' },
        detail: {
          vi: 'Luôn chủ động, trách nhiệm và nỗ lực hết mình trong mọi hoạt động, hướng đến mục tiêu tối ưu chi phí, nâng cao hiệu quả vận hành và mang lại giá trị thiết thực cho khách hàng.',
          en: 'Proactive, accountable and fully committed in everything we do — aiming to optimise cost, improve operating efficiency and bring practical value to customers.',
        },
      },
      {
        pair: { vi: 'Linh hoạt - Chủ động', en: 'Flexible - Proactive' },
        title: { vi: 'Linh hoạt và chủ động', en: 'Flexibility and initiative' },
        detail: {
          vi: 'Không ngừng tìm kiếm giải pháp phù hợp, xử lý nhanh chóng các tình huống phát sinh và thích ứng linh hoạt trước những thay đổi của thị trường, đảm bảo hoạt động logistics được triển khai thông suốt và hiệu quả.',
          en: 'Continuously seeking the right solution, resolving issues quickly and adapting to market change, so logistics operations run smoothly and efficiently.',
        },
      },
      {
        pair: { vi: 'Hợp tác - Bền vững', en: 'Collaborative - Sustainable' },
        title: { vi: 'Hợp tác và phát triển bền vững', en: 'Collaboration and sustainable growth' },
        detail: {
          vi: 'Xây dựng mối quan hệ lâu dài với khách hàng và đối tác trên cơ sở tin cậy, minh bạch và cùng có lợi. Luôn lắng nghe, chia sẻ và đồng hành để phát triển những giải pháp tối ưu, tạo dựng giá trị bền vững cho tất cả các bên.',
          en: 'Building long-term relationships with customers and partners on trust, transparency and mutual benefit. We listen, share and work alongside them to develop better solutions and lasting value for all parties.',
        },
      },
    ] as AboutValue[],
  },

  /** Mục 2.3 — các liên kết và hiệp hội. */
  associations: {
    eyebrow: { vi: 'Liên kết', en: 'Affiliations' },
    heading: { vi: 'Các liên kết và Hiệp hội', en: 'Affiliations and associations' },
    items: associationItems,
  },
};
