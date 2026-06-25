/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { LOGIN_HOME } from '@/contants/endpoint';
import { ACCOUNT_TYPE, ACCSESS_TOKEN } from '@/contants/Storage';

export function withPrivateRouteSupplier(WrappedComponent: any) {
  return (props: any) => {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const accessToken = localStorage.getItem(ACCSESS_TOKEN);
      const accountType = localStorage.getItem(ACCOUNT_TYPE);

      // Chỉ account loại supplier mới được vào các màn supplier.
      if (accessToken && accountType === 'supplier') {
        setVerified(true);
      } else {
        router.replace(LOGIN_HOME);
      }
    }, [router]);

    if (verified) {
      return <WrappedComponent {...props} />;
    }
    return null;
  };
}
