import React from 'react';

import { withPrivateRoute } from '@/routes/withPrivateRoute';

import MenuContainer from './Menu';

function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen flex-col'>
      <div className='flex flex-1 flex-row xs:flex-col'>
        <MenuContainer />
        <div className='flex-1 flex-col overflow-y-auto px-6 xs:p-2'>
          <div className='rounded-md bg-white p-6 xs:p-2'>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default withPrivateRoute(MenuLayout);
