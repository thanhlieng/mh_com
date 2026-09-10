import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import { Hero } from '@/components/home/Hero';
import { NewsTeaser } from '@/components/home/NewsTeaser';
import { PartnersSection } from '@/components/home/PartnersSection';
import { ProcessSection } from '@/components/home/ProcessSection';
import { QuoteCta } from '@/components/home/QuoteCta';
import { ServiceGrid } from '@/components/home/ServiceGrid';
import { StatBand } from '@/components/home/StatBand';

import { homeContent } from '@/content/home.content';
import { PublicLayout } from '@/layout/PublicLayout';
import { pickLang } from '@/utils/pickLang';

/**
 * Trang chủ — viết lại hoàn toàn (redesign web công khai). Thay bản cũ vốn
 * fetch dữ liệu qua `useEffect`+`useState`, chứa biến tên `dataFakeNew.dataFake`
 * chạy production, và hero là `banner.png` bị `object-fill` kéo méo.
 *
 * Nội dung lấy từ `content/home.content.ts` (hardcode đợt này, shape khớp
 * CMS tương lai — xem `content/types.ts`). `Page.Layout = PublicLayout` để
 * Next.js SSR bình thường (không còn `dynamic(..., { ssr: false })`).
 */
const SEO = {
  title: {
    vi: 'MH Great Sun — Vận chuyển đường bộ, đường biển & khai báo hải quan',
    en: 'MH Great Sun — Road, Sea Freight & Customs Clearance',
  },
  description: {
    vi: 'MH Great Sun cung cấp vận chuyển đường bộ, đường biển FCL/LCL và khai báo hải quan trọn gói qua cảng Hải Phòng, kết nối Việt Nam đi khắp thế giới.',
    en: 'MH Great Sun provides road freight, FCL/LCL sea freight, and end-to-end customs clearance through Hai Phong Port, connecting Vietnam to the world.',
  },
};

function HomePage() {
  const { lang } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{pickLang(SEO.title, lang)}</title>
        <meta name='description' content={pickLang(SEO.description, lang)} />
      </Head>

      <Hero hero={homeContent.hero} />
      <ServiceGrid services={homeContent.services} />
      <StatBand stats={homeContent.stats} />
      <ProcessSection steps={homeContent.process} />
      <PartnersSection partners={homeContent.partners} />
      <NewsTeaser news={homeContent.news} />
      <QuoteCta cta={homeContent.quoteCta} />
    </>
  );
}

HomePage.Layout = PublicLayout;

export default HomePage;
