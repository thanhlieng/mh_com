import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/**
 * Mục 1.1 của spec — giới thiệu ngắn về công ty trên trang chủ, kèm link
 * "Xem thêm" sang trang Về chúng tôi.
 */
export function IntroSection({ intro }: { intro: HomeContent['intro'] }) {
  const { lang } = useTranslation('common');

  return (
    <section className='relative overflow-hidden py-20 tab:py-24'>
      <SectionGlow variant='top' />
      <Container className='grid grid-cols-1 gap-10 lap:grid-cols-[0.8fr_1.2fr]'>
        <Reveal>
          <SectionHeading title={pickLang(intro.heading, lang)} />
        </Reveal>

        <Reveal delay={0.1}>
          <div className='flex flex-col gap-4'>
            {intro.paragraphs.map((p, i) => (
              <p key={i} className='text-[15px] leading-relaxed text-ink-soft'>
                {pickLang(p, lang)}
              </p>
            ))}
          </div>

          <Link
            href={intro.moreHref}
            legacyBehavior={false}
            className='group mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-blue-600 transition-colors hover:text-brand-blue-700'
          >
            {pickLang(intro.moreLabel, lang)}
            <ArrowRight
              className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-1'
              aria-hidden
            />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
