/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { LOGIN_HOME } from '@/contants/endpoint';
import { ACCSESS_TOKEN, A_LINK_TYPE } from '@/contants/Storage';

export function withPrivateRouteSupplier(WrappedComponent: any) {
  return (props: any) => {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const accessToken = localStorage.getItem(ACCSESS_TOKEN);
      const linkType = localStorage.getItem(A_LINK_TYPE);

      // Chỉ account loại supplier mới được vào các màn supplier.
      if (accessToken && linkType === 'supplier') {
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
