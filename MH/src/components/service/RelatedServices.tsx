import { motion } from 'framer-motion';
import useTranslation from 'next-translate/useTranslation';

import { ServiceCard } from '@/components/home/ServiceCard';
import { Container } from '@/components/ui/Container';
import { RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { serviceSummaries } from '@/content/services.content';
import { ServiceSlug } from '@/content/types';

/**
 * Điều hướng chéo sang hai dịch vụ còn lại — khách đi biển gần như luôn
 * cần cả hải quan, nên đặt ngay dưới FAQ thay vì chỉ ở menu.
 */
export function RelatedServices({ current }: { current: ServiceSlug }) {
  const { lang } = useTranslation('common');
  const others = serviceSummaries.filter((s) => s.slug !== current);

  return (
    <section className='border-t border-surface-line bg-white py-20 tab:py-28'>
      <Container>
        <SectionHeading
          eyebrow={lang === 'en' ? 'Also useful' : 'Dịch vụ liên quan'}
          title={lang === 'en' ? 'Often paired with this service' : 'Thường đi kèm với dịch vụ này'}
        />
        <RevealGroup className='mt-10 grid grid-cols-1 gap-6 tab:grid-cols-2'>
          {others.map((s) => (
            <motion.div key={s.slug} variants={revealItemVariants}>
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
