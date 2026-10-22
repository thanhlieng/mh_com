import { ServiceDetail, ServiceSummary } from './types';

/**
 * Nội dung 5 dịch vụ lõi — bám theo spec chính thức
 * `Demo_noi_dung_website_MHGS_261015.pdf` (mục 1.2 cho thẻ ở trang chủ, mục 3
 * cho trang chi tiết).
 *
 * Số liệu trong file này (70 xe đầu kéo, 50 xe tải, 4000 container/tháng,
 * 100+ tấn air cargo/tháng, danh sách hãng tàu & hãng bay) đều lấy NGUYÊN VĂN
 * từ spec — không phải số minh hoạ. Phần `process` và `faqs` là diễn giải quy
 * trình cho đủ bố cục trang, cần đội nghiệp vụ rà lại.
 */

export const serviceSummaries: ServiceSummary[] = [
  {
    slug: 'van-chuyen-duong-bien-quoc-te',
    accent: 'brand-blue',
    icon: 'ship',
    title: { vi: 'Vận chuyển đường biển quốc tế', en: 'International Sea Freight' },
    tagline: {
      vi: 'FCL, LCL, hàng dự án và hàng đặc thù đi khắp thế giới',
      en: 'FCL, LCL, project and special cargo worldwide',
    },
    cardImage: '/images/services/sea-card.jpg',
  },
  {
    slug: 'van-tai-hang-khong-quoc-te',
    accent: 'brand-teal',
    icon: 'plane',
    title: { vi: 'Vận tải hàng không quốc tế', en: 'International Air Freight' },
    tagline: {
      vi: 'Air Freight, Airport-to-Airport, Door-to-Door',
      en: 'Air freight, airport-to-airport, door-to-door',
    },
    cardImage: '/images/services/air-card.jpg',
  },
  {
    slug: 'van-chuyen-duong-bo-noi-dia',
    accent: 'brand-green',
    icon: 'truck',
    title: { vi: 'Vận chuyển đường bộ nội địa', en: 'Domestic Road Freight' },
    tagline: {
      vi: 'Đội xe 70 đầu kéo và 50 xe tải phủ toàn lãnh thổ Việt Nam',
      en: 'A fleet of 70 tractors and 50 trucks covering all of Vietnam',
    },
    cardImage: '/images/services/road-card.jpg',
  },
  {
    slug: 'van-tai-duong-bo-xuyen-bien-gioi',
    accent: 'navy',
    icon: 'truck-cross-border',
    title: { vi: 'Vận tải đường bộ xuyên biên giới', en: 'Cross-border Road Freight' },
    tagline: {
      vi: 'Kết nối Việt Nam – Trung Quốc – Lào – Campuchia',
      en: 'Connecting Vietnam – China – Laos – Cambodia',
    },
    cardImage: '/images/services/crossborder-card.jpg',
  },
  {
    slug: 'dai-ly-hai-quan',
    accent: 'amber',
    icon: 'file-check-2',
    title: { vi: 'Đại lý hải quan', en: 'Customs Brokerage' },
    tagline: {
      vi: 'Tư vấn thuế, thủ tục, kiểm hóa, giấy phép, C/O và hoàn thuế',
      en: 'Duty and procedure advisory, inspection, permits, C/O and refunds',
    },
    cardImage: '/images/services/customs-card.jpg',
  },
];

