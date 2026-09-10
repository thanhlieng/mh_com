import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';

import { HomeContent } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

import { RouteArt } from './RouteArt';
import { TrackingBar } from '../public/TrackingBar';

interface HeroProps {
  hero: HomeContent['hero'];
}

const wordVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.07, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

/**
 * Hero trang chủ — ảnh cảng đêm thật (`hero.image`) làm nền, phủ gradient
 * navy→teal để chữ luôn đọc được, cộng hoạ tiết tuyến vẽ dần bằng SVG phía
 * trên. Thay hoàn toàn `banner.png` bị `object-fill` kéo méo ở trang cũ
 * (`src/pages/index.tsx`).
 */
export function Hero({ hero }: HeroProps) {
  const { lang } = useTranslation('common');
  const reduceMotion = useReducedMotion();
  const words = pickLang(hero.headline, lang).split(' ');

  return (
    <section className='relative overflow-hidden bg-navy-600'>
      <Image src={hero.image} alt='' layout='fill' objectFit='cover' priority />
      {/* Gradient ngang: đặc bên trái để chữ luôn đọc được, nhạt dần sang phải
          để ảnh cảng đêm thật vẫn hiện rõ — tránh phủ kín ảnh như một khối màu phẳng. */}
      <div
        aria-hidden
        className='absolute inset-0 bg-gradient-to-r from-navy-600/95 via-navy-600/75 to-navy-600/30 tab:to-brand-teal-700/20'
      />
      <div aria-hidden className='absolute inset-0 bg-gradient-to-t from-navy-600/70 via-transparent to-navy-600/40' />
      <motion.div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-60'
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.10), transparent 45%), radial-gradient(circle at 85% 15%, rgba(26,168,81,0.25), transparent 40%)',
        }}
        animate={reduceMotion ? undefined : { opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <RouteArt className='absolute inset-y-0 right-0 h-full w-[65%] opacity-50 tab:opacity-70' />

      <Container className='relative z-10 flex flex-col gap-10 py-24 tab:py-32 lap:flex-row lap:items-center lap:py-36'>
        <div className='max-w-2xl'>
          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-amber-300'
          >
            {pickLang(hero.eyebrow, lang)}
          </motion.p>

          {/*
            aria-label mang câu đầy đủ có khoảng trắng thật cho screen reader;
            các span chia từ để animate bị ẩn khỏi accessibility tree
            (chỉ margin-right tạo khoảng cách thị giác, không có ký tự space).
          */}
          <h1
            aria-label={pickLang(hero.headline, lang)}
            className='text-balance font-display text-display-xl font-extrabold text-white'
          >
            <span aria-hidden='true'>
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  initial={reduceMotion ? undefined : 'hidden'}
                  animate='visible'
                  variants={reduceMotion ? undefined : wordVariants}
                  className='mr-[0.28em] inline-block'
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className='mt-6 max-w-xl text-base leading-relaxed text-white/75 tab:text-lg'
          >
            {pickLang(hero.sub, lang)}
          </motion.p>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className='mt-9'
          >
            <TrackingBar variant='hero' />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
