import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AccordionItemProps {
  question: string;
  answer: ReactNode;
  defaultOpen?: boolean;
}

/**
 * FAQ accordion dựng bằng <details>/<summary> gốc — có sẵn hành vi
 * keyboard/focus/screen-reader, không cần thêm state React hay thư viện.
 * Dùng cho ServiceFAQ ở trang dịch vụ.
 */
export function AccordionItem({ question, answer, defaultOpen }: AccordionItemProps) {
  return (
    <details
      open={defaultOpen}
      className='group border-b border-surface-line py-5 first:pt-0 last:border-b-0'
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between gap-4',
          'font-display text-base font-semibold text-navy-600'
        )}
      >
        {question}
        <ChevronDown
          className='h-5 w-5 shrink-0 text-brand-blue-500 transition-transform duration-200 group-open:rotate-180'
          aria-hidden
        />
      </summary>
      <div className='mt-3 max-w-[65ch] text-sm leading-relaxed text-ink-soft'>{answer}</div>
    </details>
  );
}
