import { FileCheck2, LucideIcon, Ship, Truck } from 'lucide-react';

import { ServiceAccent, ServiceSummary } from '@/content/types';

const ICONS: Record<ServiceSummary['icon'], LucideIcon> = {
  truck: Truck,
  ship: Ship,
  'file-check-2': FileCheck2,
};

/**
 * Thang màu Tailwind theo accent dịch vụ. Mọi token đều là chuỗi class
 * ĐẦY ĐỦ, kể cả các biến thể có tiền tố (`hover:`, `group-hover:`) — Tailwind
 * JIT chỉ nhận diện được class khi toàn bộ tên xuất hiện nguyên văn trong
 * source, nên KHÔNG được nội suy `` `hover:${accent.border}` `` ở nơi dùng.
 */
export const ACCENT_CLASSES: Record<
  ServiceAccent,
  {
    bg50: string;
    bg500: string;
    bg600: string;
    text: string;
    border: string;
    ring: string;
    hoverBorder: string;
    groupHoverBg500: string;
    /** Gradient phủ tối dưới ảnh thẻ dịch vụ, màu theo accent — tăng tương phản, tránh ảnh + card trắng phẳng. */
    imageOverlay: string;
  }
> = {
  'brand-green': {
    bg50: 'bg-brand-green-50',
    bg500: 'bg-brand-green-500',
    bg600: 'bg-brand-green-600',
    text: 'text-brand-green-600',
    border: 'border-brand-green-500',
    ring: 'ring-brand-green-300',
    hoverBorder: 'hover:border-brand-green-500',
    groupHoverBg500: 'group-hover:bg-brand-green-500',
    imageOverlay: 'from-brand-green-900/70 via-brand-green-900/10 to-transparent',
  },
  'brand-blue': {
    bg50: 'bg-brand-blue-50',
    bg500: 'bg-brand-blue-500',
    bg600: 'bg-brand-blue-600',
    text: 'text-brand-blue-600',
    border: 'border-brand-blue-500',
    ring: 'ring-brand-blue-300',
    hoverBorder: 'hover:border-brand-blue-500',
    groupHoverBg500: 'group-hover:bg-brand-blue-500',
    imageOverlay: 'from-brand-blue-900/70 via-brand-blue-900/10 to-transparent',
  },
  'brand-teal': {
    bg50: 'bg-brand-teal-50',
    bg500: 'bg-brand-teal-500',
    bg600: 'bg-brand-teal-600',
    text: 'text-brand-teal-600',
    border: 'border-brand-teal-500',
    ring: 'ring-brand-teal-300',
    hoverBorder: 'hover:border-brand-teal-500',
    groupHoverBg500: 'group-hover:bg-brand-teal-500',
    imageOverlay: 'from-brand-teal-900/70 via-brand-teal-900/10 to-transparent',
  },
};

export function ServiceIcon({
  icon,
  className,
}: {
  icon: ServiceSummary['icon'];
  className?: string;
}) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden />;
}
