import { ChevronRight, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { ServiceIcon } from '@/components/ui/ServiceIcon';

import { ServiceDetail } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

// Gradient ngang (đặc trái → nhạt phải) để chữ luôn đọc được mà ảnh dịch vụ
// thật phía sau vẫn hiện rõ, không bị phủ kín thành một khối màu phẳng.
const ACCENT_GRADIENT: Record<ServiceDetail['accent'], string> = {
  'brand-green': 'from-brand-green-900/95 via-brand-green-900/65 to-brand-green-900/10',
  'brand-blue': 'from-brand-blue-900/95 via-brand-blue-900/65 to-brand-blue-900/10',
  'brand-teal': 'from-brand-teal-900/95 via-brand-teal-900/65 to-brand-teal-900/10',
};

/**
 * Hero gọn cho trang dịch vụ — ảnh thật `service.heroImage` làm nền, phủ
 * gradient theo `service.accent` để người dùng định vị được mình đang ở
 * dịch vụ nào, nhất quán với màu trên thẻ dịch vụ ở trang chủ.
 */
export function ServiceHero({ service }: { service: ServiceDetail }) {
  const { lang } = useTranslation('common');

  return (
    <section className='relative overflow-hidden bg-navy-600 py-20 tab:py-28'>
      <Image src={service.heroImage} alt='' layout='fill' objectFit='cover' priority />
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-r ${ACCENT_GRADIENT[service.accent]}`}
      />
      <div aria-hidden className='absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5' />

      <Container className='relative'>
        <nav className='mb-6 flex items-center gap-1.5 text-xs text-white/60'>
          <Link href='/' legacyBehavior={false} className='flex items-center gap-1 hover:text-white'>
            <Home className='h-3.5 w-3.5' aria-hidden />
            {lang === 'en' ? 'Home' : 'Trang chủ'}
          </Link>
          <ChevronRight className='h-3.5 w-3.5' aria-hidden />
          <span className='text-white/85'>{pickLang(service.title, lang)}</span>
        </nav>

        <span className='mb-6 flex h-14 w-14 items-center justify-center rounded bg-white/15 backdrop-blur-sm'>
          <ServiceIcon icon={service.icon} className='h-7 w-7 text-white' />
        </span>

        <h1 className='max-w-2xl text-balance font-display text-display-lg font-light text-white'>
          {pickLang(service.heroHeadline, lang)}
        </h1>
        <p className='mt-5 max-w-xl text-base leading-relaxed text-white/80'>
          {pickLang(service.heroSub, lang)}
        </p>

        <div className='mt-8'>
          <CtaButton href='/customer-supports' variant='accent' size='lg'>
            {lang === 'en' ? 'Get a quote for this service' : 'Báo giá cho dịch vụ này'}
          </CtaButton>
        </div>
      </Container>
    </section>
  );
}
