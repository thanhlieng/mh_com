import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { ACCENT_CLASSES, ServiceIcon } from '@/components/ui/ServiceIcon';

import { ServiceSummary } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

export function ServiceCard({ service }: { service: ServiceSummary }) {
  const { lang } = useTranslation('common');
  const accent = ACCENT_CLASSES[service.accent];

  return (
    <Link
      href={`/dich-vu/${service.slug}`}
      legacyBehavior={false}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-surface-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift ${accent.hoverBorder}`}
    >
      <div className='relative h-44 w-full overflow-hidden'>
        <Image
          src={service.cardImage}
          alt=''
          layout='fill'
          objectFit='cover'
          className='transition-transform duration-500 group-hover:scale-105'
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${accent.imageOverlay}`} />
      </div>

      <span
        className={`relative -mt-7 ml-6 flex h-14 w-14 items-center justify-center rounded-xl border-4 border-white ${accent.bg50} shadow-soft transition-colors duration-300 ${accent.groupHoverBg500}`}
      >
        <ServiceIcon
          icon={service.icon}
          className={`h-7 w-7 ${accent.text} transition-colors duration-300 group-hover:text-white`}
        />
      </span>

      <div className='flex flex-1 flex-col px-6 pb-7 pt-4'>
        <h3 className='font-display text-xl font-bold text-navy-600'>
          {pickLang(service.title, lang)}
        </h3>
        <p className='mt-2 text-sm leading-relaxed text-ink-soft'>
          {pickLang(service.tagline, lang)}
        </p>

        <span
          className={`mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold ${accent.text}`}
        >
          {lang === 'en' ? 'Explore service' : 'Xem chi tiết'}
          <ArrowUpRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
        </span>
      </div>
    </Link>
  );
}
