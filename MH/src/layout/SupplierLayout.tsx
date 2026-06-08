import { MenuIcon, TruckIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';

const SupplierSidebar = dynamic(() => import('@/container/SupplierSidebar'), {
  ssr: false,
});

const SupplierLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <SupplierSidebar open={open} onClose={() => setOpen(false)} />

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
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
