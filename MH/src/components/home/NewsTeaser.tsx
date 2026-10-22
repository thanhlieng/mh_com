import { motion } from 'framer-motion';
import { ArrowRight, Newspaper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useQuery } from 'react-query';

import { IS_DEMO } from '@/lib/demoMode';

import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { QUERY_POST } from '@/contants/query-key/post.query';
import { demoPosts } from '@/content/news.demo.content';
import { HomeContent, NewsTeaserItem } from '@/content/types';
import { getListPost } from '@/services/post.service';
import { pickLang } from '@/utils/pickLang';

const TEASER_COUNT = 3;

const MORE_LABEL = { vi: 'Xem tất cả tin tức', en: 'View all news' };

function formatDate(value: string | Date, lang: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Mục 1.6 — tin tức mới nhất. Ưu tiên `content.news.items` nếu có; nếu rỗng
 * thì lấy 3 bài mới nhất từ module `posts` của MH-api (cùng query với trang
 * /tin-tuc), chế độ demo thì dùng bài mẫu. Không có bài nào (hoặc API lỗi)
 * thì ẩn cả mục — không hiện khung trống.
 */
export function NewsTeaser({ news }: { news: HomeContent['news'] }) {
  const { lang } = useTranslation('common');
  const useApi = !IS_DEMO && news.items.length === 0;

  const { data } = useQuery(
    [QUERY_POST.GET_LIST_POST, { page: 1, pageSize: TEASER_COUNT }],
    () => getListPost({ page: 1, pageSize: TEASER_COUNT }),
    { retry: 1, enabled: useApi }
  );

  let items: NewsTeaserItem[] = news.items;
  if (items.length === 0) {
    items = IS_DEMO
      ? demoPosts.slice(0, TEASER_COUNT).map((p) => ({
          title: p.title,
          excerpt: p.excerpt,
          date: p.date,
          href: `/tin-tuc/${p.slug}`,
          image: p.image,
        }))
      : (data?.data ?? []).slice(0, TEASER_COUNT).map((p) => ({
          title: { vi: p.titleVi, en: p.titleEn },
          excerpt: { vi: p.descriptionVi, en: p.descriptionEn },
          date: String(p.createdAt),
          href: `/detail-post/${p.id}`,
          image: p.thumbnail,
        }));
  }

  if (items.length === 0) return null;

  return (
    <section className='py-20 tab:py-28'>
      <Container>
        <Reveal className='flex flex-col gap-4 tab:flex-row tab:items-end tab:justify-between'>
          <SectionHeading title={pickLang(news.heading, lang)} />
          <Link
            href='/tin-tuc'
            legacyBehavior={false}
            className='inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-blue-600 hover:text-brand-blue-700'
          >
            {pickLang(MORE_LABEL, lang)}
            <ArrowRight className='h-4 w-4' aria-hidden />
          </Link>
        </Reveal>

        <RevealGroup className='mt-10 grid grid-cols-1 gap-6 tab:grid-cols-3'>
          {items.map((item) => (
            <motion.div key={item.href} variants={revealItemVariants}>
              <Link legacyBehavior={false} href={item.href} className='group block h-full overflow-hidden rounded-md border border-surface-line bg-white shadow-soft transition-shadow hover:shadow-lift'>
                <div className='relative aspect-[16/10] overflow-hidden bg-paper'>
                  {item.image ? (
                    // Next 12 Image API: layout="fill" (không phải `fill` như Next 13+).
                    // unoptimized: ảnh bài viết nằm trên host của MH-api.
                    <Image
                      src={item.image}
                      alt={pickLang(item.title, lang)}
                      layout='fill'
                      objectFit='cover'
                      unoptimized
                      className='transition-transform duration-500 group-hover:scale-105'
                    />
                  ) : (
                    <span className='flex h-full items-center justify-center text-ink-soft/40'>
                      <Newspaper className='h-8 w-8' aria-hidden />
                    </span>
                  )}
                </div>
                <div className='p-5'>
                  <p className='font-display text-xs font-medium uppercase tracking-wide text-ink-soft'>
                    {formatDate(item.date, lang)}
                  </p>
                  <h3 className='mt-2 line-clamp-2 font-display text-base font-semibold text-navy-600'>
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
