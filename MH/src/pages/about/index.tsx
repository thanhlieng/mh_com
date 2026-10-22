import { Compass, Target } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import { CoreValues } from '@/components/about/CoreValues';
import { AssociationsSection } from '@/components/home/AssociationsSection';
import { QuoteCta } from '@/components/home/QuoteCta';
import { ServiceGrid } from '@/components/home/ServiceGrid';
import { StatBand } from '@/components/home/StatBand';
import { PageHero } from '@/components/public/PageHero';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { aboutContent } from '@/content/about.content';
import { homeContent } from '@/content/home.content';
import { PublicLayout } from '@/layout/PublicLayout';
import { pickLang } from '@/utils/pickLang';

/**
 * Trang "Về chúng tôi" — nội dung bám theo spec chính thức
 * `Demo_noi_dung_website_MHGS_261015.pdf`, mục 2 (2.1 giới thiệu + slogan,
 * 2.2 tầm nhìn / sứ mệnh / giá trị cốt lõi, 2.3 liên kết & hiệp hội).
 */
function AboutPage() {
  const { lang } = useTranslation('common');
  const { hero, intro, visionMission, values, associations } = aboutContent;

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

      {/* 2.1 — Giới thiệu công ty */}
      <section className='relative overflow-hidden py-20 tab:py-24'>
        <SectionGlow variant='top' />
        <Container className='grid grid-cols-1 items-center gap-12 lap:grid-cols-2'>
          <Reveal>
            <SectionHeading title={pickLang(intro.heading, lang)} />

            <p className='mt-5 font-display text-lg font-semibold tracking-tight text-brand-green-600'>
              “{pickLang(intro.slogan, lang)}”
            </p>

            <div className='mt-5 flex flex-col gap-4'>
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

      {/* 2.2 — Tầm nhìn & Sứ mệnh */}
      <section className='border-y border-surface-line bg-paper py-20 tab:py-24'>
        <Container>
          <Reveal>
            <SectionHeading title={pickLang(visionMission.heading, lang)} />
          </Reveal>

          <div className='mt-10 grid grid-cols-1 gap-6 tab:grid-cols-2'>
            {[
              { ...visionMission.vision, Icon: Compass, bar: 'bg-brand-blue-500', chip: 'bg-brand-blue-50 text-brand-blue-600' },
              { ...visionMission.mission, Icon: Target, bar: 'bg-brand-green-500', chip: 'bg-brand-green-50 text-brand-green-600' },
            ].map(({ label, body, Icon, bar, chip }, i) => (
              <Reveal
                key={label.en}
                delay={i * 0.1}
                className='relative overflow-hidden rounded-md border border-surface-line bg-white p-7 shadow-soft'
              >
                <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
                <span className={`flex h-12 w-12 items-center justify-center rounded ${chip}`}>
                  <Icon className='h-6 w-6' aria-hidden />
                </span>
                <h3 className='mt-4 font-display text-lg font-semibold text-navy-600'>
                  {pickLang(label, lang)}
                </h3>
                <p className='mt-3 text-[15px] leading-relaxed text-ink-soft'>
                  {pickLang(body, lang)}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 2.2 — Giá trị cốt lõi (3 vòng tròn liên kết) */}
      <section className='relative overflow-hidden py-20 tab:py-24'>
        <SectionGlow />
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={pickLang(values.eyebrow, lang)}
              title={pickLang(values.heading, lang)}
              align='center'
            />
          </Reveal>
          <div className='mt-12'>
            <CoreValues items={values.items} />
          </div>
        </Container>
      </section>

      {/* 2.3 — Các liên kết và Hiệp hội */}
      <AssociationsSection
        associations={{
          eyebrow: associations.eyebrow,
          heading: associations.heading,
          items: associations.items,
        }}
      />

      <ServiceGrid services={homeContent.services} />
      <QuoteCta cta={homeContent.quoteCta} />
    </>
  );
}

AboutPage.Layout = PublicLayout;

export default AboutPage;
