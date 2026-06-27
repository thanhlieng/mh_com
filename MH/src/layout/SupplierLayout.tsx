import { MenuIcon, TruckIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';

import { ACTIVE_A_TARGET } from '@/contants/Storage';
import { useAppSelector } from '@/store/hook';

const SupplierSidebar = dynamic(() => import('@/container/SupplierSidebar'), {
  ssr: false,
});

/**
 * Đọc target từ localStorage ngay khi mount (sync useState init). Dùng làm
 * fallback khi Redux current chưa hydrate kịp (SSR render với null, store
 * client init đọc localStorage nhưng React paint trước khi useSelector trả
 * giá trị mới) → tránh flicker buttons từ xanh đậm → xanh lá sau reload.
 */
const readPersistedTarget = (): 'mhvn' | 'gp' | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ACTIVE_A_TARGET);
  return raw === 'mhvn' || raw === 'gp' ? raw : null;
};

// Tông màu primary cho phần nội dung khi ở hệ mhvn (#1DA553 → hsl 144 70% 38%).
// gp giữ token mặc định. Áp qua DOM API trong useEffect bên dưới.

const SupplierLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const storeCurrent = useAppSelector((s) => s.activeTarget.current);
  // Áp CSS vars trực tiếp lên DOM qua ref + useEffect, KHÔNG qua `style={}`
  // prop. Lý do: Layout được SSR với storeCurrent=null (server không có
  // window/localStorage). React-Redux v8 `useSyncExternalStore` giữ server
  // snapshot trong hydration phase → React không patch style sau khi store
  // client cập nhật → buttons kẹt màu default. Set CSS vars qua DOM API thì
  // bypass React render và luôn áp dụng sau mount.
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const target =
      storeCurrent === 'mhvn' || storeCurrent === 'gp'
        ? storeCurrent
        : readPersistedTarget();
    if (target === 'mhvn') {
      el.style.setProperty('--primary', '144 70% 38%');
      el.style.setProperty('--ring', '144 70% 38%');
    } else {
      el.style.removeProperty('--primary');
      el.style.removeProperty('--ring');
    }
  }, [storeCurrent]);

  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <SupplierSidebar open={open} onClose={() => setOpen(false)} />

      <div
        ref={contentRef}
        className='flex min-w-0 flex-1 flex-col overflow-hidden'
      >
        {/* Top bar chỉ hiện trên mobile/tablet — nút mở menu */}
        <div className='flex h-12 shrink-0 items-center gap-2 border-b border-border px-4 md:hidden'>
          <button
            onClick={() => setOpen(true)}
            className='rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground'
            aria-label='Mở menu'
          >
            <MenuIcon className='h-5 w-5' />
          </button>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary'>
              <TruckIcon className='h-3.5 w-3.5 text-primary-foreground' />
            </div>
            <span className='text-sm font-semibold'>MH Supplier</span>
          </div>
        </div>

        <main className='flex flex-1 flex-col overflow-y-auto'>{children}</main>
      </div>
    </div>
  );
};

export default SupplierLayout;
