import dynamic from 'next/dynamic';
import React from 'react';

const SupplierSidebar = dynamic(() => import('@/container/SupplierSidebar'), {
  ssr: false,
});

const SupplierLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <SupplierSidebar />
      <main className='flex flex-1 flex-col overflow-y-auto'>
        {children}
      </main>
    </div>
  );
};

export default SupplierLayout;
