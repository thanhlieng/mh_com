import { motion } from 'framer-motion';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/**
 * Mục 1.3 của spec — các hiệp hội và tổ chức logistics toàn cầu.
 *
 * Hiện hiển thị bằng chữ viết tắt + tên đầy đủ, vì logo của các hiệp hội
 * (FIATA, IATA, WCA, FMC…) là nhãn hiệu có bảo hộ và chỉ thành viên được phép
 * sử dụng theo quy định riêng của từng tổ chức — khác với logo hãng tàu lấy
 * được bản Public domain. Khi MH có bộ logo được phép dùng, thả file vào
 * `public/images/associations/` rồi thêm `logo` vào từng mục trong
 * `content/home.content.ts`; component tự chuyển sang hiển thị ảnh.
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
              className='flex flex-col items-center justify-start gap-3 rounded-md border border-surface-line bg-paper px-4 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue-300 hover:bg-white hover:shadow-soft'
            >
              <div className='relative flex h-9 w-full items-center justify-center'>
                {item.logo ? (
                  <Image
                    src={item.logo}
                    alt={item.abbr}
                    layout='fill'
                    objectFit='contain'
                    unoptimized
                    className='opacity-80 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0'
                  />
                ) : (
                  <span className='font-display text-base font-bold tracking-tight text-navy-600'>
                    {item.abbr}
                  </span>
                )}
              </div>
              <span className='text-[11px] leading-snug text-ink-soft'>
                {pickLang(item.name, lang)}
              </span>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
