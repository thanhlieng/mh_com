import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import { AssociationsSection } from '@/components/home/AssociationsSection';
import { Hero } from '@/components/home/Hero';
import { IntroSection } from '@/components/home/IntroSection';
import { MarketsSection } from '@/components/home/MarketsSection';
import { NewsTeaser } from '@/components/home/NewsTeaser';
import { PartnersSection } from '@/components/home/PartnersSection';
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
    vi: 'MH Great Sun — Giải pháp logistics & vận chuyển quốc tế',
    en: 'MH Great Sun — Logistics & International Freight Solutions',
  },
  description: {
    vi: 'MH Great Sun cung cấp giải pháp logistics trọn gói: vận chuyển đường biển, hàng không quốc tế, đường bộ nội địa, xuyên biên giới và đại lý hải quan.',
    en: 'MH Great Sun provides end-to-end logistics: international sea and air freight, domestic and cross-border road freight, and customs brokerage.',
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

      {/* Thứ tự bám theo spec Demo_noi_dung_website_MHGS, mục 1.1 → 1.6. */}
      <Hero hero={homeContent.hero} />
      <IntroSection intro={homeContent.intro} />
      <ServiceGrid services={homeContent.services} />
      <StatBand stats={homeContent.stats} />
      <AssociationsSection associations={homeContent.associations} />
      <PartnersSection partners={homeContent.partners} />
      <MarketsSection markets={homeContent.markets} />
      <NewsTeaser news={homeContent.news} />
      <QuoteCta cta={homeContent.quoteCta} />
    </>
  );
}

HomePage.Layout = PublicLayout;

export default HomePage;
