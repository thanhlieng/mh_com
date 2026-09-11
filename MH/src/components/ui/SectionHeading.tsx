import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * Tiêu đề mục chuẩn cho toàn trang public redesign — thay `TitleDecoration`
 * cũ. eyebrow là nhãn nhỏ viết hoa phía trên, chỉ mang tính định vị mục
 * (không phải số thứ tự — trang này không phải một chuỗi tuần tự).
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'mb-3 font-display text-xs font-semibold uppercase tracking-[0.18em]',
            tone === 'dark' ? 'text-brand-teal-600' : 'text-brand-teal-200'
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-balance font-display text-display-md font-light tracking-normal',
          tone === 'dark' ? 'text-navy-600' : 'text-white'
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed',
            tone === 'dark' ? 'text-ink-soft' : 'text-white/75'
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
