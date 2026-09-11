import { Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { Reveal } from '@/components/ui/Reveal';

import { HomeContent } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

const POINTS = [
  { icon: Clock, label: { vi: 'Phản hồi trong ngày làm việc', en: 'Reply within one business day' } },
  { icon: ShieldCheck, label: { vi: 'Báo giá theo đúng tuyến & tải trọng', en: 'Quote matched to your route & load' } },
  { icon: MessageCircle, label: { vi: 'Tư vấn trực tiếp, không qua trung gian', en: 'Direct advisory, no middleman' } },
];

/**
 * Dải CTA báo giá — cuối trang chủ. Điều hướng sang `/customer-supports`
 * (form yêu cầu khách hàng đã có sẵn) thay vì dựng form gửi lead mới; endpoint
 * nhận lead báo giá riêng (`POST /api/public/quote-requests`) nằm ngoài
 * phạm vi đợt redesign này — xem `.claude/change-log.md`.
 */
export function QuoteCta({ cta }: { cta: HomeContent['quoteCta'] }) {
  const { lang } = useTranslation('common');

  return (
    <section className='py-20 tab:py-28'>
      <Container>
        <Reveal className='relative overflow-hidden rounded-md bg-gradient-to-br from-brand-green-600 via-brand-teal-600 to-brand-blue-600 px-6 py-14 text-center tab:px-16 tab:py-20'>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 opacity-25'
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, white, transparent 35%), radial-gradient(circle at 85% 80%, white, transparent 35%)',
            }}
          />
          <div className='relative'>
            <h2 className='mx-auto max-w-2xl text-balance font-display text-display-md font-light text-white'>
              {pickLang(cta.heading, lang)}
            </h2>
            <p className='mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85'>
              {pickLang(cta.sub, lang)}
            </p>

            <div className='mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3'>
              {POINTS.map(({ icon: Icon, label }, i) => (
                <div key={i} className='flex items-center gap-2 text-sm font-medium text-white/90'>
                  <Icon className='h-4 w-4' aria-hidden />
                  {pickLang(label, lang)}
                </div>
              ))}
            </div>

            <div className='mt-9'>
              <CtaButton href='/customer-supports' variant='accent' size='lg'>
                {lang === 'en' ? 'Request a quote' : 'Nhận báo giá ngay'}
              </CtaButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
