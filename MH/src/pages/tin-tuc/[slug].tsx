import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { IS_DEMO } from '@/lib/demoMode';

import { PageHero } from '@/components/public/PageHero';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

import { demoNoticeLabel, DemoPost, demoPosts } from '@/content/news.demo.content';
import { PublicLayout } from '@/layout/PublicLayout';
import { pickLang } from '@/utils/pickLang';

interface DemoPostPageProps {
  post: DemoPost;
}

/**
 * Trang chi tiết bài viết MẪU — chỉ tồn tại ở chế độ demo
 * (`NEXT_PUBLIC_DEMO_MODE=true`), để trang Tin tức trong bản demo không dẫn
 * vào ngõ cụt. Khi tắt demo, `getStaticPaths` không sinh đường dẫn nào nên
 * route này trả 404, và trang Tin tức trỏ về `/detail-post/[id]` như bình thường.
 *
 * Nhãn "Nội dung mẫu" luôn hiển thị — xem ghi chú ở `content/news.demo.content.ts`.
 */
function DemoPostPage({ post }: DemoPostPageProps) {
  const { lang } = useTranslation('common');
  const title = pickLang(post.title, lang);

  const dateLabel = new Date(post.date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <Head>
        <title>{`${title} — MH Great Sun`}</title>
        <meta name='description' content={pickLang(post.excerpt, lang)} />
        {/* Bài mẫu không nên được index. */}
        <meta name='robots' content='noindex' />
      </Head>

      <PageHero
        eyebrow={dateLabel}
        title={title}
        breadcrumb={lang === 'en' ? 'News' : 'Tin tức'}
        image={post.image}
      />

      <section className='py-14 tab:py-20'>
        <Container>
          <div className='mx-auto max-w-[68ch]'>
            <p className='mb-8 inline-flex items-center rounded border border-amber-300 bg-amber-50 px-3 py-1.5 font-display text-xs font-semibold text-navy-600'>
              {pickLang(demoNoticeLabel, lang)}
            </p>

            <Reveal className='relative mb-10 aspect-[16/9] overflow-hidden rounded-md'>
              <Image src={post.image} alt='' layout='fill' objectFit='cover' />
            </Reveal>

            <div className='flex flex-col gap-5'>
              {post.body.map((paragraph, i) => (
                <p key={i} className='text-[15px] leading-[1.75] text-ink-soft'>
                  {pickLang(paragraph, lang)}
                </p>
              ))}
            </div>

            <div className='mt-12 border-t border-surface-line pt-6'>
              <Link
                href='/tin-tuc'
                legacyBehavior={false}
                className='font-display text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700'
              >
                ← {lang === 'en' ? 'Back to news' : 'Quay lại Tin tức'}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

DemoPostPage.Layout = PublicLayout;

export default DemoPostPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  // Ngoài chế độ demo: không sinh đường dẫn nào → route trả 404.
  paths: IS_DEMO ? demoPosts.map((p) => ({ params: { slug: p.slug } })) : [],
  fallback: false,
});

export const getStaticProps: GetStaticProps<DemoPostPageProps> = async ({ params }) => {
  const post = demoPosts.find((p) => p.slug === params?.slug);
  if (!post) return { notFound: true };
  return { props: { post } };
};
