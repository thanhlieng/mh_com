import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Nút CTA cho trang public redesign. Khác `components/ui/button.tsx` (shadcn
 * gốc, dùng token --primary chung cho toàn app) — component này gắn màu
 * thương hiệu mới + micro-interaction mũi tên trượt khi hover.
 */
// Bo góc nhẹ (rounded ≈ 5px) và nét chữ vừa phải thay vì pill + chữ đậm —
// tỉ lệ học từ maersk.com, cho cảm giác điềm đạm, chuyên nghiệp.
const base =
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-display font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variants = {
  solid:
    'bg-brand-blue-500 text-white hover:bg-brand-blue-600 focus-visible:ring-brand-blue-400',
  outline:
    'border border-white/60 text-white hover:border-white hover:bg-white/10 focus-visible:ring-white',
  ghost: 'text-navy-600 hover:bg-navy-50 focus-visible:ring-navy-300',
  light:
    'bg-white text-navy-600 hover:bg-white/90 focus-visible:ring-white',
  accent:
    'bg-amber-400 text-navy-600 hover:bg-amber-500 focus-visible:ring-amber-300',
} as const;

const sizes = {
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
} as const;

interface SharedProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  showArrow?: boolean;
  className?: string;
  children: ReactNode;
}

function ArrowSlot({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <ArrowRight
      className='h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1'
      aria-hidden
    />
  );
}

type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps> & {
    href?: undefined;
  };

type ButtonAsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedProps> & {
    href: string;
  };

export function CtaButton(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = 'solid',
    size = 'md',
    showArrow = true,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(base, variants[variant], sizes[size], className);

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as ButtonAsLink;
    // legacyBehavior={false} là BẮT BUỘC: ở chế độ legacy (mặc định của Next 12)
    // `Link` không render thẻ DOM nào cả — nó clone thẻ con và BỎ QUA `className`
    // truyền vào, khiến nút mất sạch style và hiện ra như chữ trơn.
    return (
      <Link href={href} legacyBehavior={false} className={classes} {...anchorRest}>
        {children}
        <ArrowSlot show={showArrow} />
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
      <ArrowSlot show={showArrow} />
    </button>
  );
}