export const serviceDetails: Record<string, ServiceDetail> = {
  'van-chuyen-duong-bien-quoc-te': {
    ...serviceSummaries[0],
    heroImage: '/images/services/sea-hero.jpg',
    heroHeadline: {
      vi: 'Giải pháp vận tải đường biển toàn diện',
      en: 'End-to-end ocean freight solutions',
    },
    heroSub: {
      vi: 'Từ container FCL, hàng lẻ LCL đến các lô hàng dự án và hàng hóa đặc thù, kết nối các thị trường trên toàn thế giới.',
      en: 'From FCL containers and LCL consolidation to project cargo and special shipments, connecting markets worldwide.',
    },
    specs: [
      {
        label: { vi: 'Hình thức', en: 'Load types' },
        value: {
          vi: 'FCL, LCL, hàng dự án, hàng hóa đặc thù',
          en: 'FCL, LCL, project cargo, special cargo',
        },
      },
      {
        label: { vi: 'Hãng tàu đối tác', en: 'Carrier partners' },
        value: {
          vi: 'Maersk, ONE, YangMing, Evergreen, COSCO, CMA, OOCL, Wanhai, KMTC, SITC, MSC…',
          en: 'Maersk, ONE, YangMing, Evergreen, COSCO, CMA, OOCL, Wanhai, KMTC, SITC, MSC…',
        },
      },
      {
        label: { vi: 'Thị trường chính', en: 'Core markets' },
        value: {
          vi: 'Hoa Kỳ, Trung Quốc, Nhật Bản, Hàn Quốc, Thái Lan, Ấn Độ, Châu Âu',
          en: 'USA, China, Japan, South Korea, Thailand, India, Europe',
        },
      },
      {
        label: { vi: 'Cam kết dịch vụ', en: 'Service commitment' },
        value: {
          vi: 'Hợp đồng dài hạn với nhiều hãng tàu — năng lực cung ứng ổn định, giá cạnh tranh',
          en: 'Long-term carrier contracts — stable capacity at competitive rates',
        },
      },
    ],
    process: [
      { step: 1, icon: 'clipboard-list', title: { vi: 'Tiếp nhận yêu cầu', en: 'Request received' }, detail: { vi: 'Ghi nhận tuyến, loại hàng, khối lượng và thời điểm dự kiến', en: 'Lane, cargo type, volume and timing logged' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 2, icon: 'calculator', title: { vi: 'Báo giá & booking', en: 'Quote & booking' }, detail: { vi: 'Chào giá theo hợp đồng hãng tàu, giữ chỗ theo lịch tàu', en: 'Rates from carrier contracts, space booked per sailing' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 3, icon: 'container', title: { vi: 'Đóng hàng & hạ bãi', en: 'Stuffing & gate-in' }, detail: { vi: 'Đóng hàng tại kho hoặc cảng, hạ bãi trước giờ cutoff', en: 'Stuffed at warehouse or port, gated in before cutoff' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 4, icon: 'ship', title: { vi: 'Vận chuyển trên biển', en: 'Ocean transit' }, detail: { vi: 'Theo dõi lịch trình tàu và cập nhật ETA cho khách hàng', en: 'Vessel schedule tracked, ETA shared with the customer' }, actor: { vi: 'Hãng tàu', en: 'Carrier' } },
      { step: 5, icon: 'warehouse', title: { vi: 'Thông quan & giao hàng', en: 'Clearance & delivery' }, detail: { vi: 'Làm thủ tục tại cảng đến và giao hàng tận kho', en: 'Cleared at destination and delivered to the warehouse' }, actor: { vi: 'MH', en: 'MH' } },
    ],
    faqs: [
      { question: { vi: 'FCL và LCL khác nhau thế nào?', en: 'What is the difference between FCL and LCL?' }, answer: { vi: 'FCL là thuê nguyên container cho lô hàng của bạn; LCL là ghép chung container với các chủ hàng khác, phù hợp lô hàng nhỏ chưa đầy container.', en: 'FCL dedicates a whole container to your shipment; LCL consolidates it with other shippers — suited to volumes below a full container.' } },
      { question: { vi: 'MH có nhận hàng dự án, hàng quá khổ không?', en: 'Do you handle project and oversized cargo?' }, answer: { vi: 'Có. Hàng dự án và hàng hóa đặc thù nằm trong phạm vi dịch vụ; cần trao đổi trước để bố trí thiết bị và phương án xếp dỡ phù hợp.', en: 'Yes. Project and special cargo are part of our scope; please discuss in advance so we can arrange the right equipment and handling plan.' } },
      { question: { vi: 'MH làm việc với những hãng tàu nào?', en: 'Which carriers do you work with?' }, answer: { vi: 'Maersk, ONE, YangMing, Evergreen, COSCO, CMA, OOCL, Wanhai, KMTC, SITC, MSC và nhiều hãng khác, phần lớn theo hợp đồng dài hạn.', en: 'Maersk, ONE, YangMing, Evergreen, COSCO, CMA, OOCL, Wanhai, KMTC, SITC, MSC and others — mostly under long-term contracts.' } },
    ],
  },

  'van-tai-hang-khong-quoc-te': {
    ...serviceSummaries[1],
    heroImage: '/images/services/air-hero.jpg',
    heroHeadline: {
      vi: 'Vận tải hàng không cho hàng cần nhanh',
      en: 'Air freight for time-critical cargo',
    },
    heroSub: {
      vi: 'Khai thác qua mạng lưới các hãng hàng không uy tín tại Việt Nam và khu vực Đông Dương, năng lực xử lý trung bình trên 100 tấn air cargo mỗi tháng.',
      en: 'Operated through leading airlines across Vietnam and Indochina, handling an average of 100+ tons of air cargo per month.',
    },
    specs: [
      {
        label: { vi: 'Hình thức dịch vụ', en: 'Service types' },
        value: {
          vi: 'Air Freight, Airport-to-Airport, Door-to-Door Delivery',
          en: 'Air freight, airport-to-airport, door-to-door delivery',
        },
      },
      {
        label: { vi: 'Hãng hàng không', en: 'Airline partners' },
        value: {
          vi: 'Vietnam Airlines, China Airlines, Cathay Pacific, Qatar Airways…',
          en: 'Vietnam Airlines, China Airlines, Cathay Pacific, Qatar Airways…',
        },
      },
      {
        label: { vi: 'Năng lực xử lý', en: 'Handling capacity' },
        value: { vi: 'Trung bình 100+ tấn air cargo mỗi tháng', en: '100+ tons of air cargo per month on average' },
      },
      {
        label: { vi: 'Phạm vi', en: 'Coverage' },
        value: {
          vi: 'Việt Nam và khu vực Đông Dương, trên các tuyến quốc tế trọng điểm',
          en: 'Vietnam and Indochina, across key international lanes',
        },
      },
    ],
    process: [
      { step: 1, icon: 'clipboard-list', title: { vi: 'Tiếp nhận yêu cầu', en: 'Request received' }, detail: { vi: 'Xác định tuyến bay, trọng lượng, kích thước và thời hạn giao', en: 'Route, weight, dimensions and deadline confirmed' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 2, icon: 'calculator', title: { vi: 'Chào giá & giữ chỗ', en: 'Quote & space booking' }, detail: { vi: 'Chọn hãng bay phù hợp lịch trình và chi phí, giữ chỗ', en: 'Airline matched to schedule and cost, space secured' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 3, icon: 'package-check', title: { vi: 'Nhận & đóng kiện', en: 'Pickup & packing' }, detail: { vi: 'Nhận hàng, cân, đóng kiện và dán nhãn theo chuẩn hàng không', en: 'Cargo picked up, weighed, packed and labelled to air standards' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 4, icon: 'file-text', title: { vi: 'Thủ tục & soi chiếu', en: 'Documents & screening' }, detail: { vi: 'Hoàn tất chứng từ, soi chiếu an ninh và thông quan xuất', en: 'Documentation completed, security screening and export clearance' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 5, icon: 'badge-check', title: { vi: 'Giao hàng', en: 'Delivery' }, detail: { vi: 'Giao tại sân bay đến hoặc tận kho theo Door-to-Door', en: 'Delivered at destination airport or door-to-door' }, actor: { vi: 'MH', en: 'MH' } },
    ],
    faqs: [
      { question: { vi: 'Door-to-Door khác Airport-to-Airport thế nào?', en: 'How does door-to-door differ from airport-to-airport?' }, answer: { vi: 'Airport-to-Airport chỉ gồm chặng bay giữa hai sân bay; Door-to-Door bao gồm cả nhận hàng tại kho người gửi và giao tận kho người nhận.', en: 'Airport-to-airport covers only the flight between two airports; door-to-door also covers pickup at the shipper and delivery to the consignee.' } },
      { question: { vi: 'Hàng nào nên đi đường hàng không?', en: 'Which cargo suits air freight?' }, answer: { vi: 'Hàng gấp theo tiến độ sản xuất, hàng giá trị cao, hàng mẫu hoặc lô nhỏ cần giao nhanh — khi chi phí vận chuyển nhỏ hơn thiệt hại do chậm trễ.', en: 'Production-critical, high-value, sample or small urgent shipments — where freight cost is lower than the cost of delay.' } },
    ],
  },

  'van-chuyen-duong-bo-noi-dia': {
    ...serviceSummaries[2],
    heroImage: '/images/services/road-hero.jpg',
    heroHeadline: {
      vi: 'Đội xe riêng, phủ toàn lãnh thổ Việt Nam',
      en: 'Our own fleet, covering all of Vietnam',
    },
    heroSub: {
      vi: 'Với 70 xe đầu kéo và 50 xe tải thường, MH Great Sun vận chuyển nguyên container, nguyên chuyến và gom hàng đường bộ từ cảng biển, sân bay tới các khu công nghiệp và trung tâm phân phối.',
      en: 'With 70 tractor units and 50 trucks, MH Great Sun moves full containers, full truckloads and consolidated road cargo from seaports and airports to industrial zones and distribution centres.',
    },
    specs: [
      {
        label: { vi: 'Đội xe', en: 'Fleet' },
        value: { vi: '70 xe đầu kéo và 50 xe tải thường', en: '70 tractor units and 50 trucks' },
      },
      {
        label: { vi: 'Dịch vụ', en: 'Services' },
        value: {
          vi: 'Nguyên container, nguyên chuyến, gom hàng đường bộ',
          en: 'Full container, full truckload, road consolidation',
        },
      },
      {
        label: { vi: 'Năng lực xử lý', en: 'Handling capacity' },
        value: {
          vi: 'Trung bình 4.000 container mỗi tháng',
          en: 'An average of 4,000 containers per month',
        },
      },
      {
        label: { vi: 'Phạm vi', en: 'Coverage' },
        value: {
          vi: 'Từ hệ thống cảng biển và sân bay quốc tế tới khu công nghiệp, trung tâm phân phối trên toàn quốc',
          en: 'From seaports and international airports to industrial zones and distribution centres nationwide',
        },
      },
    ],
    process: [
      { step: 1, icon: 'clipboard-list', title: { vi: 'Tiếp nhận yêu cầu', en: 'Request received' }, detail: { vi: 'Ghi nhận điểm nhận – điểm giao, loại hàng và khối lượng', en: 'Pickup and delivery points, cargo type and volume logged' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 2, icon: 'calculator', title: { vi: 'Báo giá & điều xe', en: 'Quote & dispatch' }, detail: { vi: 'Báo giá trong ngày và điều phương tiện phù hợp tải trọng', en: 'Same-day quote and a vehicle matched to the payload' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 3, icon: 'package-check', title: { vi: 'Nhận hàng', en: 'Cargo pickup' }, detail: { vi: 'Kiểm đếm, niêm phong và ghi nhận tình trạng hàng', en: 'Counted, sealed and condition recorded' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 4, icon: 'truck', title: { vi: 'Vận chuyển', en: 'In transit' }, detail: { vi: 'Theo dõi hành trình qua hệ thống checkpoint nội bộ', en: 'Tracked through our internal checkpoint system' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 5, icon: 'badge-check', title: { vi: 'Giao hàng & POD', en: 'Delivery & POD' }, detail: { vi: 'Giao tận nơi và xác nhận ký nhận điện tử', en: 'Door delivery with electronic proof of delivery' }, actor: { vi: 'Khách hàng', en: 'Customer' } },
    ],
    faqs: [
      { question: { vi: 'MH có nhận hàng lẻ không đầy xe không?', en: 'Do you accept less-than-truckload cargo?' }, answer: { vi: 'Có. Dịch vụ gom hàng đường bộ ghép nhiều lô trên cùng chuyến để tối ưu chi phí cho lô hàng nhỏ.', en: 'Yes. Our road consolidation service combines several shipments on one trip to optimise cost for smaller volumes.' } },
      { question: { vi: 'Theo dõi hành trình xe bằng cách nào?', en: 'How is the trip tracked?' }, answer: { vi: 'Mỗi chuyến đi qua hệ thống checkpoint nội bộ, trạng thái được cập nhật theo từng mốc thay vì phải gọi hỏi từng khâu.', en: 'Every trip passes through our internal checkpoint system, with status updated at each milestone instead of chasing by phone.' } },
    ],
  },

  'van-tai-duong-bo-xuyen-bien-gioi': {
    ...serviceSummaries[3],
    heroImage: '/images/services/crossborder-hero.jpg',
    heroHeadline: {
      vi: 'Vận tải đường bộ xuyên biên giới',
      en: 'Cross-border road freight',
    },
    heroSub: {
      vi: 'Kết nối Việt Nam với Trung Quốc, Lào và Campuchia qua hệ thống cửa khẩu chính, nhận hàng từ nội địa nước bạn và giao tới điểm cuối trong khu vực.',
      en: 'Connecting Vietnam with China, Laos and Cambodia through the main border gates, picking up inland and delivering to the final destination in the region.',
    },
    specs: [
      {
        label: { vi: 'Việt Nam – Trung Quốc – Lào', en: 'Vietnam – China – Laos' },
        value: {
          vi: 'Nhận hàng từ bất cứ điểm nào tại Trung Quốc, trung chuyển qua Quảng Châu, Thẩm Quyến, Nam Ninh, về qua cửa khẩu Hữu Nghị Quan; giao tại Việt Nam hoặc Lào',
          en: 'Pickup anywhere in China, transiting Guangzhou, Shenzhen and Nanning, entering via Huu Nghi Quan border gate; delivery in Vietnam or Laos',
        },
      },
      {
        label: { vi: 'Việt Nam – Campuchia', en: 'Vietnam – Cambodia' },
        value: {
          vi: 'Hàng từ nước ngoài về cảng TP. Hồ Chí Minh, hoặc từ Việt Nam qua các cửa khẩu vào Campuchia',
          en: 'Cargo arriving at Ho Chi Minh City ports, or moving from Vietnam through the border gates into Cambodia',
        },
      },
      {
        label: { vi: 'Việt Nam – Lào', en: 'Vietnam – Laos' },
        value: {
          vi: 'Hàng từ nước ngoài về cảng Đà Nẵng, Hải Phòng, rồi qua các cửa khẩu vào Lào',
          en: 'Cargo arriving at Da Nang or Hai Phong ports, then crossing into Laos via the border gates',
        },
      },
      {
        label: { vi: 'Cửa khẩu chính', en: 'Main border gate' },
        value: { vi: 'Hữu Nghị Quan', en: 'Huu Nghi Quan' },
      },
    ],
    process: [
      { step: 1, icon: 'clipboard-list', title: { vi: 'Xác định tuyến', en: 'Lane planning' }, detail: { vi: 'Chốt điểm nhận ở nước bạn, cửa khẩu và điểm giao cuối', en: 'Overseas pickup point, border gate and final delivery confirmed' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 2, icon: 'package-check', title: { vi: 'Nhận hàng tại nước bạn', en: 'Overseas pickup' }, detail: { vi: 'Gom hàng và trung chuyển qua các trung tâm trong khu vực', en: 'Cargo collected and moved through regional hubs' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 3, icon: 'file-text', title: { vi: 'Thủ tục cửa khẩu', en: 'Border formalities' }, detail: { vi: 'Chuẩn bị chứng từ và làm thủ tục thông quan tại cửa khẩu', en: 'Documents prepared and clearance handled at the border gate' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 4, icon: 'truck', title: { vi: 'Vận chuyển xuyên biên', en: 'Cross-border haul' }, detail: { vi: 'Chạy tuyến qua cửa khẩu và tiếp tục chặng nội địa', en: 'Crossing the border and continuing on the domestic leg' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 5, icon: 'badge-check', title: { vi: 'Giao hàng', en: 'Delivery' }, detail: { vi: 'Giao tại điểm cuối ở Việt Nam, Lào hoặc Campuchia', en: 'Delivered at the final point in Vietnam, Laos or Cambodia' }, actor: { vi: 'MH', en: 'MH' } },
    ],
    faqs: [
      { question: { vi: 'Có nhận hàng từ sâu trong nội địa Trung Quốc không?', en: 'Can you pick up deep inside China?' }, answer: { vi: 'Có. Hàng có thể nhận từ bất cứ điểm nào tại Trung Quốc, sau đó trung chuyển qua Quảng Châu, Thẩm Quyến hoặc Nam Ninh rồi về qua cửa khẩu Hữu Nghị Quan.', en: 'Yes. Cargo can be collected anywhere in China, then transited via Guangzhou, Shenzhen or Nanning and brought in through the Huu Nghi Quan border gate.' } },
      { question: { vi: 'Điểm giao cuối có thể ở nước thứ ba không?', en: 'Can the final delivery be in a third country?' }, answer: { vi: 'Có. Với tuyến Việt Nam – Trung Quốc – Lào, điểm giao hàng có thể tại Việt Nam hoặc tại Lào tuỳ yêu cầu.', en: 'Yes. On the Vietnam–China–Laos lane, delivery can be made in either Vietnam or Laos as required.' } },
    ],
  },

  'dai-ly-hai-quan': {
    ...serviceSummaries[4],
    heroImage: '/images/services/customs-hero.jpg',
    heroHeadline: {
      vi: 'Đại lý hải quan — xử lý nhanh, chính xác',
      en: 'Customs brokerage — fast and accurate',
    },
    heroSub: {
      vi: 'Đội ngũ giàu kinh nghiệm tại các chi cục hải quan tư vấn nhanh và chính xác, giúp doanh nghiệp tiết kiệm thời gian xử lý hồ sơ và thông quan hàng hóa.',
      en: 'An experienced team working across customs sub-departments advises quickly and accurately, saving businesses time on paperwork and clearance.',
    },
    specs: [
      { label: { vi: 'Tư vấn thuế', en: 'Duty advisory' }, value: { vi: 'Xác định thuế suất và nghĩa vụ thuế áp dụng cho lô hàng', en: 'Applicable duty rates and tax obligations for the shipment' } },
      { label: { vi: 'Tư vấn thủ tục', en: 'Procedure advisory' }, value: { vi: 'Hướng dẫn loại hình tờ khai và bộ chứng từ cần chuẩn bị', en: 'Guidance on declaration type and the document set required' } },
      { label: { vi: 'Kiểm hóa', en: 'Physical inspection' }, value: { vi: 'Phối hợp kiểm tra thực tế hàng hóa tại cảng, kho', en: 'Coordinating physical inspection at the port or warehouse' } },
      { label: { vi: 'Giấy phép & C/O', en: 'Permits & C/O' }, value: { vi: 'Xin giấy phép chuyên ngành và xin cấp phép C/O', en: 'Specialised permits and Certificate of Origin applications' } },
      { label: { vi: 'Hoàn thuế', en: 'Duty refund' }, value: { vi: 'Lập hồ sơ và theo dõi thủ tục hoàn thuế', en: 'Preparing and following through duty refund filings' } },
    ],
    process: [
      { step: 1, icon: 'scan-line', title: { vi: 'Tư vấn mã HS & thuế', en: 'HS code & duty advisory' }, detail: { vi: 'Xác định mã HS và thuế suất trước khi mở tờ khai', en: 'HS code and duty rate confirmed before filing' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 2, icon: 'file-text', title: { vi: 'Chuẩn bị chứng từ', en: 'Document preparation' }, detail: { vi: 'Rà soát invoice, packing list, vận đơn, C/O', en: 'Invoice, packing list, bill of lading and C/O reviewed' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 3, icon: 'file-signature', title: { vi: 'Mở tờ khai', en: 'File the declaration' }, detail: { vi: 'Truyền tờ khai điện tử và nhận kết quả phân luồng', en: 'E-declaration submitted and the clearance channel returned' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 4, icon: 'package-check', title: { vi: 'Kiểm hóa theo luồng', en: 'Channel handling' }, detail: { vi: 'Phối hợp kiểm tra hồ sơ hoặc kiểm hóa thực tế khi cần', en: 'Coordinating document checks or physical inspection where required' }, actor: { vi: 'Hải quan', en: 'Customs' } },
      { step: 5, icon: 'badge-check', title: { vi: 'Thông quan & bàn giao', en: 'Release & handover' }, detail: { vi: 'Hoàn tất nghĩa vụ thuế và bàn giao hàng cho khách', en: 'Duties settled and cargo handed over to the customer' }, actor: { vi: 'MH', en: 'MH' } },
    ],
    faqs: [
      { question: { vi: 'MH hỗ trợ xin C/O loại nào?', en: 'Which C/O types do you support?' }, answer: { vi: 'Đội chứng từ hỗ trợ xin cấp phép C/O theo hiệp định thương mại phù hợp với tuyến hàng, tư vấn cụ thể theo từng lô.', en: 'Our documentation team handles C/O applications under the trade agreement that fits your lane, advised case by case.' } },
      { question: { vi: 'Có hỗ trợ hoàn thuế không?', en: 'Do you support duty refunds?' }, answer: { vi: 'Có. Dịch vụ bao gồm lập hồ sơ và theo dõi thủ tục hoàn thuế cho doanh nghiệp.', en: 'Yes. The service covers preparing the filing and following the refund process through.' } },
      { question: { vi: 'Nếu lô hàng bị kiểm hóa thì sao?', en: 'What happens if the cargo is inspected?' }, answer: { vi: 'Đội hiện trường phối hợp trực tiếp với cơ quan hải quan tại cảng hoặc kho để kiểm tra thực tế, đồng thời cập nhật tiến độ cho khách hàng.', en: 'Our field team coordinates directly with customs at the port or warehouse for the physical check and keeps the customer updated.' } },
    ],
  },
};
