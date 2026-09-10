import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Nút CTA cho trang public redesign. Khác `components/ui/button.tsx` (shadcn
 * gốc, dùng token --primary chung cho toàn app) — component này gắn màu
 * thương hiệu mới + micro-interaction mũi tên trượt khi hover.
 */
const base =
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variants = {
  solid:
    'bg-brand-blue-500 text-white shadow-soft hover:bg-brand-blue-600 hover:shadow-lift focus-visible:ring-brand-blue-400',
  outline:
    'border-2 border-white/70 text-white hover:border-white hover:bg-white/10 focus-visible:ring-white',
  ghost:
    'text-navy-600 hover:bg-navy-50 focus-visible:ring-navy-300',
  accent:
    'bg-amber-400 text-navy-600 shadow-soft hover:bg-amber-500 hover:shadow-lift focus-visible:ring-amber-300',
} as const;

const sizes = {
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
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
    return (
      <Link href={href} className={classes} {...anchorRest}>
        <span className='inline-flex items-center gap-2'>
          {children}
          <ArrowSlot show={showArrow} />
        </span>
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
