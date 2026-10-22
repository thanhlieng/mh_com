import { Plane, Ship } from 'lucide-react';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import { ReactNode } from 'react';

import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent, PartnerItem } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/** "Wan Hai" → "WH", "KMTC" → "KMTC": thay logo khi hãng chưa có ảnh. */
function monogram(name: string) {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? words.map((w) => w[0]).join('') : name.slice(0, 4);
}

/**
 * Một ô đối tác: logo + tên, không có dòng chú thích. Chưa có logo thì phần
 * ảnh thay bằng wordmark viết tắt, nên thêm hãng mới không cần ảnh vẫn không
 * vỡ layout.
 */
function CarrierTile({ item }: { item: PartnerItem }) {
  return (
    <div className='group flex h-full w-full shrink-0 flex-col items-center justify-center gap-3 rounded-md border border-surface-line bg-white px-5 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue-300 hover:shadow-soft'>
      <div className='relative flex h-11 w-full items-center justify-center'>
        {item.logo ? (
          <Image
            src={item.logo}
            alt={item.name}
            layout='fill'
            objectFit='contain'
            // SVG: bỏ qua image optimizer của Next (mặc định từ chối SVG).
            unoptimized
          />
        ) : (
          <span
            aria-hidden
            className='flex h-11 min-w-[44px] items-center justify-center rounded-md bg-navy-600 px-2 font-display text-sm font-extrabold uppercase tracking-wide text-white'
          >
            {monogram(item.name)}
          </span>
        )}
      </div>
      <span className='text-center font-display text-sm font-semibold text-navy-600'>
        {item.name}
      </span>
    </div>
  );
}

/**
 * Băng logo tự chạy vô tận. Danh sách được lặp lại đúng 2 lần và track dịch
 * `-50%` (keyframe `marquee` trong tailwind.config.js) nên điểm nối trùng khít
 * — không thấy giật khi lặp. Dừng khi hover để người xem đọc được, và tự tắt
 * khi người dùng bật `prefers-reduced-motion` (xem globals.css).
 */
function LogoMarquee({ items, reverse }: { items: PartnerItem[]; reverse?: boolean }) {
  const doubled = [...items, ...items];

  return (
    // py-2: chừa chỗ cho thẻ nhích lên + bóng đổ khi hover — overflow-hidden
    // (cần để cắt băng chạy theo chiều ngang) cắt cả theo chiều dọc.
    <div className='group/marquee relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]'>
      {/* Hai class riêng thay vì `animation-direction: reverse` inline — xem
          ghi chú ở keyframes trong tailwind.config.js. */}
      <div
        className={`flex w-max gap-4 group-hover/marquee:[animation-play-state:paused] ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {doubled.map((item, i) => (
          <div key={`${item.name}-${i}`} className='w-[190px] shrink-0'>
            <CarrierTile item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mục 1.4 "Mạng lưới đối tác" — hãng tàu (băng logo tự chạy hai tầng) và
 * hãng hàng không (lưới tĩnh). Nguồn logo: `content/home.content.ts`.
 */
export function PartnersSection({ partners }: { partners: HomeContent['partners'] }) {
  const { lang } = useTranslation('common');
  const carriers = partners.carriers.items;

  // Hãng tàu chia hai tầng chạy ngược chiều nhau cho có nhịp.
  const mid = Math.ceil(carriers.length / 2);
  const rowTop = carriers.slice(0, mid);
  const rowBottom = carriers.slice(mid);

  return (
    <section className='relative overflow-hidden py-20 tab:py-24'>
      <SectionGlow />
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={pickLang(partners.eyebrow, lang)}
            title={pickLang(partners.heading, lang)}
            description={pickLang(partners.description, lang)}
          />
        </Reveal>

        {/* Hãng tàu — băng logo hai tầng tự chạy. */}
        <Reveal delay={0.1} className='mt-12'>
          <GroupHeading
            icon={<Ship className='h-6 w-6' aria-hidden />}
            title={pickLang(partners.carriers.title, lang)}
            note={pickLang(partners.carriers.note, lang)}
            tone='bg-brand-blue-50 text-brand-blue-600'
          />
          {/* gap 0 vì mỗi băng đã có py-2 — giữ khoảng cách hai tầng như cũ. */}
          <div className='-my-2 flex flex-col'>
            <LogoMarquee items={rowTop} />
            {rowBottom.length > 0 && <LogoMarquee items={rowBottom} reverse />}
          </div>
        </Reveal>

        {/* Hãng hàng không — ít đối tác hơn nên để lưới tĩnh, dễ đọc hơn băng chạy. */}
        <Reveal delay={0.15} className='mt-14'>
          <GroupHeading
            icon={<Plane className='h-6 w-6' aria-hidden />}
            title={pickLang(partners.airlines.title, lang)}
            note={pickLang(partners.airlines.note, lang)}
            tone='bg-brand-teal-50 text-brand-teal-600'
          />
          <div className='grid grid-cols-2 gap-4 tab:grid-cols-4'>
            {partners.airlines.items.map((item) => (
              <CarrierTile key={item.name} item={item} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function GroupHeading({
  icon,
  title,
  note,
  tone,
}: {
  icon: ReactNode;
  title: string;
  note: string;
  tone: string;
}) {
  return (
    <div className='mb-6 flex items-center gap-4'>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded ${tone}`}>
        {icon}
      </span>
      <div>
        <h3 className='font-display text-lg font-semibold text-navy-600'>{title}</h3>
        <p className='mt-0.5 text-sm text-ink-soft'>{note}</p>
      </div>
    </div>
  );
}
