import { ServiceDetail, ServiceSummary } from './types';

/**
 * Nội dung ba trang dịch vụ lõi. Hardcode đợt này — shape khớp CMS tương lai,
 * xem ghi chú ở `src/content/types.ts`.
 */

export const serviceSummaries: ServiceSummary[] = [
  {
    slug: 'van-chuyen-duong-bo',
    accent: 'brand-green',
    icon: 'truck',
    title: { vi: 'Vận chuyển đường bộ', en: 'Road Freight' },
    tagline: {
      vi: 'Phân phối hàng từ cảng Hải Phòng vào sâu nội địa',
      en: 'Distributing cargo from Hai Phong Port deep inland',
    },
    cardImage: '/images/services/road-card.jpg',
  },
  {
    slug: 'van-chuyen-duong-bien',
    accent: 'brand-blue',
    icon: 'ship',
    title: { vi: 'Vận chuyển đường biển', en: 'Sea Freight' },
    tagline: {
      vi: 'FCL & LCL qua cảng Hải Phòng, kết nối đi khắp thế giới',
      en: 'FCL & LCL through Hai Phong Port, connected worldwide',
    },
    cardImage: '/images/services/sea-card.jpg',
  },
  {
    slug: 'khai-bao-hai-quan',
    accent: 'brand-teal',
    icon: 'file-check-2',
    title: { vi: 'Khai báo hải quan', en: 'Customs Clearance' },
    tagline: {
      vi: 'Tờ khai điện tử VNACCS, tư vấn mã HS, xử lý mọi luồng',
      en: 'VNACCS e-declaration, HS code advisory, all channels',
    },
    cardImage: '/images/services/customs-card.jpg',
  },
];

