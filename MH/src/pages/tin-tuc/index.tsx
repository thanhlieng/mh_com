import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useQuery } from 'react-query';

import { IS_DEMO } from '@/lib/demoMode';

import { PageHero } from '@/components/public/PageHero';
import { Container } from '@/components/ui/Container';
import { RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';

import { QUERY_POST } from '@/contants/query-key/post.query';
import { IDetailsPost } from '@/contants/types';
import { demoNoticeLabel, DemoPost, demoPosts } from '@/content/news.demo.content';
import { PublicLayout } from '@/layout/PublicLayout';
import { getListPost } from '@/services/post.service';
import { pickLang } from '@/utils/pickLang';

const COPY = {
  eyebrow: { vi: 'Tin tức', en: 'News' },
  title: {
    vi: 'Tin tức & kiến thức xuất nhập khẩu',
    en: 'News & trade insights',
  },
  description: {
    vi: 'Cập nhật từ MH và những điều đáng biết khi làm hàng qua cảng Hải Phòng.',
    en: 'Updates from MH and things worth knowing when shipping through Hai Phong Port.',
  },
  empty: {
    vi: 'Chưa có bài viết nào được đăng.',
    en: 'No articles have been published yet.',
  },
  error: {
    vi: 'Không tải được danh sách bài viết. Vui lòng thử lại sau.',
    en: 'Could not load the article list. Please try again later.',
  },
};

const PAGE_SIZE = 12;

function formatDate(value: string | Date, lang: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

interface CardData {
  href?: string;
  date: string | Date;
  image: string;
  title: string;
  description: string;
  isDemo?: boolean;
}

function PostCard({ post, lang }: { post: CardData; lang: string }) {
  const inner = (
    <>
      <div className='relative aspect-[16/10] w-full overflow-hidden bg-paper'>
        {post.image ? (
          <Image
            src={post.image}
            alt=''
            layout='fill'
            objectFit='cover'
            className='transition-transform duration-500 group-hover:scale-105'
            unoptimized
          />
        ) : (
          <span className='flex h-full items-center justify-center text-ink-soft/40'>
            <Newspaper className='h-8 w-8' aria-hidden />
          </span>
        )}
        {post.isDemo && (
          // Nhãn bắt buộc: bài mẫu không phải thông báo thật của MH.
          <span className='absolute left-3 top-3 rounded bg-navy-600/90 px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-wide text-white'>
            {pickLang(demoNoticeLabel, lang)}
          </span>
        )}
      </div>

      <div className='flex flex-1 flex-col p-5'>
        {post.date && (
          <span className='font-display text-xs text-ink-soft'>{formatDate(post.date, lang)}</span>
        )}
        <h2 className='mt-2 line-clamp-2 font-display text-base font-semibold text-navy-600'>
          {post.title}
        </h2>
        {post.description && (
          <p className='mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft'>
            {post.description}
          </p>
        )}
      </div>
    </>
  );

  const className =
    'group flex h-full flex-col overflow-hidden rounded-md border border-surface-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift';

  if (!post.href) return <div className={className}>{inner}</div>;

  return (
    <Link href={post.href} legacyBehavior={false} className={className}>
      {inner}
    </Link>
  );
}

function toCardData(post: IDetailsPost, lang: string): CardData {
  return {
    href: `/detail-post/${post.id}`,
    date: post.createdAt,
    image: post.thumbnail,
    title: lang === 'en' ? post.titleEn : post.titleVi,
    description: lang === 'en' ? post.descriptionEn : post.descriptionVi,
  };
}

function demoToCardData(post: DemoPost, lang: string): CardData {
  return {
    href: `/tin-tuc/${post.slug}`,
    date: post.date,
    image: post.image,
    title: pickLang(post.title, lang),
    description: pickLang(post.excerpt, lang),
    isDemo: true,
  };
}

function CardSkeleton() {
  return (
    <div className='overflow-hidden rounded-md border border-surface-line bg-white'>
      <div className='aspect-[16/10] w-full animate-pulse bg-paper' />
      <div className='space-y-3 p-5'>
        <div className='h-3 w-20 animate-pulse rounded bg-paper' />
        <div className='h-4 w-full animate-pulse rounded bg-paper' />
        <div className='h-4 w-2/3 animate-pulse rounded bg-paper' />
      </div>
    </div>
  );
}

/**
 * Trang Tin tức — lấy dữ liệu thật từ module `posts` của MH-api qua
 * `getListPost` (React Query), không hardcode. Bài viết trỏ sang trang chi
 * tiết có sẵn `/detail-post/[slug]` (slug ở route đó chính là `post.id`).
 *
 * Không dùng SSG vì nội dung thay đổi theo dữ liệu backend; có đủ 3 trạng
 * thái tải / rỗng / lỗi để trang không bao giờ trắng trơn.
 */
function NewsPage() {
  const { lang } = useTranslation('common');

  // Chế độ demo: không gọi API (`enabled: false`) và dùng bài viết mẫu tĩnh.
  const { data, isLoading, isError } = useQuery(
    [QUERY_POST.GET_LIST_POST, { page: 1, pageSize: PAGE_SIZE }],
    () => getListPost({ page: 1, pageSize: PAGE_SIZE }),
    { retry: 1, enabled: !IS_DEMO }
  );

  const cards: CardData[] = IS_DEMO
    ? demoPosts.map((p) => demoToCardData(p, lang))
    : (data?.data ?? []).map((p) => toCardData(p, lang));

  const showSkeleton = !IS_DEMO && isLoading;
  const showFallback = !IS_DEMO && !isLoading && (isError || cards.length === 0);

  return (
    <>
      <Head>
        <title>{`${pickLang(COPY.title, lang)} — MH Great Sun`}</title>
        <meta name='description' content={pickLang(COPY.description, lang)} />
      </Head>

      <PageHero
        eyebrow={pickLang(COPY.eyebrow, lang)}
        title={pickLang(COPY.title, lang)}
        description={pickLang(COPY.description, lang)}
        breadcrumb={pickLang(COPY.eyebrow, lang)}
      />

      <section className='relative overflow-hidden py-16 tab:py-20'>
        <SectionGlow variant='top' />
        <Container>
          {showSkeleton && (
            <div className='grid grid-cols-1 gap-6 tab:grid-cols-2 lap:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {showFallback && (
            <div className='rounded-md border border-dashed border-surface-line bg-white px-6 py-16 text-center'>
              <span className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper'>
                <Newspaper className='h-6 w-6 text-ink-soft' aria-hidden />
              </span>
              <p className='mt-4 text-sm text-ink-soft'>
                {pickLang(isError ? COPY.error : COPY.empty, lang)}
              </p>
            </div>
          )}

          {!showSkeleton && !showFallback && cards.length > 0 && (
            <RevealGroup className='grid grid-cols-1 gap-6 tab:grid-cols-2 lap:grid-cols-3'>
              {cards.map((card) => (
                <motion.div key={card.href ?? card.title} variants={revealItemVariants}>
                  <PostCard post={card} lang={lang} />
                </motion.div>
              ))}
            </RevealGroup>
          )}
        </Container>
      </section>
    </>
  );
}

NewsPage.Layout = PublicLayout;

export default NewsPage;
