import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge mặc định không biết các class tự định nghĩa trong
 * tailwind.config.js: nó coi `text-display-md` và `text-balance` là màu chữ,
 * nên khi gặp `text-navy-600` phía sau sẽ xoá mất cỡ chữ display. Khai báo
 * chúng đúng nhóm để không bị merge nhầm.
 */
const twMerge = extendTailwindMerge({
  classGroups: {
    'font-size': [{ text: ['display-xl', 'display-lg', 'display-md'] }],
    'text-wrap': [{ text: ['wrap', 'nowrap', 'balance', 'pretty'] }],
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
