import clsx from 'clsx';
import { HTMLAttributes } from 'react';

/**
 * Container chuẩn cho toàn bộ trang public redesign — thay các padding cố
 * định `px-[38px]` / `px-[115px]` đang rải rác trong `src/pages/index.tsx` cũ.
 * max-width 1280px, padding ngang co theo breakpoint riêng của redesign
 * (tab/lap/dsk — xem tailwind.config.js).
 */
export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'mx-auto w-full max-w-[1280px] px-5 tab:px-8 lap:px-10',
        className
      )}
      {...props}
    />
  );
}
