import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/**
 * Tin tức mới nhất. Trả về null nếu chưa có bài viết (content.news.items
 * rỗng cho tới khi nối module `posts` ở đợt sau) — không hiện khung trống.
 */
export function NewsTeaser({ news }: { news: HomeContent['news'] }) {
  const { lang } = useTranslation('common');
  if (news.items.length === 0) return null;

  return (
    <section className='py-20 tab:py-28'>
      <Container>
        <Reveal>
          <SectionHeading title={pickLang(news.heading, lang)} />
        </Reveal>

        <RevealGroup className='mt-10 grid grid-cols-1 gap-6 tab:grid-cols-3'>
          {news.items.map((item) => (
            <motion.div key={item.href} variants={revealItemVariants}>
              <Link href={item.href} className='group block overflow-hidden rounded-2xl border border-surface-line bg-white shadow-soft transition-shadow hover:shadow-lift'>
                <div className='relative aspect-[16/10] overflow-hidden bg-paper'>
                  {/* Next 12 Image API: layout="fill" (không phải `fill` như Next 13+). */}
                  <Image
                    src={item.image}
                    alt={pickLang(item.title, lang)}
                    layout='fill'
                    objectFit='cover'
                    className='transition-transform duration-500 group-hover:scale-105'
                  />
                </div>
                <div className='p-5'>
                  <p className='font-display text-xs font-medium uppercase tracking-wide text-ink-soft'>
                    {item.date}
                  </p>
                  <h3 className='mt-2 font-display text-base font-semibold text-navy-600'>
                    {pickLang(item.title, lang)}
                  </h3>
                  <p className='mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft'>
                    {pickLang(item.excerpt, lang)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
