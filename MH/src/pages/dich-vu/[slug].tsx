import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { ProcessTimeline } from '@/components/home/ProcessTimeline';
import { RelatedServices } from '@/components/service/RelatedServices';
import { ServiceFAQ } from '@/components/service/ServiceFAQ';
import { ServiceHero } from '@/components/service/ServiceHero';
import { SpecTable } from '@/components/service/SpecTable';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { serviceDetails } from '@/content/services.content';
import { ServiceDetail, ServiceSlug } from '@/content/types';
import { PublicLayout } from '@/layout/PublicLayout';
import { pickLang } from '@/utils/pickLang';

interface ServicePageProps {
  service: ServiceDetail;
}

/**
 * Template dùng chung cho cả 3 trang dịch vụ lõi — chỉ nội dung
 * (`content/services.content.ts`) khác nhau. Static-generated
 * (`getStaticPaths`/`getStaticProps`) vì nội dung hardcode, không phụ thuộc
 * request — cho SEO tốt hơn hẳn cách fetch client-side của các trang cũ.
 */
function ServicePage({ service }: ServicePageProps) {
  const { lang } = useTranslation('common');
  const router = useRouter();

  if (router.isFallback) return null;

  return (
    <>
      <Head>
        <title>{pickLang(service.title, lang)} — MH Great Sun</title>
        <meta name='description' content={pickLang(service.tagline, lang)} />
      </Head>

      <ServiceHero service={service} />

      <section className='relative overflow-hidden py-16 tab:py-24'>
        <SectionGlow variant='top' />
        <Container className='grid grid-cols-1 gap-14 lap:grid-cols-[1fr_1.4fr]'>
          <div>
            <SectionHeading
              eyebrow={lang === 'en' ? 'At a glance' : 'Thông số dịch vụ'}
              title={lang === 'en' ? 'What you need to know' : 'Những điều cần biết'}
            />
          </div>
          <SpecTable rows={service.specs} accent={service.accent} />
        </Container>
      </section>

      <section className='border-y border-surface-line bg-paper py-16 tab:py-24'>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={lang === 'en' ? 'Process' : 'Quy trình'}
              title={lang === 'en' ? 'How it works' : 'Quy trình thực hiện'}
            />
          </Reveal>
          <div className='mt-12'>
            <ProcessTimeline steps={service.process} accent={service.accent} />
          </div>
        </Container>
      </section>

      <section className='relative overflow-hidden py-16 tab:py-24'>
        <SectionGlow />
        <Container>
          <ServiceFAQ faqs={service.faqs} />
        </Container>
      </section>

      <RelatedServices current={service.slug} />
    </>
  );
}

ServicePage.Layout = PublicLayout;

export default ServicePage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(serviceDetails).map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<ServicePageProps> = async ({ params }) => {
  const slug = params?.slug as ServiceSlug;
  const service = serviceDetails[slug];
  if (!service) return { notFound: true };
  return { props: { service } };
};
