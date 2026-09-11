import { motion } from 'framer-motion';
import { Factory, Ship } from 'lucide-react';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent, PartnerItem } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/**
 * Một ô logo hãng tàu. Có `logo` thì hiện ảnh (ngả xám, lên màu khi hover —
 * giữ dải logo yên tĩnh, không tranh chấp với nội dung); chưa có logo thì
 * hiện wordmark bằng chữ, nên thêm hãng mới không cần ảnh vẫn không vỡ layout.
 */
function CarrierTile({ item, lang }: { item: PartnerItem; lang: string }) {
  return (
    <div className='group flex w-[190px] shrink-0 flex-col items-center justify-center gap-2 rounded-md border border-surface-line bg-white px-5 py-5 transition-colors hover:border-brand-blue-300'>
      <div className='relative flex h-10 w-full items-center justify-center'>
        {item.logo ? (
          <Image
            src={item.logo}
            alt={item.name}
            layout='fill'
            objectFit='contain'
            // SVG: bỏ qua image optimizer của Next (mặc định từ chối SVG).
            unoptimized
            className='opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0'
          />
        ) : (
          <span className='font-display text-base font-bold tracking-tight text-navy-600'>
            {item.name}
          </span>
        )}
      </div>
      <span className='text-center text-[11px] leading-snug text-ink-soft'>
        {pickLang(item.note, lang)}
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
function LogoMarquee({
  items,
  lang,
  reverse,
}: {
  items: PartnerItem[];
  lang: string;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];

  return (
    <div className='group/marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]'>
      {/* Hai class riêng thay vì `animation-direction: reverse` inline — xem
          ghi chú ở keyframes trong tailwind.config.js. */}
      <div
        className={`flex w-max gap-4 group-hover/marquee:[animation-play-state:paused] ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {doubled.map((item, i) => (
          <CarrierTile key={`${item.name}-${i}`} item={item} lang={lang} />
        ))}
      </div>
    </div>
  );
}

/**
 * Mục "Đối tác" — hai nhóm phản ánh hai đầu của một lô hàng: hãng tàu đưa
 * hàng cập cảng Việt Nam, và nhà máy nội địa gửi/nhận hàng.
 *
 * Hãng tàu hiển thị bằng băng logo tự chạy (logo tải từ Wikimedia Commons,
 * đều thuộc Public domain — xem change-log). Đối tác nội địa là nhóm NGÀNH
 * HÀNG chứ không phải doanh nghiệp cụ thể nên không có logo, trình bày dạng
 * lưới. Ghi chú về tính xác thực của danh sách: `content/home.content.ts`.
 */
export function PartnersSection({ partners }: { partners: HomeContent['partners'] }) {
  const { lang } = useTranslation('common');
  const carriers = partners.carriers.items;

  // Chia hai tầng chạy ngược chiều nhau cho có nhịp; danh sách lẻ thì tầng
  // trên nhiều hơn một mục.
  const mid = Math.ceil(carriers.length / 2);
  const rowTop = carriers.slice(0, mid);
  const rowBottom = carriers.slice(mid);

  return (
    <section className='relative overflow-hidden py-20 tab:py-28'>
      <SectionGlow />
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={pickLang(partners.eyebrow, lang)}
            title={pickLang(partners.heading, lang)}
            description={pickLang(partners.description, lang)}
          />
        </Reveal>

        {/* Nhóm 1 — hãng tàu: băng logo hai tầng tự chạy. */}
        <Reveal delay={0.1} className='mt-12'>
          <div className='mb-6 flex items-center gap-4'>
            <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand-blue-50 text-brand-blue-600'>
              <Ship className='h-6 w-6' aria-hidden />
            </span>
            <div>
              <h3 className='font-display text-lg font-semibold text-navy-600'>
                {pickLang(partners.carriers.title, lang)}
              </h3>
              <p className='mt-0.5 text-sm text-ink-soft'>
                {pickLang(partners.carriers.note, lang)}
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <LogoMarquee items={rowTop} lang={lang} />
            {rowBottom.length > 0 && <LogoMarquee items={rowBottom} lang={lang} reverse />}
          </div>
        </Reveal>

        {/* Nhóm 2 — đối tác nội địa: lưới ngành hàng. */}
        <div className='mt-16'>
          <Reveal>
            <div className='mb-6 flex items-center gap-4'>
              <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand-green-50 text-brand-green-600'>
                <Factory className='h-6 w-6' aria-hidden />
              </span>
              <div>
                <h3 className='font-display text-lg font-semibold text-navy-600'>
                  {pickLang(partners.domestic.title, lang)}
                </h3>
                <p className='mt-0.5 text-sm text-ink-soft'>
                  {pickLang(partners.domestic.note, lang)}
                </p>
              </div>
            </div>
          </Reveal>

          <RevealGroup className='grid grid-cols-2 gap-3 tab:grid-cols-3 lap:grid-cols-6'>
            {partners.domestic.items.map((item) => (
              <motion.div
                key={item.name}
                variants={revealItemVariants}
                className='rounded-md border border-surface-line bg-white px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-300 hover:shadow-soft'
              >
                <span className='block font-display text-sm font-semibold text-navy-600'>
                  {item.name}
                </span>
                <span className='mt-1 block text-xs leading-snug text-ink-soft'>
                  {pickLang(item.note, lang)}
                </span>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
