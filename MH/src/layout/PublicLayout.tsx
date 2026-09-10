import setLanguage from 'next-translate/setLanguage';
import { ReactNode, useEffect } from 'react';

import { Footer } from '@/components/public/Footer';
import { Header } from '@/components/public/Header';

/**
 * Layout cho trang public redesign (trang chủ + trang dịch vụ). Khác
 * `layout/HomeLayout.tsx` cũ (nạp qua `dynamic(..., { ssr: false })` trong
 * `_app.tsx`, mất SEO cho toàn bộ trang public): `PublicLayout` là import
 * thường, nên trang gắn `Page.Layout = PublicLayout` được Next.js SSR/SSG
 * như bình thường.
 *
 * Trang cũ (13 trang public hiện có) vẫn dùng `HomeLayout` qua default
 * layout trong `_app.tsx` — không bị ảnh hưởng.
 */
export function PublicLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const langLocal = localStorage.getItem('lang');
    setLanguage(langLocal ?? 'vi');
  }, []);

  return (
    <div className='flex min-h-screen flex-col bg-paper font-display'>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  );
}
