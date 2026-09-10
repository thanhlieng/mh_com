import { motion } from 'framer-motion';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Counter } from '@/components/ui/Counter';
import { RevealGroup, revealItemVariants } from '@/components/ui/Reveal';

import { StatItem } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

/**
 * Dải số liệu — thay khối `dataFakeNew.dataFake` (biến tên "Fake" từng chạy
 * production trong `src/pages/index.tsx` cũ). Nguồn dữ liệu là
 * `content/home.content.ts`; số hiện tại là số minh hoạ, cần thay bằng số
 * thật khi lên production — xem `.claude/change-log.md`.
 */
export function StatBand({ stats }: { stats: StatItem[] }) {
  const { lang } = useTranslation('common');

  return (
    <section className='border-y border-surface-line bg-navy-600 py-14'>
      <Container>
        <RevealGroup className='grid grid-cols-2 gap-8 tab:grid-cols-4'>
          {stats.map((stat, i) => (
            <motion.div key={i} variants={revealItemVariants} className='text-center'>
              <div className='font-display text-4xl font-extrabold text-white tab:text-5xl'>
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className='mt-2 text-sm text-white/65'>{pickLang(stat.label, lang)}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
