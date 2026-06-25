/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hook';
import { hydrateFromAccountTargets } from '@/store/slices/activeTargetSlice';

import { LOGIN_HOME } from '@/contants/endpoint';
import { ACCOUNT_TYPE, ACCSESS_TOKEN } from '@/contants/Storage';
import { fetchAccountTargets } from '@/services/account-target.services';

export function withPrivateRouteSupplier(WrappedComponent: any) {
  return (props: any) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [verified, setVerified] = useState(false);
    // Sau khi refresh, Redux khởi tạo lại nên availableTargets rỗng (chỉ hydrate
    // lúc login). Dùng cờ này để re-hydrate đúng một lần khi vào khu vực NCC.
    const targetsLoaded = useAppSelector(
      (s) => s.activeTarget.availableTargets.length > 0,
    );

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

    // Re-hydrate danh sách hệ A khi vào lại trang (vd sau refresh) để: khôi phục
    // TargetSwitcher đa hệ + re-validate `current` (single-link sẽ bị ép đúng hệ
    // được liên kết). Chạy nền, KHÔNG chặn render (current đã persist ở localStorage).
    useEffect(() => {
      if (!verified || targetsLoaded) return;
      let cancelled = false;
      fetchAccountTargets()
        .then((resp) => {
          if (!cancelled && resp?.targets?.length) {
            dispatch(hydrateFromAccountTargets(resp));
          }
        })
        .catch(() => {
          /* Giữ `current` đã persist; không chặn truy cập khi lỗi mạng. */
        });
      return () => {
        cancelled = true;
      };
    }, [verified, targetsLoaded, dispatch]);

    if (verified) {
      return <WrappedComponent {...props} />;
    }
    return null;
  };
}
