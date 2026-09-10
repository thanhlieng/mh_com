import { motion } from 'framer-motion';
import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup, revealItemVariants } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { ServiceSummary } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

import { ServiceCard } from './ServiceCard';

const COPY = {
  eyebrow: { vi: 'Ba dịch vụ lõi', en: 'Three core services' },
  title: {
    vi: 'Một đầu mối cho toàn bộ hành trình lô hàng',
    en: 'One partner for your entire shipment journey',
  },
  desc: {
    vi: 'Từ cảng Hải Phòng tới tận kho, từ chứng từ tới tờ khai hải quan — MH xử lý trọn gói để bạn chỉ cần theo dõi một mã vận đơn duy nhất.',
    en: 'From Hai Phong Port to your warehouse, from paperwork to customs form — MH handles it end to end, so you only track one shipment code.',
  },
};

export function ServiceGrid({ services }: { services: ServiceSummary[] }) {
  const { lang } = useTranslation('common');

  return (
    <section className='relative overflow-hidden py-20 tab:py-28'>
      <SectionGlow />
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={pickLang(COPY.eyebrow, lang)}
            title={pickLang(COPY.title, lang)}
            description={pickLang(COPY.desc, lang)}
          />
        </Reveal>

        <RevealGroup className='mt-12 grid grid-cols-1 gap-6 tab:grid-cols-3'>
          {services.map((service) => (
            <motion.div key={service.slug} variants={revealItemVariants}>
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
