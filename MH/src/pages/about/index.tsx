import { motion } from 'framer-motion';
import { Clock, Eye, Handshake, LucideIcon, ShieldCheck } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import { ProcessSection } from '@/components/home/ProcessSection';
import { QuoteCta } from '@/components/home/QuoteCta';
import { ServiceCard } from '@/components/home/ServiceCard';
import { StatBand } from '@/components/home/StatBand';
import { PageHero } from '@/components/public/PageHero';
import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { aboutContent, AboutValue } from '@/content/about.content';
import { homeContent } from '@/content/home.content';
import { serviceSummaries } from '@/content/services.content';
import { PublicLayout } from '@/layout/PublicLayout';
import { pickLang } from '@/utils/pickLang';

const VALUE_ICONS: Record<AboutValue['icon'], LucideIcon> = {
  'shield-check': ShieldCheck,
  clock: Clock,
  eye: Eye,
  handshake: Handshake,
};

const SERVICES_COPY = {
  eyebrow: { vi: 'Dịch vụ', en: 'Services' },
  heading: { vi: 'Ba mảng chúng tôi trực tiếp làm', en: 'Three legs we handle ourselves' },
};

/**
 * Trang "Về MH" — dựng lại theo design mới (`PublicLayout`, SSG).
 *
 * Thay hoàn toàn `container/AboutForm` cũ: nội dung cũ viết về thương hiệu
 * **ACF** và ghép từ các file `about*.svg` không tồn tại trong `public/images`
 * nên trang chỉ hiện ảnh vỡ.
 */
function AboutPage() {
  const { lang } = useTranslation('common');
  const { hero, intro, values } = aboutContent;

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
        image={hero.image}
      />

      {/* Giới thiệu: chữ bên trái, ảnh bên phải. */}
      <section className='relative overflow-hidden py-20 tab:py-24'>
        <SectionGlow variant='top' />
        <Container className='grid grid-cols-1 items-center gap-12 lap:grid-cols-2'>
          <Reveal>
            <SectionHeading title={pickLang(intro.heading, lang)} />
            <div className='mt-6 flex flex-col gap-4'>
              {intro.paragraphs.map((p, i) => (
                <p key={i} className='text-[15px] leading-relaxed text-ink-soft'>
                  {pickLang(p, lang)}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className='relative aspect-[4/3] overflow-hidden rounded-md'>
            <Image src={intro.image} alt='' layout='fill' objectFit='cover' />
          </Reveal>
        </Container>
      </section>

      <StatBand stats={homeContent.stats} />

      {/* Giá trị / cách làm việc. */}
      <section className='relative overflow-hidden py-20 tab:py-24'>
        <SectionGlow />
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={pickLang(values.eyebrow, lang)}
              title={pickLang(values.heading, lang)}
            />
          </Reveal>

          <RevealGroup className='mt-12 grid grid-cols-1 gap-6 tab:grid-cols-2 lap:grid-cols-4'>
            {values.items.map((item) => {
              const Icon = VALUE_ICONS[item.icon];
              return (
                <motion.div
                  key={item.icon}
                  variants={revealItemVariants}
                  className='rounded-md border border-surface-line bg-white p-6 shadow-soft transition-shadow hover:shadow-lift'
                >
                  <span className='flex h-12 w-12 items-center justify-center rounded bg-brand-blue-50'>
                    <Icon className='h-6 w-6 text-brand-blue-600' aria-hidden />
                  </span>
                  <h3 className='mt-4 font-display text-base font-semibold text-navy-600'>
                    {pickLang(item.title, lang)}
                  </h3>
                  <p className='mt-2 text-sm leading-relaxed text-ink-soft'>
                    {pickLang(item.detail, lang)}
                  </p>
                </motion.div>
              );
            })}
          </RevealGroup>
        </Container>
      </section>

      {/* Ba dịch vụ — dùng lại thẻ của trang chủ. */}
      <section className='border-t border-surface-line bg-white py-20 tab:py-24'>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={pickLang(SERVICES_COPY.eyebrow, lang)}
              title={pickLang(SERVICES_COPY.heading, lang)}
            />
          </Reveal>
          <RevealGroup className='mt-12 grid grid-cols-1 gap-6 tab:grid-cols-3'>
            {serviceSummaries.map((s) => (
              <motion.div key={s.slug} variants={revealItemVariants}>
                <ServiceCard service={s} />
              </motion.div>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <ProcessSection steps={homeContent.process} />
      <QuoteCta cta={homeContent.quoteCta} />
    </>
  );
}

AboutPage.Layout = PublicLayout;

export default AboutPage;
