/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FileTextIcon,
  HandCoinsIcon,
  LogOutIcon,
  TruckIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  SUPPLIER_COST_STATEMENT,
  SUPPLIER_PAYMENT_MANAGEMENT,
} from '@/routes/routes';
import { ACCSESS_TOKEN, USER } from '@/contants/Storage';
import storage from '@/utils/storage';

const NAV_ITEMS = [
  {
    label: 'Bảng kê chi phí',
    href: SUPPLIER_COST_STATEMENT,
    icon: FileTextIcon,
  },
  {
    label: 'Quản lý chi hộ',
    href: SUPPLIER_PAYMENT_MANAGEMENT,
    icon: HandCoinsIcon,
  },
];

const SupplierSidebar = () => {
  const router = useRouter();
  const { removeAll } = storage();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(USER);
    if (raw) {
      const user = JSON.parse(raw);
      setUsername(user?.username || '');
    }
  }, []);

  const handleLogout = () => {
    removeAll();
    router.push('/login-home');
  };

  return (
    <aside className='flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground'>
      {/* Brand */}
      <div className='flex h-16 items-center gap-3 px-5'>
        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary'>
          <TruckIcon className='h-4 w-4 text-sidebar-primary-foreground' />
        </div>
        <span className='text-sm font-semibold tracking-wide text-sidebar-primary'>
          MH Supplier
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className='flex flex-1 flex-col gap-1 px-3 py-4'>
        <p className='mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40'>
          Menu
        </p>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = router.pathname === href;
          return (
            <Link key={href} href={href} passHref>
              <a
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <Icon className='h-4 w-4 shrink-0' />
                {label}
              </a>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User + Logout */}
      <div className='px-3 py-4'>
        <div className='mb-3 flex items-center gap-3 rounded-md px-3 py-2'>
          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold uppercase text-sidebar-primary'>
            {username.charAt(0) || 'U'}
          </div>
          <span className='truncate text-sm text-sidebar-foreground/80'>
            {username || 'Supplier'}
          </span>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          onClick={handleLogout}
        >
          <LogOutIcon className='h-4 w-4' />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
};

export default SupplierSidebar;
