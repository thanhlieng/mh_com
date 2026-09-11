import { Bilingual } from './types';

/**
 * Nội dung trang "Về MH".
 *
 * ⚠️ Trang cũ (`container/AboutForm`) viết về **ACF** — một thương hiệu khác,
 * kèm loạt ảnh `about*.svg` KHÔNG tồn tại trong `public/images` (trang hỏng).
 * Toàn bộ nội dung dưới đây viết lại cho MH, chỉ dựa trên những gì đã thống
 * nhất trong dự án: cửa ngõ cảng Hải Phòng, ba dịch vụ lõi, phân phối nội địa,
 * theo dõi hành trình qua checkpoint.
 *
 * ⚠️ CỐ Ý KHÔNG BỊA: năm thành lập, số nhân sự, giấy phép, lịch sử phát triển
 * — bổ sung khi có thông tin thật.
 */

export interface AboutValue {
  icon: 'shield-check' | 'clock' | 'eye' | 'handshake';
  title: Bilingual;
  detail: Bilingual;
}

export interface AboutContent {
  hero: {
    eyebrow: Bilingual;
    title: Bilingual;
    description: Bilingual;
    image: string;
  };
  intro: {
    heading: Bilingual;
    paragraphs: Bilingual[];
    image: string;
  };
  values: {
    eyebrow: Bilingual;
    heading: Bilingual;
    items: AboutValue[];
  };
}

export const aboutContent: AboutContent = {
  hero: {
    eyebrow: { vi: 'Về MH', en: 'About MH' },
    title: {
      vi: 'Một đầu mối giữa cảng Hải Phòng và kho của bạn',
      en: 'One partner between Hai Phong Port and your warehouse',
    },
    description: {
      vi: 'MH Great Sun làm giao nhận vận tải và khai báo hải quan: đưa hàng quốc tế cập cảng Hải Phòng, thông quan, rồi chở thẳng vào kho khách hàng trong nội địa.',
      en: 'MH Great Sun is a freight forwarder and customs broker: we bring international cargo into Hai Phong Port, clear it, and haul it straight to our customers’ inland warehouses.',
    },
    image: '/images/services/sea-hero.jpg',
  },
  intro: {
    heading: {
      vi: 'Chúng tôi làm gì',
      en: 'What we do',
    },
    paragraphs: [
      {
        vi: 'Phần lớn rắc rối của một lô hàng nhập khẩu không nằm ở chặng biển, mà nằm ở chỗ nối: tàu cập cảng nhưng chứng từ chưa xong, tờ khai xong nhưng không có xe, xe tới kho nhưng không ai biết hàng đang ở đâu. MH gom cả ba khâu — đường biển, hải quan, đường bộ — về một đầu mối để chỗ nối không còn là chỗ đứt.',
        en: 'Most of the trouble with an import shipment is not the ocean leg — it is the handovers: the vessel berths but the paperwork is not ready, the declaration clears but no truck is booked, the truck reaches the warehouse but nobody knows where the cargo has been. MH brings all three legs — sea, customs, road — under one desk, so the handovers stop being breaking points.',
      },
      {
        vi: 'Mỗi lô hàng đi qua hệ thống checkpoint nội bộ, nên bạn theo dõi được hành trình theo thời gian thực thay vì phải gọi điện hỏi từng khâu.',
        en: 'Every shipment moves through our internal checkpoint system, so you follow it in real time instead of phoning around for status.',
      },
    ],
    image: '/images/services/road-card.jpg',
  },
  values: {
    eyebrow: { vi: 'Cách chúng tôi làm việc', en: 'How we work' },
    heading: {
      vi: 'Bốn điều khách hàng nhận được ở mọi lô hàng',
      en: 'Four things you get on every shipment',
    },
    items: [
      {
        icon: 'eye',
        title: { vi: 'Minh bạch hành trình', en: 'A visible journey' },
        detail: {
          vi: 'Trạng thái cập nhật theo checkpoint, không phải chờ hỏi mới biết hàng ở đâu.',
          en: 'Status updates at every checkpoint — no need to ask where the cargo is.',
        },
      },
      {
        icon: 'clock',
        title: { vi: 'Phản hồi trong ngày', en: 'Same-day response' },
        detail: {
          vi: 'Yêu cầu báo giá được trả lời trong ngày làm việc, kèm phương án cụ thể theo tuyến.',
          en: 'Quote requests answered within the business day, with a concrete plan for your lane.',
        },
      },
      {
        icon: 'shield-check',
        title: { vi: 'Chứng từ làm đúng từ đầu', en: 'Paperwork right the first time' },
        detail: {
          vi: 'Tư vấn mã HS trước khi mở tờ khai, hạn chế rủi ro bị vướng luồng và phát sinh chi phí lưu bãi.',
          en: 'HS codes checked before filing, reducing channel holds and demurrage surprises.',
        },
      },
      {
        icon: 'handshake',
        title: { vi: 'Một người chịu trách nhiệm', en: 'One accountable contact' },
        detail: {
          vi: 'Một đầu mối theo lô hàng từ lúc booking đến khi ký nhận, không đẩy qua lại giữa các bộ phận.',
          en: 'One person owns your shipment from booking to signature — no hand-offs between desks.',
        },
      },
    ],
  },
};
