import useTranslation from 'next-translate/useTranslation';

import { AccordionItem } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

import { FaqItem } from '@/content/types';
import { pickLang } from '@/utils/pickLang';

export function ServiceFAQ({ faqs }: { faqs: FaqItem[] }) {
  const { lang } = useTranslation('common');
  if (faqs.length === 0) return null;

  return (
    <div className='mx-auto max-w-2xl'>
      <Reveal>
        <SectionHeading
          eyebrow={lang === 'en' ? 'FAQ' : 'Câu hỏi thường gặp'}
          title={lang === 'en' ? 'Common questions' : 'Những điều khách hàng hay hỏi'}
        />
      </Reveal>
      <Reveal delay={0.1} className='mt-8 rounded-2xl border border-surface-line bg-white px-6 shadow-soft'>
        {faqs.map((faq, i) => (
          <AccordionItem key={i} question={pickLang(faq.question, lang)} answer={pickLang(faq.answer, lang)} />
        ))}
      </Reveal>
    </div>
  );
}
