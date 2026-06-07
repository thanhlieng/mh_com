/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { LOGIN_HOME } from '@/contants/endpoint';
import { ACCSESS_TOKEN, USER } from '@/contants/Storage';

export function withPrivateRouteSupplier(WrappedComponent: any) {
  return (props: any) => {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const accessToken = localStorage.getItem(ACCSESS_TOKEN);
      const raw = localStorage.getItem(USER);

      if (raw && accessToken) {
        const user = JSON.parse(raw);
        if (user?.a_supplier_id) {
          setVerified(true);
        } else {
          router.replace(LOGIN_HOME);
        }
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
