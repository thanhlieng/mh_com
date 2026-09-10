import useTranslation from 'next-translate/useTranslation';

import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionGlow } from '@/components/ui/SectionGlow';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { ProcessStep } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

import { ProcessTimeline } from './ProcessTimeline';

const COPY = {
  eyebrow: { vi: 'Quy trình', en: 'Process' },
  title: { vi: 'Năm bước, một điểm liên hệ duy nhất', en: 'Five steps, one point of contact' },
};

export function ProcessSection({ steps }: { steps: ProcessStep[] }) {
  const { lang } = useTranslation('common');

  // Nền paper (không phải trắng) để các thẻ quy trình màu trắng nổi lên.
  return (
    <section className='relative overflow-hidden border-y border-surface-line bg-paper py-20 tab:py-28'>
      <SectionGlow variant='top' />
      <Container>
        <Reveal>
          <SectionHeading eyebrow={pickLang(COPY.eyebrow, lang)} title={pickLang(COPY.title, lang)} />
        </Reveal>
        <div className='mt-12'>
          <ProcessTimeline steps={steps} />
        </div>
      </Container>
    </section>
  );
}
