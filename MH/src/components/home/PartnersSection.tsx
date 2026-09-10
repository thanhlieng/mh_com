import { motion } from 'framer-motion';
import { Factory, Ship } from 'lucide-react';
import useTranslation from 'next-translate/useTranslation';
import { ReactNode } from 'react';

import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { HomeContent, PartnerItem } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

interface GroupProps {
  title: string;
  note: string;
  items: PartnerItem[];
  icon: ReactNode;
  /** Lớp màu cố định (chuỗi đầy đủ để Tailwind JIT nhận diện). */
  tone: {
    chipBg: string;
    chipText: string;
    hoverBorder: string;
    bar: string;
  };
}

function PartnerGroup({ title, note, items, icon, tone }: GroupProps) {
  const { lang } = useTranslation('common');

  return (
    <div className='relative overflow-hidden rounded-3xl border border-surface-line bg-white p-6 shadow-soft tab:p-8'>
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 ${tone.bar}`} />

      <div className='flex items-start gap-4'>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone.chipBg} ${tone.chipText}`}
        >
          {icon}
        </span>
        <div>
          <h3 className='font-display text-lg font-bold text-navy-600'>{title}</h3>
          <p className='mt-1 text-sm leading-relaxed text-ink-soft'>{note}</p>
        </div>
      </div>

      <ul className='mt-6 grid grid-cols-2 gap-3'>
        {items.map((item) => (
          <motion.li
            key={item.name}
            variants={revealItemVariants}
            className={`rounded-xl border border-surface-line bg-paper px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft ${tone.hoverBorder}`}
          >
            <span className='block font-display text-sm font-bold tracking-tight text-navy-600'>
              {item.name}
            </span>
            <span className='mt-0.5 block text-xs leading-snug text-ink-soft'>
              {pickLang(item.note, lang)}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Mục "Đối tác" — thay cho bản đồ tuyến khai thác cũ. Hai nhóm phản ánh hai
 * đầu của một lô hàng: hãng tàu đưa hàng cập cảng Việt Nam, và nhà máy nội
 * địa gửi/nhận hàng.
 *
 * Hiển thị bằng chữ (wordmark) chứ không dùng logo hãng tàu — tránh dùng nhãn
 * hiệu bên thứ ba khi chưa có thoả thuận. Xem ghi chú dữ liệu trong
 * `content/home.content.ts`.
 */
export function PartnersSection({ partners }: { partners: HomeContent['partners'] }) {
  const { lang } = useTranslation('common');

  return (
    <section className='relative overflow-hidden py-20 tab:py-28'>
      <SectionGlow />
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={pickLang(partners.eyebrow, lang)}
            title={pickLang(partners.heading, lang)}
            description={pickLang(partners.description, lang)}
          />
        </Reveal>

        <RevealGroup className='mt-12 grid grid-cols-1 gap-6 lap:grid-cols-2'>
          <PartnerGroup
            title={pickLang(partners.carriers.title, lang)}
            note={pickLang(partners.carriers.note, lang)}
            items={partners.carriers.items}
            icon={<Ship className='h-6 w-6' aria-hidden />}
            tone={{
              chipBg: 'bg-brand-blue-50',
              chipText: 'text-brand-blue-600',
              hoverBorder: 'hover:border-brand-blue-300',
              bar: 'bg-gradient-to-r from-brand-blue-500 to-brand-teal-500',
            }}
          />
          <PartnerGroup
            title={pickLang(partners.domestic.title, lang)}
            note={pickLang(partners.domestic.note, lang)}
            items={partners.domestic.items}
            icon={<Factory className='h-6 w-6' aria-hidden />}
            tone={{
              chipBg: 'bg-brand-green-50',
              chipText: 'text-brand-green-600',
              hoverBorder: 'hover:border-brand-green-300',
              bar: 'bg-gradient-to-r from-brand-green-500 to-brand-teal-500',
            }}
          />
        </RevealGroup>
      </Container>
    </section>
  );
}
