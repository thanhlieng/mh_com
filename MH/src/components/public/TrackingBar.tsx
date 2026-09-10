import { ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { FormEvent, useState } from 'react';

import { cn } from '@/lib/utils';

import { pickLang } from '@/utils/pickLang';

const COPY = {
  placeholder: { vi: 'Nhập mã vận đơn…', en: 'Enter tracking code…' },
  cta: { vi: 'Tra cứu', en: 'Track' },
  label: { vi: 'Tra cứu vận đơn', en: 'Track your shipment' },
};

interface TrackingBarProps {
  /** `hero`: cỡ lớn trong Hero. `compact`: thu gọn trong header khi cuộn. */
  variant?: 'hero' | 'compact';
}

/**
 * Ô tra cứu vận đơn — cùng logic điều hướng với `components/TrackingForm` cũ
 * (`router.push('/tracking/{code}')`) nhưng viết lại giao diện, và dựng thêm
 * biến thể `compact` để đặt trong header sticky.
 */
export function TrackingBar({ variant = 'hero' }: TrackingBarProps) {
  const { lang } = useTranslation('common');
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/tracking/${encodeURIComponent(trimmed)}`);
  };

  if (variant === 'compact') {
    return (
      <form
        onSubmit={handleSubmit}
        className='flex h-11 items-center gap-2 rounded-full border border-surface-line bg-white pl-2 pr-1.5 shadow-soft transition-shadow focus-within:shadow-lift focus-within:ring-2 focus-within:ring-brand-blue-300'
      >
        <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue-50'>
          <Search className='h-3.5 w-3.5 text-brand-blue-500' aria-hidden />
        </span>
        <label className='sr-only' htmlFor='tracking-compact'>
          {pickLang(COPY.label, lang)}
        </label>
        <input
          id='tracking-compact'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={pickLang(COPY.placeholder, lang)}
          className='w-full min-w-0 bg-transparent font-display text-sm text-navy-600 placeholder:text-ink-soft/60 focus:outline-none'
        />
        <button
          type='submit'
          className='shrink-0 rounded-full bg-brand-blue-500 px-4 py-1.5 font-display text-xs font-semibold text-white transition-colors hover:bg-brand-blue-600'
        >
          {pickLang(COPY.cta, lang)}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full max-w-xl flex-col gap-2.5 rounded-2xl border border-white/20 bg-white/10 p-2.5 shadow-lift backdrop-blur-md',
        'focus-within:border-amber-400/60',
        'tab:flex-row tab:items-center tab:rounded-full tab:p-2'
      )}
    >
      <div className='flex flex-1 items-center gap-3 rounded-xl bg-white px-3 py-2.5 tab:rounded-full tab:py-3'>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue-50'>
          <Search className='h-4 w-4 text-brand-blue-500' aria-hidden />
        </span>
        <label className='sr-only' htmlFor='tracking-hero'>
          {pickLang(COPY.label, lang)}
        </label>
        <input
          id='tracking-hero'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={pickLang(COPY.placeholder, lang)}
          className='w-full min-w-0 bg-transparent font-display text-sm text-navy-600 placeholder:text-ink-soft/70 focus:outline-none tab:text-base'
        />
      </div>
      <button
        type='submit'
        className='group flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-6 py-3 font-display text-sm font-semibold text-navy-600 shadow-soft transition-all hover:bg-amber-500 hover:shadow-lift tab:rounded-full'
      >
        {pickLang(COPY.cta, lang)}
        <ArrowRight className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5' aria-hidden />
      </button>
    </form>
  );
}
