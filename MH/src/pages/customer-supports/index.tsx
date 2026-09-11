import { motion } from 'framer-motion';
import { Check, LucideIcon, Mail, MapPin, Phone } from 'lucide-react';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import { PageHero } from '@/components/public/PageHero';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { ContactChannel, contactContent } from '@/content/contact.content';
import { PublicLayout } from '@/layout/PublicLayout';
import { pickLang } from '@/utils/pickLang';

const CHANNEL_ICONS: Record<ContactChannel['kind'], LucideIcon> = {
  phone: Phone,
  email: Mail,
  address: MapPin,
};

const MAIL_SUBJECT = {
  vi: 'Yêu cầu báo giá vận chuyển',
  en: 'Freight quote request',
};

/**
 * Trang Liên hệ — dựng lại theo design mới.
 *
 * Cố ý KHÔNG dựng lại form gửi tin nhắn của `container/CustomerSupportForm`
 * cũ: nút "Gửi" ở đó không gắn handler nào và backend cũng chưa có endpoint
 * nhận liên hệ, nên form chỉ tạo cảm giác đã gửi mà thực tế không gửi đi đâu.
 * Thay bằng các kênh liên hệ hoạt động thật (gọi / email có sẵn tiêu đề) kèm
 * danh sách thông tin nên gửi để được báo giá ngay.
 *
 * Khi có endpoint `POST /api/public/quote-requests` (ngoài phạm vi đợt này),
 * bổ sung form vào chỗ khối "checklist" bên dưới.
 */
function ContactPage() {
  const { lang } = useTranslation('common');
  const { hero, channels, checklist } = contactContent;

  const emailChannel = channels.find((c) => c.kind === 'email');
  const phoneChannel = channels.find((c) => c.kind === 'phone');
  const mailtoHref = emailChannel
    ? `mailto:${emailChannel.value}?subject=${encodeURIComponent(pickLang(MAIL_SUBJECT, lang))}`
    : undefined;

  return (
    <>
      <Head>
        <title>{`${pickLang(hero.eyebrow, lang)} — MH Great Sun`}</title>
        <meta name='description' content={pickLang(hero.description, lang)} />
      </Head>

      <PageHero
        eyebrow={pickLang(hero.eyebrow, lang)}
        title={pickLang(hero.title, lang)}
        description={pickLang(hero.description, lang)}
        breadcrumb={pickLang(hero.eyebrow, lang)}
      >
        <div className='mt-8 flex flex-wrap gap-3'>
          {mailtoHref && (
            <CtaButton href={mailtoHref} variant='light' size='lg'>
              {lang === 'en' ? 'Email us' : 'Gửi email'}
            </CtaButton>
          )}
          {phoneChannel?.href && (
            <CtaButton href={phoneChannel.href} variant='outline' size='lg' showArrow={false}>
              {phoneChannel.value}
            </CtaButton>
          )}
        </div>
      </PageHero>

      {/* Kênh liên hệ */}
      <section className='relative overflow-hidden py-16 tab:py-20'>
        <SectionGlow variant='top' />
        <Container>
          <RevealGroup className='grid grid-cols-1 gap-6 tab:grid-cols-3'>
            {channels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.kind];
              const body = (
                <>
                  <span className='flex h-12 w-12 items-center justify-center rounded bg-brand-blue-50'>
                    <Icon className='h-6 w-6 text-brand-blue-600' aria-hidden />
                  </span>
                  <p className='mt-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft'>
                    {pickLang(channel.label, lang)}
                  </p>
                  <p className='mt-1.5 font-display text-lg font-semibold text-navy-600'>
                    {channel.value}
                  </p>
                  {channel.note && (
                    <p className='mt-1 text-sm text-ink-soft'>{pickLang(channel.note, lang)}</p>
                  )}
                </>
              );

              const className =
                'flex h-full flex-col rounded-md border border-surface-line bg-white p-6 shadow-soft transition-all duration-200';

              return (
                <motion.div key={channel.kind} variants={revealItemVariants}>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className={`${className} hover:-translate-y-1 hover:border-brand-blue-300 hover:shadow-lift`}
                    >
                      {body}
                    </a>
                  ) : (
                    <div className={className}>{body}</div>
                  )}
                </motion.div>
              );
            })}
          </RevealGroup>
        </Container>
      </section>

      {/* Cần gửi những gì để được báo giá nhanh */}
      <section className='border-t border-surface-line bg-white py-16 tab:py-20'>
        <Container className='grid grid-cols-1 gap-12 lap:grid-cols-[1fr_1.2fr]'>
          <Reveal>
            <SectionHeading title={pickLang(checklist.heading, lang)} />
          </Reveal>

          <Reveal delay={0.1}>
            <ul className='flex flex-col gap-3'>
              {checklist.items.map((item, i) => (
                <li
                  key={i}
                  className='flex items-start gap-3 rounded-md border border-surface-line bg-paper px-4 py-3.5'
                >
                  <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green-500'>
                    <Check className='h-3 w-3 text-white' aria-hidden />
                  </span>
                  <span className='text-sm leading-relaxed text-navy-600'>
                    {pickLang(item, lang)}
                  </span>
                </li>
              ))}
            </ul>

            {mailtoHref && (
              <div className='mt-6'>
                <CtaButton href={mailtoHref} variant='solid' size='md'>
                  {lang === 'en' ? 'Send these by email' : 'Gửi thông tin qua email'}
                </CtaButton>
              </div>
            )}
          </Reveal>
        </Container>
      </section>
    </>
  );
}

ContactPage.Layout = PublicLayout;

export default ContactPage;
