import { Bilingual } from './types';

/**
 * Bài viết MẪU cho chế độ demo (`NEXT_PUBLIC_DEMO_MODE=true`).
 *
 * ⚠️ TOÀN BỘ NỘI DUNG DƯỚI ĐÂY LÀ NỘI DUNG DỰNG SẴN ĐỂ TRÌNH DIỄN GIAO DIỆN,
 * KHÔNG PHẢI THÔNG BÁO THẬT CỦA MH. Vì vậy giao diện luôn gắn nhãn
 * "Nội dung mẫu" lên mọi bài trong chế độ demo — tuyệt đối không gỡ nhãn này
 * khi vẫn dùng dữ liệu mẫu, tránh người xem hiểu nhầm là thông báo chính thức.
 *
 * Khi tắt chế độ demo, trang Tin tức tự động quay về lấy bài thật từ
 * `GET /posts` của MH-api và file này không được dùng tới.
 */
export interface DemoPost {
  slug: string;
  date: string;
  image: string;
  title: Bilingual;
  excerpt: Bilingual;
  /** Mỗi phần tử là một đoạn văn. */
  body: Bilingual[];
}

export const demoPosts: DemoPost[] = [
  {
    slug: 'chuan-bi-chung-tu-truoc-khi-hang-cap-cang',
    date: '2026-08-28',
    image: '/images/services/customs-hero.jpg',
    title: {
      vi: 'Chuẩn bị chứng từ trước khi hàng cập cảng để rút ngắn thời gian thông quan',
      en: 'Prepare documents before the vessel berths to shorten clearance time',
    },
    excerpt: {
      vi: 'Phần lớn thời gian chờ ở cảng đến từ chứng từ chưa sẵn sàng chứ không phải từ hải quan. Dưới đây là những gì nên chuẩn bị trước.',
      en: 'Most waiting time at the port comes from documents that are not ready — not from customs. Here is what to prepare in advance.',
    },
    body: [
      {
        vi: 'Khi tàu cập cảng mà bộ chứng từ chưa hoàn chỉnh, lô hàng phải nằm bãi chờ — và chi phí lưu bãi bắt đầu chạy. Trong hầu hết trường hợp chúng tôi gặp, nguyên nhân không nằm ở khâu kiểm tra của hải quan mà ở việc invoice, packing list hoặc vận đơn được gửi muộn.',
        en: 'When a vessel berths before the document set is complete, the shipment sits in the yard — and demurrage starts running. In most cases we see, the cause is not the customs inspection but an invoice, packing list or bill of lading that arrives late.',
      },
      {
        vi: 'Nên gửi trước bộ chứng từ nháp ngay khi có: invoice, packing list, vận đơn và C/O nếu muốn hưởng ưu đãi thuế theo hiệp định. Đội chứng từ sẽ rà mã HS và thuế suất trước, nên khi hàng về chỉ còn việc truyền tờ khai.',
        en: 'Send the draft document set as soon as it exists: invoice, packing list, bill of lading, and the C/O if you intend to claim preferential duty. Our documentation team checks the HS code and duty rate in advance, so when the cargo lands only the declaration filing remains.',
      },
      {
        vi: 'Với hàng đi luồng vàng hoặc luồng đỏ, chuẩn bị sớm càng có giá trị: hồ sơ đầy đủ ngay từ đầu giúp rút ngắn đáng kể thời gian phối hợp kiểm tra.',
        en: 'For yellow- or red-channel cargo, early preparation matters even more: a complete file from the start noticeably shortens the inspection coordination.',
      },
    ],
  },
  {
    slug: 'lich-lam-viec-mua-cao-diem-cuoi-nam',
    date: '2026-08-15',
    image: '/images/services/sea-card.jpg',
    title: {
      vi: 'Mùa cao điểm cuối năm: đặt chỗ tàu sớm hơn thường lệ',
      en: 'Year-end peak season: book vessel space earlier than usual',
    },
    excerpt: {
      vi: 'Từ tháng 10, chỗ trên các tuyến chính thường kín trước 2–3 tuần. Kế hoạch đặt chỗ sớm giúp giữ được lịch giao hàng.',
      en: 'From October, space on core lanes typically fills up 2–3 weeks ahead. Booking early keeps your delivery schedule intact.',
    },
    body: [
      {
        vi: 'Giai đoạn cuối năm luôn là lúc nhu cầu tăng mạnh, kéo theo tình trạng khan chỗ và cước biến động trên các tuyến chính. Với lô hàng có thời hạn giao cố định, nên xác nhận booking sớm hơn thường lệ khoảng hai đến ba tuần.',
        en: 'Year-end always brings a demand surge, with tight space and rate volatility on the core lanes. For shipments with a fixed delivery deadline, confirm the booking two to three weeks earlier than usual.',
      },
      {
        vi: 'Nếu khối lượng chưa chốt, vẫn nên báo trước khoảng ước tính để đội booking giữ phương án. Điều chỉnh số lượng sau thường dễ hơn nhiều so với tìm chỗ mới vào phút chót.',
        en: 'If the volume is not final, share an estimate anyway so our booking team can hold options. Adjusting quantity later is far easier than finding space at the last minute.',
      },
    ],
  },
  {
    slug: 'ket-noi-cang-hai-phong-va-phan-phoi-noi-dia',
    date: '2026-07-30',
    image: '/images/services/road-hero.jpg',
    title: {
      vi: 'Từ cầu cảng tới kho: vì sao chặng nội địa quyết định tổng thời gian giao hàng',
      en: 'From quay to warehouse: why the inland leg decides total delivery time',
    },
    excerpt: {
      vi: 'Chặng biển thường đúng lịch, nhưng tổng thời gian giao hàng lại phụ thuộc nhiều vào việc điều xe và thông quan có chạy song song hay không.',
      en: 'The ocean leg usually runs on schedule, yet total delivery time depends on whether trucking and clearance run in parallel.',
    },
    body: [
      {
        vi: 'Một lô hàng nhập thường có ba chặng: biển, thông quan, và đường bộ về kho. Chặng biển có lịch tàu rõ ràng nên ít gây bất ngờ. Vấn đề nằm ở hai chặng còn lại, khi chúng được xử lý nối tiếp thay vì song song.',
        en: 'An import shipment has three legs: ocean, customs, and road to the warehouse. The ocean leg runs to a published schedule, so it rarely surprises. The trouble is in the other two, when they are handled sequentially instead of in parallel.',
      },
      {
        vi: 'Khi biết trước ETA, chúng tôi mở tờ khai và điều xe cùng lúc, để xe có mặt ngay khi hàng đủ điều kiện lấy khỏi cảng. Cách làm này cắt được phần lớn thời gian chết giữa hai chặng.',
        en: 'Knowing the ETA in advance, we file the declaration and dispatch the truck at the same time, so the vehicle is on site the moment the cargo can leave the port. This removes most of the dead time between legs.',
      },
    ],
  },
];

export const demoNoticeLabel: Bilingual = {
  vi: 'Nội dung mẫu',
  en: 'Sample content',
};
