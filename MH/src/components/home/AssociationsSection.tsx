import { motion } from 'framer-motion';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/**
 * Mục 1.3 (trang chủ) và 2.3 (Về chúng tôi) của spec — các hiệp hội và tổ
 * chức logistics. Mỗi thẻ: logo, tên viết tắt, tên đầy đủ. Mục nào chưa có
 * `logo` thì hiện chữ viết tắt thay ảnh. Nguồn logo: `content/about.content.ts`.
 */
export function AssociationsSection({
  associations,
}: {
  associations: HomeContent['associations'];
}) {
  const { lang } = useTranslation('common');

  return (
    <section className='border-y border-surface-line bg-white py-16 tab:py-20'>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={pickLang(associations.eyebrow, lang)}
            title={pickLang(associations.heading, lang)}
          />
        </Reveal>

        <RevealGroup className='mt-10 grid grid-cols-2 gap-4 tab:grid-cols-3 lap:grid-cols-6'>
          {associations.items.map((item) => (
            <motion.div
              key={item.abbr}
              variants={revealItemVariants}
              className='flex flex-col items-center justify-start gap-3 rounded-md border border-surface-line bg-white px-4 py-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue-300 hover:shadow-soft'
            >
              <div className='relative flex h-16 w-full items-center justify-center'>
                {item.logo ? (
                  <Image
                    src={item.logo}
                    alt={item.abbr}
                    layout='fill'
                    objectFit='contain'
                    unoptimized
                  />
                ) : (
                  <span className='font-display text-base font-bold tracking-tight text-navy-600'>
                    {item.abbr}
                  </span>
                )}
              </div>
              <span className='font-display text-sm font-semibold text-navy-600'>{item.abbr}</span>
              <span className='-mt-2 text-[11px] leading-snug text-ink-soft'>
                {pickLang(item.name, lang)}
              </span>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
