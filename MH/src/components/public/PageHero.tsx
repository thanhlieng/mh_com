import { ChevronRight, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { ReactNode } from 'react';

import { Container } from '@/components/ui/Container';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Tên mục hiện tại trong breadcrumb — mặc định lấy theo `title`. */
  breadcrumb?: string;
  /** Ảnh nền tuỳ chọn; không có thì dùng nền gradient navy. */
  image?: string;
  children?: ReactNode;
}

/**
 * Hero gọn dùng chung cho các trang phụ (Về MH, Tin tức, Liên hệ) — cùng ngôn
 * ngữ thiết kế với `service/ServiceHero` nhưng không gắn màu dịch vụ, và thấp
 * hơn hero trang chủ vì các trang này ít thông tin, vào thẳng nội dung.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
  image,
  children,
}: PageHeroProps) {
  const { lang } = useTranslation('common');

  return (
    <section className='relative overflow-hidden bg-navy-600 py-16 tab:py-20'>
      {image && <Image src={image} alt='' layout='fill' objectFit='cover' priority />}
      <div
        aria-hidden
        className='absolute inset-0 bg-gradient-to-r from-navy-600/95 via-navy-600/80 to-navy-600/40'
      />

      <Container className='relative'>
        <nav className='mb-6 flex items-center gap-1.5 text-xs text-white/60'>
          <Link href='/' legacyBehavior={false} className='flex items-center gap-1 hover:text-white'>
            <Home className='h-3.5 w-3.5' aria-hidden />
            {lang === 'en' ? 'Home' : 'Trang chủ'}
          </Link>
          <ChevronRight className='h-3.5 w-3.5' aria-hidden />
          <span className='text-white/85'>{breadcrumb ?? title}</span>
        </nav>

        {eyebrow && (
          <p className='mb-4 font-display text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-400'>
            {eyebrow}
          </p>
        )}

        <h1 className='max-w-3xl text-balance font-display text-display-lg font-light text-white'>
          {title}
        </h1>

        {description && (
          <p className='mt-5 max-w-2xl text-base leading-relaxed text-white/75'>{description}</p>
        )}

        {children}
      </Container>
    </section>
  );
}
