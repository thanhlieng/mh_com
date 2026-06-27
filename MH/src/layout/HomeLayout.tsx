import dynamic from 'next/dynamic';
import setLanguage from 'next-translate/setLanguage';
import { useEffect } from 'react';

import HeaderHome from '@/container/HeaderHome';
const FooterACF = dynamic(() => import('@/components/Footer'), {
  ssr: false,
});
const HomeLayout = ({ children }: { children: JSX.Element }) => {
  useEffect(() => {
    const langLocal = localStorage.getItem('lang');
    if (langLocal) {
      setLanguage(langLocal);
    } else {
      setLanguage('vi');
    }
  }, []);

  return (
    <div className='flex flex-col'>
      <HeaderHome />
      {children}
      <FooterACF />
    </div>
  );
};

export default HomeLayout;