export const serviceDetails: Record<string, ServiceDetail> = {
  'van-chuyen-duong-bo': {
    ...serviceSummaries[0],
    heroImage: '/images/services/road-hero.jpg',
    heroHeadline: {
      vi: 'Từ cảng Hải Phòng, vận chuyển đúng giờ vào sâu nội địa',
      en: 'From Hai Phong Port, on time deep inland',
    },
    heroSub: {
      vi: 'Đội xe tải và container nhận hàng ngay tại cảng Hải Phòng, phân phối tới kho khách hàng ở Hà Nội và các tỉnh, theo dõi hành trình theo thời gian thực qua hệ thống checkpoint.',
      en: 'Truck and container fleet picks up straight from Hai Phong Port and delivers to customer warehouses across Hanoi and the provinces, tracked in real time through our checkpoint system.',
    },
    specs: [
      { label: { vi: 'Tuyến khai thác', en: 'Routes' }, value: { vi: 'Cảng Hải Phòng → Hà Nội, Bắc Ninh, Hải Dương và các tỉnh lân cận', en: 'Hai Phong Port → Hanoi, Bac Ninh, Hai Duong and neighboring provinces' } },
      { label: { vi: 'Loại xe', en: 'Vehicle types' }, value: { vi: 'Xe tải thùng, xe container 20ft/40ft, xe đầu kéo', en: 'Box trucks, 20ft/40ft container trailers, tractor units' } },
      { label: { vi: 'Tải trọng', en: 'Payload' }, value: { vi: 'Từ 1 tấn đến 30 tấn / chuyến', en: '1–30 tons per trip' } },
      { label: { vi: 'Thời gian vận chuyển', en: 'Transit time' }, value: { vi: 'Trong ngày nội tỉnh, 1–2 ngày các tỉnh xa', en: 'Same day nearby, 1–2 days to farther provinces' } },
    ],
    process: [
      { step: 1, icon: 'clipboard-list', title: { vi: 'Nhận yêu cầu', en: 'Request received' }, detail: { vi: 'Ghi nhận điểm nhận – điểm giao, loại hàng, khối lượng', en: 'Pickup/delivery points, cargo type and weight logged' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 2, icon: 'calculator', title: { vi: 'Báo giá & điều xe', en: 'Quote & dispatch' }, detail: { vi: 'Báo giá trong ngày, điều xe phù hợp tải trọng', en: 'Same-day quote, vehicle matched to payload' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 3, icon: 'package-check', title: { vi: 'Nhận hàng', en: 'Cargo pickup' }, detail: { vi: 'Kiểm đếm, niêm phong, chụp ảnh tình trạng hàng', en: 'Count, seal, and photograph cargo condition' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 4, icon: 'truck', title: { vi: 'Vận chuyển', en: 'In transit' }, detail: { vi: 'Theo dõi hành trình qua checkpoint, cập nhật realtime', en: 'Route tracked via checkpoints, updated in real time' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 5, icon: 'badge-check', title: { vi: 'Giao hàng & POD', en: 'Delivery & POD' }, detail: { vi: 'Giao tận nơi, ký nhận điện tử', en: 'Door delivery with e-signature proof of delivery' }, actor: { vi: 'Khách hàng', en: 'Customer' } },
    ],
    faqs: [
      { question: { vi: 'Có nhận vận chuyển hàng lẻ (LTL) không?', en: 'Do you handle less-than-truckload (LTL) cargo?' }, answer: { vi: 'Có. Với đơn dưới 1 tấn, hàng được ghép chuyến để tối ưu chi phí, thời gian giao dao động thêm 0,5–1 ngày.', en: 'Yes. Shipments under 1 ton are consolidated to optimize cost, with delivery time extended by 0.5–1 day.' } },
      { question: { vi: 'Có bảo hiểm hàng hoá không?', en: 'Is cargo insurance available?' }, answer: { vi: 'Có gói bảo hiểm theo giá trị khai báo, đăng ký khi tạo đơn.', en: 'Insurance based on declared value is available at booking.' } },
      { question: { vi: 'Theo dõi đơn hàng ở đâu?', en: 'Where can I track my shipment?' }, answer: { vi: 'Nhập mã vận đơn tại ô tra cứu trên trang chủ hoặc trang /tracking.', en: 'Enter your tracking code at the search box on the homepage or the /tracking page.' } },
    ],
  },
  'van-chuyen-duong-bien': {
    ...serviceSummaries[1],
    heroImage: '/images/services/sea-hero.jpg',
    heroHeadline: {
      vi: 'Vận chuyển đường biển FCL & LCL qua cảng Hải Phòng',
      en: 'FCL & LCL sea freight through Hai Phong Port',
    },
    heroSub: {
      vi: 'Cảng Hải Phòng là cửa ngõ chính — kết nối tới hơn 50 tuyến tàu quốc tế đi khắp thế giới, làm việc trực tiếp với các hãng tàu lớn để giữ lịch trình ổn định và chi phí cạnh tranh.',
      en: 'Hai Phong Port is the main gateway — connected to 50+ international shipping lines worldwide, working directly with leading carriers for stable schedules and competitive rates.',
    },
    specs: [
      { label: { vi: 'Cảng chính', en: 'Main port' }, value: { vi: 'Cảng Hải Phòng ↔ hơn 50 cảng biển quốc tế (châu Á, châu Âu, châu Mỹ)', en: 'Hai Phong Port ↔ 50+ international seaports (Asia, Europe, Americas)' } },
      { label: { vi: 'Hình thức', en: 'Load type' }, value: { vi: 'FCL container 20ft/40ft, LCL hàng lẻ', en: 'FCL 20ft/40ft container, LCL consolidated cargo' } },
      { label: { vi: 'Lịch tàu', en: 'Sailing schedule' }, value: { vi: '2–3 chuyến/tuần mỗi tuyến chính', en: '2–3 sailings/week on core routes' } },
      { label: { vi: 'Thời gian vận chuyển', en: 'Transit time' }, value: { vi: 'Tuỳ tuyến quốc tế, đội booking báo cụ thể khi đặt chỗ', en: 'Depends on the international route — our booking team confirms at time of booking' } },
    ],
    process: [
      { step: 1, icon: 'clipboard-list', title: { vi: 'Booking chỗ tàu', en: 'Booking' }, detail: { vi: 'Giữ chỗ theo lịch tàu, xác nhận giá cước', en: 'Space booked per sailing schedule, freight rate confirmed' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 2, icon: 'container', title: { vi: 'Đóng hàng & hạ container', en: 'Stuffing & gate-in' }, detail: { vi: 'Đóng hàng tại kho hoặc tại cảng, hạ bãi trước giờ cutoff', en: 'Cargo stuffed at warehouse or port, gated in before cutoff' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 3, icon: 'file-text', title: { vi: 'Khai báo & thông quan xuất', en: 'Export declaration & clearance' }, detail: { vi: 'Mở tờ khai xuất, xử lý song song với hải quan', en: 'Export declaration filed, processed alongside customs' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 4, icon: 'ship', title: { vi: 'Vận chuyển trên biển', en: 'Ocean transit' }, detail: { vi: 'Theo dõi lịch trình tàu, cập nhật ETA', en: 'Vessel schedule tracked, ETA updated' }, actor: { vi: 'Hãng tàu', en: 'Carrier' } },
      { step: 5, icon: 'warehouse', title: { vi: 'Giao hàng tại cảng đến', en: 'Delivery at destination' }, detail: { vi: 'Thông quan nhập, giao hàng tận kho', en: 'Import clearance, delivered to warehouse' }, actor: { vi: 'MH', en: 'MH' } },
    ],
    faqs: [
      { question: { vi: 'LCL và FCL khác nhau thế nào?', en: 'What is the difference between LCL and FCL?' }, answer: { vi: 'FCL là thuê nguyên container, LCL là ghép hàng chung container với khách khác — phù hợp lô hàng dưới 15 CBM.', en: 'FCL means a dedicated container; LCL consolidates cargo with other shippers — suited to shipments under 15 CBM.' } },
      { question: { vi: 'Có hỗ trợ hàng cần điều kiện đặc biệt không?', en: 'Do you handle cargo needing special conditions?' }, answer: { vi: 'Có, gồm hàng lạnh, hàng cồng kềnh; cần báo trước để bố trí container phù hợp.', en: 'Yes, including reefer and oversized cargo; advance notice is required to arrange the right container.' } },
      { question: { vi: 'Cutoff hạ container là khi nào?', en: 'When is the container gate-in cutoff?' }, answer: { vi: 'Thường 24–48 giờ trước giờ tàu chạy, tuỳ cảng — đội booking sẽ báo cụ thể theo từng chuyến.', en: 'Typically 24–48 hours before sailing, depending on the port — our booking team confirms per sailing.' } },
    ],
  },
  'khai-bao-hai-quan': {
    ...serviceSummaries[2],
    heroImage: '/images/services/customs-hero.jpg',
    heroHeadline: {
      vi: 'Khai báo hải quan trọn gói',
      en: 'End-to-end customs clearance',
    },
    heroSub: {
      vi: 'Đội chứng từ xử lý tờ khai điện tử qua VNACCS, tư vấn mã HS trước khi mở tờ khai và theo dõi phân luồng cho tới khi hàng thông quan.',
      en: 'Our documentation team files e-declarations through VNACCS, advises on HS codes before filing, and tracks the clearance channel until goods are released.',
    },
    specs: [
      { label: { vi: 'Loại hình tờ khai', en: 'Declaration types' }, value: { vi: 'Kinh doanh, gia công, sản xuất xuất khẩu, tạm nhập tái xuất', en: 'Commercial, processing, manufacturing-for-export, temporary import-re-export' } },
      { label: { vi: 'Chứng từ cần có', en: 'Required documents' }, value: { vi: 'Invoice, packing list, vận đơn, C/O (nếu có)', en: 'Invoice, packing list, bill of lading, C/O (if applicable)' } },
      { label: { vi: 'Thời gian xử lý — luồng xanh', en: 'Processing time — green channel' }, value: { vi: 'Trong ngày', en: 'Same day' } },
      { label: { vi: 'Thời gian xử lý — luồng vàng/đỏ', en: 'Processing time — yellow/red channel' }, value: { vi: '1–2 ngày, tuỳ kiểm tra thực tế', en: '1–2 days, depending on physical inspection' } },
    ],
    process: [
      { step: 1, icon: 'scan-line', title: { vi: 'Tư vấn mã HS', en: 'HS code advisory' }, detail: { vi: 'Xác định mã HS và thuế suất áp dụng trước khi mở tờ khai', en: 'HS code and applicable duty confirmed before filing' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 2, icon: 'file-text', title: { vi: 'Chuẩn bị chứng từ', en: 'Document preparation' }, detail: { vi: 'Rà soát invoice, packing list, vận đơn', en: 'Invoice, packing list, and bill of lading reviewed' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 3, icon: 'file-signature', title: { vi: 'Mở tờ khai VNACCS', en: 'File VNACCS declaration' }, detail: { vi: 'Truyền tờ khai điện tử, nhận kết quả phân luồng', en: 'E-declaration submitted, clearance channel result received' }, actor: { vi: 'MH', en: 'MH' } },
      { step: 4, icon: 'package-check', title: { vi: 'Xử lý theo luồng', en: 'Channel processing' }, detail: { vi: 'Luồng xanh thông quan ngay; luồng vàng/đỏ phối hợp kiểm tra hồ sơ hoặc thực tế hàng', en: 'Green channel clears immediately; yellow/red channels coordinate document or physical inspection' }, actor: { vi: 'Hải quan', en: 'Customs' } },
      { step: 5, icon: 'badge-check', title: { vi: 'Thông quan & bàn giao', en: 'Release & handover' }, detail: { vi: 'Hoàn tất nghĩa vụ thuế, bàn giao hàng cho khách', en: 'Duties settled, goods handed over to customer' }, actor: { vi: 'MH', en: 'MH' } },
    ],
    faqs: [
      { question: { vi: 'Phân luồng xanh, vàng, đỏ khác nhau thế nào?', en: 'What is the difference between green, yellow, and red channels?' }, answer: { vi: 'Luồng xanh miễn kiểm tra hồ sơ và hàng hoá; luồng vàng kiểm tra hồ sơ giấy; luồng đỏ kiểm tra thực tế hàng hoá.', en: 'Green channel skips document and physical checks; yellow channel checks paperwork; red channel requires physical inspection.' } },
      { question: { vi: 'Cần chuẩn bị C/O khi nào?', en: 'When is a Certificate of Origin (C/O) needed?' }, answer: { vi: 'Khi muốn hưởng ưu đãi thuế theo hiệp định thương mại — đội chứng từ sẽ tư vấn hiệp định phù hợp theo tuyến hàng.', en: 'When claiming preferential duty under a trade agreement — our team advises the applicable agreement for your trade lane.' } },
      { question: { vi: 'Nếu hàng bị vướng luồng đỏ thì mất bao lâu?', en: 'How long does a red-channel hold typically take?' }, answer: { vi: 'Thường 1–2 ngày làm việc tuỳ khối lượng kiểm tra thực tế, đội hiện trường sẽ cập nhật tiến độ liên tục.', en: 'Typically 1–2 working days depending on inspection scope; our on-site team provides continuous updates.' } },
    ],
  },
};
